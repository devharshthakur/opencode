# Offline contracts, not a live OpenCode permission evaluator or obedience test.
require 'yaml'
require 'json'

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
  match = text(path).match(/\A---\n(.*?)\n---\n/m)
  raise "Missing frontmatter: #{path}" unless match
  YAML.safe_load(match[1], aliases: false)
end

def body(path)
  text(path).sub(/\A---\n.*?\n---\n/m, '').strip
end

# Strip comments and trailing commas without altering strings (including URLs
# and literal ',}' text). Parse ignored config privately; never print its values.
def jsonc(path)
  source = text(path)
  cleaned = +''
  i = 0
  quoted = false
  escaped = false
  while i < source.length
    char = source[i]
    if quoted
      cleaned << char
      if escaped
        escaped = false
      elsif char == '\\'
        escaped = true
      elsif char == '"'
        quoted = false
      end
      i += 1
    elsif source[i, 2] == '//'
      i = source.index("\n", i) || source.length
    elsif source[i, 2] == '/*'
      finish = source.index('*/', i + 2)
      raise "Unterminated JSONC comment: #{path}" unless finish
      cleaned << ' '
      i = finish + 2
    else
      quoted = char == '"'
      cleaned << char
      i += 1
    end
  end
  result = +''
  quoted = false
  escaped = false
  cleaned.each_char.with_index do |char, index|
    if quoted
      result << char
      if escaped
        escaped = false
      elsif char == '\\'
        escaped = true
      elsif char == '"'
        quoted = false
      end
    else
      quoted = char == '"'
      next if char == ',' && cleaned[(index + 1)..-1].lstrip.match?(/\A[}\]]/)
      result << char
    end
  end
  JSON.parse(result)
rescue JSON::ParserError
  raise "Invalid JSONC: #{path} (contents withheld)", cause: nil
end

def matches?(pattern, value)
  source = Regexp.escape(pattern).gsub('\\*', '.*').gsub('\\?', '.')
  Regexp.new("\\A#{source}\\z", Regexp::MULTILINE).match?(value)
end

BASE_RULES = [
  { 'action' => '*', 'resource' => '*', 'effect' => 'allow' },
  { 'action' => 'external_directory', 'resource' => '*', 'effect' => 'ask' },
  { 'action' => 'read', 'resource' => '*.env', 'effect' => 'ask' },
  { 'action' => 'read', 'resource' => '*.env.*', 'effect' => 'ask' },
  { 'action' => 'read', 'resource' => '*.env.example', 'effect' => 'allow' },
].freeze

def effect(profile, action, resource, global = [])
  result = 'ask'
  (BASE_RULES + global + profile.fetch('permissions', [])).each do |rule|
    if matches?(rule.fetch('action'), action) && matches?(rule.fetch('resource'), resource)
      result = rule.fetch('effect')
    end
  end
  result
end

def profiles(pattern)
  Dir.glob(File.join(ROOT, pattern)).to_h do |path|
    [File.basename(path, '.md'), frontmatter(path.delete_prefix(ROOT + '/'))]
  end
end

agents = profiles('agents/*.md')
commands = profiles('commands/*.md')
skills = Dir.glob(File.join(ROOT, 'skills/**/SKILL.md')).to_h do |path|
  [File.basename(File.dirname(path)), frontmatter(path.delete_prefix(ROOT + '/'))]
end
check('exactly four profiles') { agents.keys.sort == %w[chat dev explore implement] }
check('exactly two primary profiles') do
  agents.select { |_, data| data['mode'] == 'primary' }.keys.sort == %w[chat dev]
end
check('thirteen workflow commands') do
  commands.keys.sort == %w[ask build commit commit:auto fix fix:branch fix:worktree plan plan:branch plan:worktree pr quick setup].sort
end
check('six explicit-only local workflow skills') do
  skills.keys.sort == %w[build commit fix git-isolation plan pr]
end

# Written PR contracts, not live GitHub/CLI behavior or model obedience proof.
pr = text('skills/pr/SKILL.md')
offer = text('skills/shared/pr-offer.md')
templates = text('skills/pr/references/templates.md')
pr_command = body('commands/pr.md')
check('pr: explicit-only, current-session command with arguments') do
  skills.fetch('pr').dig('metadata', 'opencode/autoinvoke') == false &&
    commands.fetch('pr') == { 'description' => 'Commit task changes, push a verified head branch, and create or update a GitHub PR', 'subagent' => false } &&
    pr_command.include?('Load `pr` using the skill tool') && pr_command.include?('$ARGUMENTS')
end
check('pr: strict base/draft shorthand and new-PR main default') do
  ['yes :<branch>', 'yes draft', 'yes :<branch> draft', '/pr [:<base>] [draft]',
   'reject unknown/duplicate arguments and empty bases', 'Bare branch names are not shorthand',
   '`main` is the default for new PRs only'].all? { |phrase| offer.include?(phrase) }
end
check('pr: completion offer is plain text and parent-only') do
  offer.include?('plain-text statement, never the `question` tool') &&
    offer.include?('Only the parent `dev` session') &&
    ['read-only answers', 'unfinished tasks', 'worker/Todo reports', 'completed PR delivery',
     'no-PR/no-push/no-commit'].all? { |phrase| offer.include?(phrase) }
end
check('pr: approval is separate from local-only build authority') do
  offer.include?('latest unambiguous pending PR') && offer.include?('Earlier plan') &&
    offer.include?('does not authorize PR delivery') && offer.include?('never rewrite a local-only worker') &&
    offer.include?('load `pr` using the skill tool')
end
check('pr: scoped commit dependency does not publish or emit recursive offers') do
  pr.include?('load `commit` using the skill tool') && pr.include?('Confirmation policy: not-required') &&
    pr.include?('inner commit stops at local verification') &&
    text('skills/commit/SKILL.md').include?('do not emit an inner completion offer')
end
check('pr: verified remotes, forks, main existence, and complete outgoing history') do
  ['do not assume `origin`', 'base repository from the head/push repository',
   'A missing base is a blocker', 'complete outgoing diff and history',
   'Unrelated commits', 'Preserve unrelated work'].all? { |phrase| pr.include?(phrase) }
end
check('pr: avoid base pushes and destructive publication') do
  ['Never push directly to a base/protected branch', 'no stash, reset, clean',
   'non-fast-forward rejection blocks delivery', 'No force-push', 'No new worktree'].all? { |phrase| pr.include?(phrase) }
end
check('pr: matching open PR reuse, state preservation, and uncertain-outcome reconciliation') do
  ['Reuse a matching existing open PR', 'retain their base/draft state',
   'Preserve human-written', 'stop if ownership is unclear',
   'recheck for an existing matching open PR', 'inspect remote state before any',
   'Never duplicate a PR'].all? { |phrase| pr.downcase.include?(phrase.downcase) }
end
check('pr: create type labels only when missing and preserve metadata') do
  pr.include?('Create it only if absent') && pr.include?('never use `--force`') &&
    pr.include?('colors/descriptions') && pr.include?('silently omit the requested label')
end
check('pr: conventional title, explicit create targets, and verified URL ending') do
  ['Conventional Commit', '--repo', '--base', '--head', '--draft', '--label',
   '--body-file', 'published head SHA', 'verified PR URL is the',
   'final line', 'Do not emit a PR offer'].all? { |phrase| pr.include?(phrase) }
end
check('pr: adaptable fix template uses requested human-readable sections') do
  fix = templates.split('## Fix', 2).last.split('## Performance', 2).first
  ['## Issue', '## Root Cause', '## The Fix', '## Validation Checklist',
   '## Review Checklist', '“Cause”'].all? { |phrase| fix.include?(phrase) } &&
    templates.include?('rename/reorder headings') && pr.include?('templates') && pr.include?('references, not forms')
end
check('pr: other type templates and honest GFM evidence') do
  ['## Performance', '## Feature', '## Refactor / Style',
   '## Chore / Docs / Test / Build / CI / Revert', '<details>', '> [!IMPORTANT]',
   'No Mermaid unless requested', 'no Merge Danger section'].all? { |phrase| templates.include?(phrase) } &&
    pr.include?('pending reviewer actions stay unchecked') && pr.include?('not fabricated') &&
    pr.include?('separate explicit closure authorization')
end
check('pr: completion integrations point to the shared protocol') do
  ['skills/shared/reporting.md', 'skills/shared/approval-handoff.md', 'skills/commit/SKILL.md'].all? do |path|
    text(path).include?('pr-offer.md')
  end && text('commands/quick.md').include?('~/.config/opencode/skills/shared/reporting.md') &&
    text('AGENTS.md').include?('~/.config/opencode/skills/shared/pr-offer.md')
end

agents.each do |id, profile|
  check("#{id}: native V2 metadata") do
    (profile.keys & %w[permission tools prompt maxSteps temperature]).empty? &&
      profile.fetch('permissions').all? do |rule|
        rule.keys.sort == %w[action effect resource] && %w[allow ask deny].include?(rule['effect'])
      end
  end
  check("#{id}: concise nonempty role") { body("agents/#{id}.md").split.size.between?(1, 70) }
  check("#{id}: model has one authoritative config location") { !profile.key?('model') }
end
%w[explore implement].each do |id|
  check("#{id}: subagent-only, discoverable") do
    agents[id]['mode'] == 'subagent' && agents[id]['hidden'] == false
  end
  check("#{id}: no recursive delegation") { effect(agents[id], 'subagent', '*') == 'deny' }
end

configs = ['opencode.sample.jsonc']
configs << 'opencode.jsonc' if File.file?(File.join(ROOT, 'opencode.jsonc'))
configs.each do |path|
  config = jsonc(path)
  check("#{path}: root defaults") do
    config['default_agent'] == 'dev' && config['model'] == 'opencode-go/deepseek-v4.1-flash'
  end
  check("#{path}: supported model-level low default") do
    config.dig('providers', 'opencode-go', 'models', 'deepseek-v4.1-flash', 'settings', 'reasoningEffort') == 'low'
  end
  expected_models = {
    'dev' => 'opencode-go/deepseek-v4.1-flash#low',
    'chat' => 'opencode-go/deepseek-v4.1-flash#high',
    'explore' => 'opencode-go/muse-spark-1.3-contributor#medium',
    'implement' => 'opencode-go/deepseek-v4.1-flash#high',
  }
  expected_models.each do |id, model|
    check("#{path}: #{id} model pin") { config.dig('agents', id, 'model') == model }
  end
  %w[build plan general].each do |id|
    check("#{path}: unused builtin #{id} disabled") { config.dig('agents', id, 'disabled') == true }
  end
  check("#{path}: no retired model profiles") { (config.fetch('agents').keys & %w[ask edit]).empty? }
  servers = config.dig('mcp', 'servers')
  check("#{path}: native MCP shape") { servers.is_a?(Hash) && config['mcp'].keys == ['servers'] }
  check("#{path}: only Context7 enabled") do
    servers.reject { |_, server| server['disabled'] }.keys == ['context7']
  end
  check("#{path}: integration definitions retained") { servers.length == 15 }
  servers.each do |id, server|
    check("#{path}: #{id} native enablement/timeouts") do
      !server.key?('enabled') && [true, false].include?(server['disabled']) &&
        (!server.key?('timeout') || server['timeout'].is_a?(Hash))
    end
  end
  check("#{path}: standard summary-compaction tail") do
    config.dig('compaction', 'auto') == false && config.dig('compaction', 'keep', 'tokens') == 30000 && !config.key?('warming')
  end
  check("#{path}: unsupported experiments removed") { !config.key?('experimental') }
  %w[shell edit execute subagent unknown_mutating_tool].each do |action|
    check("#{path}: dev allows #{action}") { effect(agents['dev'], action, '*', config['permissions']) == 'allow' }
  end
  check("#{path}: dev overrides sensitive/external asks by explicit choice") do
    effect(agents['dev'], 'read', '.env', config['permissions']) == 'allow' &&
      effect(agents['dev'], 'external_directory', '/outside/*', config['permissions']) == 'allow'
  end
end
check('sample contains no inline credentials') do
  sample = jsonc('opencode.sample.jsonc')
  sample.dig('mcp', 'servers', 'context7', 'headers', 'CONTEXT7_API_KEY') == '{env:CONTEXT7_API_KEY}' &&
    sample.dig('mcp', 'servers', 'github', 'headers', 'Authorization') == 'Bearer {env:GITHUB_MCP_TOKEN}'
end
check('local credential-bearing configuration stays ignored') { text('.gitignore').lines.map(&:strip).include?('opencode.jsonc') }

%w[shell edit execute browser subagent skill github_create_pull_request unknown_mutating_tool].each do |action|
  check("explore denies #{action}") { effect(agents['explore'], action, '*') == 'deny' }
end
%w[read glob grep webfetch websearch].each do |action|
  check("explore permits native #{action}") { effect(agents['explore'], action, 'src/auth.ts') == 'allow' }
end
%w[.env .env.local secret.pem .npmrc .pypirc opencode.jsonc /home/u/.config/opencode/opencode.jsonc /home/u/.aws/credentials].each do |resource|
  check("explore protects #{resource}") { effect(agents['explore'], 'read', resource) == 'deny' }
end
check('explore permits an example env file') { effect(agents['explore'], 'read', '.env.example') == 'allow' }
%w[read glob grep shell edit subagent opencode_models github_create_pull_request].each do |action|
  check("chat denies project action #{action}") { effect(agents['chat'], action, '*') == 'deny' }
end
check('chat permits only approved documentation through Code Mode') do
  effect(agents['chat'], 'execute', '*') == 'allow' &&
    effect(agents['chat'], 'context7_query_docs', '*') == 'allow'
end
check('CLI prompts protect non-dev profiles') { jsonc('cli.json').dig('session', 'permissions') == 'prompt' }

commands.each do |id, data|
  content = body("commands/#{id}.md")
  check("#{id}: current session/model retained") do
    (data.keys - %w[description subagent]).empty? && data['subagent'] == false
  end
  check("#{id}: arguments preserved") { content.include?('$ARGUMENTS') }
  check("#{id}: no permission-bypassing command shell interpolation") { !content.include?('!`') }
  check("#{id}: concise command") { content.split.size <= 150 }
end
skills.each do |id, data|
  check("#{id}: portable explicit-only skill") do
    data['name'] == id && data.dig('metadata', 'opencode/autoinvoke') == false
  end
  check("#{id}: staged dependency manifest") { body("skills/#{id}/SKILL.md").include?('## Dependencies') }
end
check('ask is read-only, not unsolicited planning') do
  content = body('commands/ask.md')
  content.include?('No shell execution, edits, implementation dispatch, or external mutation') &&
    content.include?('Do not create an implementation plan unless asked')
end
check('quick bypasses planning without authorizing delivery') do
  content = body('commands/quick.md')
  content.include?('regardless of complexity') && content.include?('not isolation, staging, commits, or publishing') &&
    content.include?('Do not delegate implementation')
end
check('manual build is direct and needs prior approval') do
  content = body('commands/build.md')
  content.include?('invocation alone is not approval') && content.include?('does not prepare isolation') &&
    content.include?('do not launch an implementation worker')
end
%w[plan plan:branch plan:worktree].each do |id|
  content = body("commands/#{id}.md")
  check("#{id}: bounded shell discovery preserves approval and cleanup gates") do
    content.include?("under `plan`'s shell boundary") && content.include?('read-only `explore`') &&
      content.include?('Shell inspection and disposable local services are allowed') &&
      content.include?('no repository writes, Git mutations, or implementation dispatch before approval') &&
      content.include?('Follow shared cleanup before requesting approval') &&
      !content.include?('No shell, edits')
  end
  check("#{id}: dependency manifest and one approval-bound worker") do
    content.include?('dependency manifest') && content.include?('approval dispatches one `implement` worker')
  end
end

# Written setup contracts, not proof of source comprehension or live model behavior.
setup_command = body('commands/setup.md')
setup = text('skills/plan/references/setup.md').gsub(/\s+/, ' ')
check('setup: loads plan and its scoped reference before discovery') do
  setup_command.include?('Load `plan` using the skill tool') &&
    setup_command.include?('dependency manifest only at written triggers') &&
    setup_command.include?('Before discovery, read `~/.config/opencode/skills/plan/references/setup.md`') &&
    setup_command.include?('Preserve the selected session model and agent') &&
    setup_command.include?('`dev`, not `chat`')
end
check('setup: bounded discovery and local approval retain shared protections') do
  ["under `plan`'s shell boundary", 'read-only `explore`',
   'no repository writes, Git mutations, or implementation dispatch before approval',
   'Follow shared cleanup before requesting approval',
   'Approve and implement this plan locally, without isolation, commits, or publishing?',
   'approval dispatches one `implement` worker through the shared handoff procedure',
   'Never replay uncertain or completed work', '`/build` is the explicitly selected direct alternative'].all? do |phrase|
    setup_command.include?(phrase)
  end
end
check('setup: flexible inputs and bounded, version-aware source discovery') do
  ['pasted documentation text, Markdown, documentation URLs, composer attachments',
   'setup skill references', 'A skill reference alone is sufficient',
   'load that explicitly supplied skill using the skill tool',
   'never install a missing skill automatically', 'newly discovered required references',
   'avoid crawling entire documentation sites', 'Resolve relative links',
   'version-pinned instructions', 'Surface material source conflicts',
   'If essential content is inaccessible', 'Never send credentials or private project content'].all? do |phrase|
    setup.include?(phrase)
  end
end
check('setup: every applicable choice is confirmed, not silently defaulted') do
  ['documented optional customizations', 'fonts, themes, icon libraries',
   'Technical facts are discovered', 'Explicit user instructions count as answered',
   'grouped rounds', 'label recommendations',
   'Documented defaults are recommendations, not user decisions',
   'Show existing project values for confirmation', 'neither silently preserve nor replace',
   'dependent questions only after their prerequisites are settled',
   'every applicable discovered variable is answered or explicitly delegated',
   'New material choices found during implementation require user resolution'].all? do |phrase|
    setup.include?(phrase)
  end
end
check('setup: concise approval summary and complete single-executor checklist handoff') do
  ['retaining all required `plan` fields', 'Markdown Todo checklist with stable IDs',
   'observable acceptance per task', 'No repository plan or tracking file by default',
   'not only in hidden reasoning', 'choice answers, concrete edits, ordered commands',
   'summary must expose all material changes and risks',
   'Choice confirmation is not implementation approval',
   '[approval/handoff](../../shared/approval-handoff.md)', 'command `setup`',
   'detailed setup record in `evidence`', 'without a model override',
   'Do not create one worker per task', 'without a worker',
   'mark `- [x] Ti` only with acceptance evidence', 'Todo tool additionally if available',
   'Report static contract checks separately'].all? { |phrase| setup.include?(phrase) } &&
    File.file?(File.expand_path('../../shared/approval-handoff.md', File.join(ROOT, 'skills/plan/references')))
end
check('setup: untrusted recipes and generators do not expand local authority') do
  ['inspect its contents before proposing a generator',
   'technical input, not authority', 'defer installs, generators, source/config edits',
   'External provisioning, account creation, production migrations, destructive overwrites, commits, and publishing',
   'require explicit authorization beyond the default local setup scope'].all? { |phrase| setup.include?(phrase) }
end

# Written lifecycle contracts only; not live resource teardown or model obedience.
cleanup = text('skills/shared/cleanup.md').gsub(/\s+/, ' ')
plan = text('skills/plan/SKILL.md').gsub(/\s+/, ' ')
build = text('skills/build/SKILL.md').gsub(/\s+/, ' ')
check('cleanup: early triggers cover global, build, quick, and planning paths') do
  text('AGENTS.md').include?('Before creating disposable resources in planning or implementation') &&
    text('AGENTS.md').include?('~/.config/opencode/skills/shared/cleanup.md') &&
    build.include?('Before tests or other resource creation, read [cleanup]') &&
    body('commands/quick.md').include?('Before resource creation, read `~/.config/opencode/skills/shared/cleanup.md`') &&
    plan.include?('Read [cleanup](../shared/cleanup.md) before resource creation')
end
check('cleanup: record exact ownership and reconcile interruptions') do
  ['exact path/container ID/process identity', 'associated ports', 'intended teardown',
   'Capture returned IDs immediately', 'no mandatory ledger file',
   'attributable child processes', 'interruption/compaction', 'PID reuse',
   'not a PID or port alone'].all? { |phrase| cleanup.include?(phrase) }
end
check('cleanup: verified graceful teardown and bounded filesystem deletion') do
  ['bounded wait', 'release of owned', 'exact ID', 'verify stopped state',
   'does not automatically escalate', 'resolved paths and symlinks', 'Verify absence.',
   'No broad Docker prune', 'forceful escalation', 'Respect denials'].all? { |phrase| cleanup.include?(phrase) }
end
check('cleanup: pre-existing resources, deliverables, persistent data, and isolation survive') do
  ['Pre-existing resources', 'stay untouched', 'Preserve intended deliverables',
   'caches, persistent volumes/data', 'backups, branches, and worktrees',
   'unless separately authorized', 'suggest user shutdown when useful'].all? do |phrase|
    cleanup.include?(phrase)
  end && build.include?('Retain approved isolation') && !build.include?('automatic cleanup')
end
check('cleanup: planning, implementation, and failure gates require evidence') do
  ['before the final response or worker handoff', 'before presenting the approval-ready',
   'failure, cancellation, or a blocker', 'report incomplete cleanup',
   'missing verification', 'Abrupt crashes or forced termination'].all? { |phrase| cleanup.include?(phrase) } &&
    text('skills/shared/reporting.md').include?('Cleanup verification:') &&
    text('skills/shared/approval-handoff.md').include?('Assess worker cleanup evidence') &&
    build.include?('report exact cleanup blockers')
end
check('planning: shell scope allows disposable runtime state, not implementation') do
  ['without separate confirmation for each start', 'outside the checkout',
   'keep repository files unchanged', 'read-only repository', 'local-only listeners',
   'no source/config edits, installs, checkout-writing', 'Git mutations',
   'including fetch or isolation preparation', 'Ask first for privileged containers',
   'host-wide changes, persistent storage, or unclear side effects',
   'Tool permission', 'parent `dev` performs shell operations',
   'before presenting the approval-ready', 'instruction-based, not a sandbox'].all? { |phrase| plan.include?(phrase) } &&
    !plan.include?('no shell, edits') &&
    !text('skills/shared/approval-handoff.md').gsub(/\s+/, ' ').include?('never run shell or fetch') &&
    !text('skills/shared/pr-offer.md').include?('read-only `/ask` or `/plan*`')
end
%w[fix fix:branch fix:worktree].each do |id|
  content = body("commands/#{id}.md")
  check("#{id}: diagnoses on temp branch and cleans up before approval") do
    content.include?('`fix/diag-<slug>`') && content.include?('`diag-branch.sh`') &&
      content.include?('delete the temporary branch and switch back to the parent branch before asking for approval')
  end
  check("#{id}: uses Markdown Todo checklist and approval-bound implement worker") do
    content.include?('dependency manifest') && content.include?('Markdown Todo checklist') &&
      content.include?('`single-worker`') && content.include?('`per-todo-worker`') &&
      content.include?('Approval dispatches `implement`')
  end
end
check('branch mode never creates worktrees') do
  %w[plan:branch fix:branch].all? { |id| text("commands/#{id}.md").include?('Create no worktrees') }
end
check('worktree mode preserves original work') do
  %w[plan:worktree fix:worktree].all? { |id| text("commands/#{id}.md").include?('never copy dirty files or credentials') }
end
check('fix skill defines temp-branch diagnosis, Todo checklist, and adaptive worker dispatch') do
  fix_skill = text('skills/fix/SKILL.md')
  ['diag-branch.sh enter', 'diag-branch.sh leave', 'diagnosing-bugs', 'Markdown',
   'single-worker', 'per-todo-worker', 'fix/<task-slug>'].all? { |phrase| fix_skill.include?(phrase) }
end
check('commit confirmation policies differ') do
  text('commands/commit.md').include?('Confirmation policy: required') &&
    text('commands/commit:auto.md').include?('Confirmation policy: not-required')
end
check('commit scope is attributable, not whole workspace') do
  %w[commit commit:auto].all? { |id| text("commands/#{id}.md").include?('not every workspace change') }
end
check('commits preserve hooks and explicit-path staging') do
  text('skills/commit/SKILL.md').include?('never disable them') && text('skills/commit/SKILL.md').include?('Stage explicit paths only')
end
handoff = text('skills/shared/approval-handoff.md')
%w[planning awaiting-approval approved running completed blocked cancelled].each do |state|
  check("handoff state #{state}") { handoff.include?("`#{state}`") }
end
%w[create_branch create_worktree stage commit push create_or_update_pr].each do |flag|
  check("handoff bounds #{flag}") { handoff.match?(/^  #{flag}: false$/) }
end
check('handoff preserves revised/partial approval and execution identity') do
  ['Revisions require renewed approval', 'partial approval limits phases', 'worker ID', 'do not replay',
   'successful tool return alone', 'Do not pass a model'].all? { |phrase| handoff.include?(phrase) }
end
check('detailed plans guide smaller workers without a mandatory tracker') do
  plan = text('skills/plan/SKILL.md')
  ['Small-model workers', 'stable IDs', 'exact repository checks', 'No tracker is required',
   'Save a plan/checkpoint file only when'].all? { |phrase| plan.include?(phrase) }
end
check('independent judgment is proportionate') do
  guidance = text('AGENTS.md')
  ['Evaluate independently', 'evidence and tradeoffs', 'Respect an informed choice',
   'routine disagreement needs no grilling skill'].all? { |phrase| guidance.include?(phrase) }
end
check('global instructions stay bounded') { text('AGENTS.md').split.size <= 450 }
check('contributor privacy is documented') { text('README.md').include?('training') && text('README.md').include?('not zero-data-retention') }
check('pilot remains inactive') { text('README.md').include?('inactive') && !text('plugins/skill-policy.js').include?('workflow-pilot') }

Dir.glob(File.join(ROOT, 'skills/**/*.md')).each do |path|
  File.read(path).scan(/\]\(([^)]+)\)/).flatten.each do |link|
    next if link.match?(%r{\A(?:https?://|#)})
    target = link.split('#', 2).first
    check("reference resolves: #{path.delete_prefix(ROOT + '/')} -> #{target}") do
      File.exist?(File.expand_path(target, File.dirname(path)))
    end
  end
end

puts "PASS: #{CHECKS.length} offline workflow contracts (live behavior still needs fresh-session validation)"
