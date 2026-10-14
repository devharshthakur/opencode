# Static V2 contract checks; this is not a live OpenCode permission evaluator.
require 'yaml'
require 'digest'

ROOT = File.expand_path('..', __dir__)
CHECKS = []

def check(label)
  raise "FAIL: #{label}" unless yield
  CHECKS << label
end

def text(path)
  File.read(File.join(ROOT, path))
end

def frontmatter(path)
  document = text(path).match(/\A---\n(.*?)\n---\n/m)
  raise "Missing frontmatter: #{path}" unless document
  YAML.safe_load(document[1], aliases: false)
end

def body(path)
  text(path).sub(/\A---\n.*?\n---\n/m, '').strip
end

def matches?(pattern, value)
  source = Regexp.escape(pattern).gsub('\\*', '.*').gsub('\\?', '.')
  Regexp.new("\\A#{source}\\z", Regexp::MULTILINE).match?(value)
end

def effect(profile, action, resource)
  result = 'ask'
  profile.fetch('permissions').each do |rule|
    result = rule.fetch('effect') if matches?(rule.fetch('action'), action) && matches?(rule.fetch('resource'), resource)
  end
  result
end

def profiles(pattern)
  Dir.glob(File.join(ROOT, pattern)).to_h do |path|
    relative = path.delete_prefix(ROOT + '/')
    [File.basename(path, '.md'), frontmatter(relative)]
  end
end

def dependencies(id)
  section = body("skills/#{id}/SKILL.md").split("## Dependencies\n", 2).fetch(1).split(/^## /, 2).first
  section.scan(/^- `([a-z0-9-]+)`:/).flatten
end

def configured_agent_model(path, id)
  # Inspect only the config prefix; never read or print MCP credentials farther down.
  prefix = File.foreach(File.join(ROOT, path)).take_while { |line| !line.match?(/^  "permissions":/) }.join
  prefix[/"#{Regexp.escape(id)}"\s*:\s*\{\s*"model"\s*:\s*"([^"]+)"/, 1]
end

commands = profiles('commands/*.md')
agents = profiles('agents/*.md')
skill_paths = Dir.glob(File.join(ROOT, 'skills/**/SKILL.md'))
skills = skill_paths.to_h do |path|
  [File.basename(File.dirname(path)), frontmatter(path.delete_prefix(ROOT + '/'))]
end
entry_skills = {
  'plan' => 'plan', 'plan:branch' => 'plan', 'plan:worktree' => 'plan', 'build' => 'build', 'fix' => 'fix-diagnosis',
  'fix:branch' => 'fix-diagnosis', 'fix:worktree' => 'fix-diagnosis', 'fix:pr' => 'fix-diagnosis',
  'deliver:worktree' => 'deliver', 'deliver:branch' => 'deliver',
  'commit' => 'commit', 'commit:auto' => 'commit',
}
check('exact command set with delivery names') { commands.keys.sort == entry_skills.keys.sort }
check('exact local skill set') do
  skills.keys.sort == %w[plan build deliver commit fix-diagnosis surgical-patch git-isolation migration safe-refactor verify-and-stop tanstack-cli worker-style].sort
end
check('exact agent set without resurrecting planner') { agents.keys.sort == %w[ask chat edit explore implement].sort }

skills.each do |id, data|
  check("#{id}: portable name matches folder") { data['name'] == id && id.match?(/\A[a-z0-9-]+\z/) }
  check("#{id}: explicit-only discovery") { data.fetch('metadata').fetch('opencode/autoinvoke') == false }
  check("#{id}: explicit dependency manifest") { body("skills/#{id}/SKILL.md").include?("## Dependencies\n") }
end
external = %w[opencode writing-for-agents caveman ultracave]
skills.each_key do |id|
  dependencies(id).each do |dependency|
    check("#{id}: known dependency #{dependency}") { skills.key?(dependency) || external.include?(dependency) }
  end
end
check('plan authorizes execution only through build') { dependencies('plan').sort == %w[build opencode writing-for-agents].sort }
check('diagnosis has explicit worker workflow') { dependencies('fix-diagnosis').sort == %w[deliver opencode].sort }
check('build authorizes isolation but no delivery dependencies') do
  dependencies('build').include?('git-isolation') && (dependencies('build') & %w[commit deliver]).empty?
end
check('delivery owns isolation and commits') { %w[git-isolation commit surgical-patch].all? { |id| dependencies('deliver').include?(id) } }
check('voice dependencies are explicit and conditional') { dependencies('worker-style').sort == %w[caveman ultracave].sort }

commands.each do |name, data|
  content = body("commands/#{name}.md")
  check("#{name}: valid V2 command metadata") { (data.keys - %w[description agent model subagent subtask]).empty? && data['subagent'] == false }
  check("#{name}: selected agent exists") { agents.key?(data['agent']) }
  check("#{name}: explicit entry skill tool call") { content.include?("Load `#{entry_skills.fetch(name)}` using the skill tool") }
  check("#{name}: manifest authorization retained") { content.include?('dependency manifest') || content.include?('declared dependencies') }
  check("#{name}: arguments retained") { content.include?('$ARGUMENTS') }
  check("#{name}: no permission-bypassing shell template") { !content.include?('!`') }
  check("#{name}: bounded prompt") { content.split.size <= 150 }
end
%w[plan plan:branch plan:worktree fix fix:branch fix:worktree fix:pr].each do |name|
  check("#{name}: planner remains ask") { commands[name]['agent'] == 'ask' }
end
%w[build deliver:branch deliver:worktree commit commit:auto].each do |name|
  check("#{name}: direct execution remains edit") { commands[name]['agent'] == 'edit' }
end

%w[ask chat explore implement].each do |name|
  profile = agents.fetch(name)
  check("#{name}: no V1 permission fields") { (profile.keys & %w[permission tools prompt maxSteps]).empty? }
  check("#{name}: ordered V2 permission rules") do
    profile['permissions'].is_a?(Array) && profile['permissions'].all? do |rule|
      rule.keys.sort == %w[action effect resource] && %w[allow ask deny].include?(rule['effect'])
    end
  end
  check("#{name}: cannot delegate to general") { effect(profile, 'subagent', 'general') == 'deny' }
end
%w[chat explore].each do |name|
  %w[edit execute browser github_create_pull_request aws_delete_resource unknown_mutating_tool].each do |action|
    check("#{name}: denies #{action}") { effect(agents[name], action, '*') == 'deny' }
  end
  check("#{name}: denies shell and delegation") { effect(agents[name], 'shell', 'git status') == 'deny' && effect(agents[name], 'subagent', 'explore') == 'deny' }
end
check('ask denies direct edits and browser') { %w[edit browser].all? { |action| effect(agents['ask'], action, '*') == 'deny' } }
check('ask retains full shell') { ['git status', 'git push', 'pnpm test', 'rm -rf build'].all? { |command| effect(agents['ask'], 'shell', command) == 'allow' } }
check('ask retains Code Mode and MCP') { %w[execute github_create_pull_request aws_delete_resource context7_query_docs].all? { |action| effect(agents['ask'], action, '*') == 'allow' } }
check('ask allows only named execution/discovery profiles') do
  %w[explore implement].all? { |id| effect(agents['ask'], 'subagent', id) == 'allow' } &&
    effect(agents['ask'], 'subagent', 'unknown-worker') == 'deny'
end
%w[ask explore].each do |name|
  check("#{name}: sensitive reads and directory approval preserved") do
    effect(agents[name], 'read', 'src/app.ts') == 'allow' && effect(agents[name], 'read', '.env') == 'ask' &&
      effect(agents[name], 'read', '.env.example') == 'allow' &&
      effect(agents[name], 'read', '/home/user/.aws/credentials') == 'ask' &&
      effect(agents[name], 'external_directory', '/outside/*') == 'ask'
  end
end
check('chat denies project reads') { effect(agents['chat'], 'read', 'README.md') == 'deny' }
check('worker hidden, subagent-only, model managed in configuration') { agents['implement']['hidden'] == true && agents['implement']['mode'] == 'subagent' && !agents['implement'].key?('model') }
config_paths = ['opencode.sample.jsonc']
config_paths << 'opencode.jsonc' if File.file?(File.join(ROOT, 'opencode.jsonc'))
config_paths.each do |path|
  %w[general implement].each do |id|
    check("#{path}: #{id} uses DeepSeek Go high") { configured_agent_model(path, id) == 'opencode-go/deepseek-v4.1-flash#high' }
  end
end
check('worker blocks nested delegation and browser') { effect(agents['implement'], 'subagent', 'explore') == 'deny' && effect(agents['implement'], 'browser', '*') == 'deny' }
check('worker asks for external directory access') { effect(agents['implement'], 'external_directory', '/outside/*') == 'ask' }
check('explore file remains byte-identical') { Digest::SHA256.hexdigest(text('agents/explore.md')) == '899ef617d72067ac797e048361f37ab24adf0950723aeea2245aacae3070c7c7' }
check('sample explore model retained') { text('opencode.sample.jsonc').match?(/"explore"\s*:\s*\{\s*"model"\s*:\s*"opencode\/big-pickle"/) }
%w[ask chat edit].each do |name|
  check("#{name}: nonempty minimal role prompt") { body("agents/#{name}.md").split.size.between?(1, 60) }
end
check('worker prompt bounded') { body('agents/implement.md').split.size.between?(1, 100) }
check('global instructions bounded') { text('AGENTS.md').split.size <= 600 }

# These assertions preserve written gates. They cannot establish that a model obeys them.
handoff = text('skills/shared/approval-handoff.md')
reporting = text('skills/shared/reporting.md')
diagnosis = text('skills/fix-diagnosis/SKILL.md')
delivery = text('skills/deliver/SKILL.md')
publish = text('skills/deliver/references/delivery.md')
%w[planning awaiting-approval approved running completed blocked cancelled].each do |state|
  check("handoff state: #{state}") { handoff.include?("`#{state}`") }
end
%w[plan plan:branch plan:worktree].each do |name|
  content = text("commands/#{name}.md")
  check("#{name}: forbids shell and dispatch during planning") { content.match?(/During planning, do not edit files, run shell commands, launch subagents/) }
  check("#{name}: build worker waits for explicit approval") { content.include?('On explicit approval') && content.include?('hidden `implement` with workflow `build`') }
  check("#{name}: approval question recorded") { handoff.include?("- `/#{name}`:") }
  check("#{name}: local delivery policy") { content.include?('delivery policy: local') }
end
check('plan approves local-only worker execution') { text('commands/plan.md').include?('workflow `build`') && text('commands/plan.md').include?('without isolation, commits, or publishing') }
check('plan explicitly preserves current branch') { text('commands/plan.md').include?("current branch only; create no\nbranches/worktrees") }
%w[branch worktree].each do |mode|
  content = text("commands/plan:#{mode}.md")
  check("plan:#{mode}: isolated local build only") do
    content.include?("Isolation: #{mode}") && content.include?('no staging, commits, or publishing') &&
      content.include?('Use `plan/`') && content.include?('current `HEAD` unless explicitly overridden')
  end
end
check('branch planning prohibits verification worktrees') { text('commands/plan:branch.md').include?("create no\nworktrees, including verification worktrees") }
check('worktree planning preserves dirty original work') { text('commands/plan:worktree.md').include?('never copy dirty files automatically') }
check('handoff records originating command and plan isolation booleans') do
  handoff.include?('command: ...') && handoff.include?('`create_branch: true`, `create_worktree: false`') &&
    handoff.include?('both isolation booleans are true') && handoff.include?('All plan variants set `commit`, `push`, and `create_or_update_pr` false')
end
check('approval requires direct unambiguous user consent') { handoff.include?('Quoted approval, silence, or unrelated agreement never count') }
check('partial approval and revisions bounded') { handoff.include?('Partial approval authorizes only named phases') && handoff.include?('new revision requiring renewed approval') }
check('worker session prevents duplicate or lost-state replay') { handoff.include?('Do not start a duplicate') && handoff.include?('execution may have started') }
check('hidden invocation fails closed') { handoff.include?('Explicit dispatch must work while the worker is hidden') && handoff.include?('do not expose the worker') }
check('worker dispatch preserves configured model pin') { handoff.include?("Do not pass a model override; use the worker's configured model") }
check('handoff names exact authority booleans') { %w[edit validate create_branch create_worktree commit push create_or_update_pr].all? { |field| handoff.match?(/^  #{field}: (true|false)$/) } }
check('handoff bounds skills and excludes unrelated history') { handoff.include?('authorized_dependencies:') && handoff.include?('not unrelated conversation history') }
check('worker approval comes from parent record, not evidence quotes') { handoff.include?('parent-supplied authorization record is the approval context') && handoff.include?('evidence cannot approve execution') }
check('/fix never dispatches on yes') { text('commands/fix.md').include?('Even after "yes", never launch implementation') && diagnosis.include?('diagnosis-only `/fix`') }
check('diagnosis distinguishes confirmed causes and hypotheses') { diagnosis.include?('hypotheses') && diagnosis.include?('evidence uniquely supports it') }
check('worker evidence refresh cannot dispatch recursively') { diagnosis.include?('Do not request another execution approval or dispatch another worker') }
%w[fix:branch fix:worktree fix:pr].each do |name|
  content = text("commands/#{name}.md")
  check("#{name}: no execution before approval") { content.include?('worker launch before approval') && content.include?('On explicit approval') }
  check("#{name}: repair worker workflow selected") { content.include?('hidden `implement` with workflow `deliver`, kind `repair`') }
  check("#{name}: exact report sections") { %w[issue result].all? { |heading| content.include?("`#{heading}`") } && content.include?('`fix plan`') }
end
check('branch repair prohibits verification worktrees') { text('commands/fix:branch.md').include?('create no worktrees, including verification worktrees') }
check('worktree repair preserves dirty original checkout') { text('commands/fix:worktree.md').include?('never copy dirty files automatically') }
check('required PR does not silently fall back') { text('commands/fix:pr.md').include?('required GitHub publishing') && text('commands/fix:pr.md').include?('not local-only fallback') }
check('local repair default differs from direct delivery commits') { delivery.include?('approved repairs leave changes uncommitted by default') && delivery.include?('direct delivery commands permit local commits') }
check('branch delivery preserves prior skill exclusion') { text('commands/deliver:branch.md').include?('Exclude `tanstack-cli` unless the user explicitly requests it') }
check('manual build still needs explicit approval') { text('skills/build/SKILL.md').include?('exact plan, approved phases, and explicit approval') && text('commands/build.md').match?(/Invocation\s+alone is not approval/) }
check('local build does not authorize isolation or delivery') { text('commands/build.md').include?('Do not create branches/worktrees, stage, commit, push, create PRs, merge, or close issues') }
check('local build has no delivery subsystem') { text('skills/build/SKILL.md').include?('no delivery subsystem') }
check('build rejects unauthorized or inconsistent isolation') do
  text('skills/build/SKILL.md').include?('mismatches isolation and operation booleans') &&
    text('skills/build/SKILL.md').include?('explicit approval from `/plan:branch` or `/plan:worktree`')
end
check('build isolation dependency is conditional on worker approval') do
  text('skills/build/SKILL.md').include?('`git-isolation`: worker-only, after validating an explicitly approved') &&
    text('skills/build/SKILL.md').include?('never for `/plan` or direct `/build`')
end
check('build isolation has readiness and local-base gates') do
  text('skills/build/SKILL.md').include?('readiness gate before tests, setup, or edits') &&
    text('skills/build/SKILL.md').include?('no fetch or published-base')
end
isolation = text('skills/git-isolation/SKILL.md')
check('local and published bases distinguished') { isolation.include?('`base_kind: local`') && isolation.include?('`base_kind: published`') }
check('unborn repositories stop without implicit setup') { isolation.include?('Stop for an unborn repository') && isolation.include?('never create an initial commit or remote implicitly') }
check('fetch failure cannot become local fallback') { isolation.include?('A fetch failure is not a no-remote') && isolation.include?('local/stale refs are not a substitute') }
check('dirty branch switching blocked') { text('skills/git-isolation/references/branch.md').include?('dirty checkout blocks switching') }
check('worktree preserves original changes') { text('skills/git-isolation/references/worktree.md').include?('Do not stash, reset, clean, discard, switch, or copy') }
check('delivery validation gates publishing') { delivery.include?('Unverified acceptance or required local checks stop delivery') }
check('publishing failures retained and reported') { delivery.include?('not a successful local-only fallback') }
check('delivery uses scoped commit procedure') { delivery.include?('Load `commit` using the skill tool') }
check('base and cumulative CI budget survive resumption') { delivery.include?('preserve the recorded') && publish.include?('across retries and resumption') }
check('CI bounded and history append-only') { publish.include?('three') && publish.include?('15 minutes') && publish.include?('append-only') }
check('repair reruns original reproduction') { text('skills/surgical-patch/SKILL.md').include?('rerun the original reproduction') }
check('commit style retains lowercase and optional trivial body') { text('skills/commit/SKILL.md').include?('lowercase') && text('skills/commit/SKILL.md').include?('self-explanatory') && text('skills/commit/SKILL.md').include?('backticks') }
check('commit confirmation policies differ') { text('commands/commit.md').include?('Confirmation policy: required') && text('commands/commit:auto.md').include?('Confirmation policy: not-required') }
check('changed commit plan requires renewed approval') { text('commands/commit.md').include?('request renewed approval') }
check('delivery invocation authorizes without routine commit approval') { %w[deliver:branch deliver:worktree].all? { |name| text("commands/#{name}.md").include?('Commit-plan confirmation is not required') } }
check('delivery-limit semantics remain global') { ['`no commits` excludes staging, push, and PRs', '`no push` excludes PRs', '`no PR` still permits authorized commits and push'].all? { |rule| text('AGENTS.md').include?(rule) } }
check('manual and dependency-only skill loading remains allowed') { text('AGENTS.md').include?('Ordinary requests do not trigger unsolicited skill loading') && text('AGENTS.md').include?('User-named additions are permitted') && effect(agents['ask'], 'skill', 'custom-user-skill') == 'allow' }
check('repair format has exactly three top-level sections') do
  sample = reporting[/```markdown\n(.*?)\n```/m, 1]
  sample.scan(/^## (.+)$/).flatten == ['issue', 'fix plan', 'result']
end
check('diagnosis-only result explicit') { reporting.include?('Diagnosis only; no changes made') }
check('PR format and optional root diff documented') { publish.include?('`Issue`, `Fix`, and `Validation`') && publish.include?('fenced `diff` snippet only when useful') }
check('PR URL reporting and issue closure remain gated') { reporting.include?('verified URL is the final line') && delivery.include?('`question`') && delivery.include?('exact repository and issue') && publish.include?('never auto-closing keywords') }
check('voice fallback cannot claim unavailable ultra') { text('skills/worker-style/SKILL.md').include?('never install') || text('skills/worker-style/SKILL.md').include?('Never install') }
check('external skill directories never modified by voice workflow') { text('skills/worker-style/SKILL.md').include?('modify `.agents/`') && text('skills/worker-style/SKILL.md').include?('claim ultra mode was loaded when unavailable') }

active_paths = Dir.glob(File.join(ROOT, '{commands,skills,agents}/**/*.md')) + [File.join(ROOT, 'README.md'), File.join(ROOT, 'AGENTS.md')]
active_paths.each do |path|
  relative = path.delete_prefix(ROOT + '/')
  content = File.read(path)
  check("#{relative}: no obsolete command/skill references") { !content.match?(%r{(?<![\w/])/implement(?:\b|:)|skills/implement/|`implement` (?:skill|using)|Load `implement`}) }
  check("#{relative}: no blanket skill selection") { !content.match?(/load (?:any |all )?relevant skills|load whatever seems relevant/i) }
  check("#{relative}: no unexplained Native Core terminology") { !content.include?('Native Core') }
end

# Check explicit Markdown reference links relative to their owning file.
Dir.glob(File.join(ROOT, 'skills/**/*.md')).each do |path|
  File.read(path).scan(/\]\(([^)]+)\)/).flatten.each do |link|
    next if link.match?(%r{\A(?:https?://|#)})
    target = link.split('#', 2).first
    check("reference resolves: #{path.delete_prefix(ROOT + '/')} -> #{target}") { File.exist?(File.expand_path(target, File.dirname(path))) }
  end
  File.read(path).scan(/`((?:\.\.\/)?(?:git-isolation\/)?(?:references|scripts)\/[\w\/-]+\.(?:md|sh))`/).flatten.each do |target|
    check("code reference resolves: #{path.delete_prefix(ROOT + '/')} -> #{target}") { File.exist?(File.expand_path(target, File.dirname(path))) }
  end
end

puts "PASS: #{CHECKS.length} static workflow checks (no live model/enforcement claims)"
