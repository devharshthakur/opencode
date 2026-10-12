# Static V2 contract checks; this is not a live OpenCode permission evaluator.
require 'yaml'

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

commands = Dir.glob(File.join(ROOT, 'commands/*.md')).to_h do |path|
  relative = path.delete_prefix(ROOT + '/')
  [File.basename(path, '.md'), frontmatter(relative)]
end
agents = Dir.glob(File.join(ROOT, 'agents/*.md')).to_h do |path|
  relative = path.delete_prefix(ROOT + '/')
  [File.basename(path, '.md'), frontmatter(relative)]
end
skills = Dir.glob(File.join(ROOT, 'skills/*/SKILL.md')).to_h do |path|
  relative = path.delete_prefix(ROOT + '/')
  [File.basename(File.dirname(path)), frontmatter(relative)]
end

expected_commands = %w[plan build fix fix:branch fix:worktree fix:pr commit commit:auto implement implement:branch]
check('command names preserved') { commands.keys.sort == expected_commands.sort }
check('skill consolidation') do
  skills.keys.sort == %w[plan build implement commit fix-diagnosis surgical-patch git-isolation migration safe-refactor verify-and-stop tanstack-cli].sort
end
skills.each do |id, data|
  check("#{id}: lowercase skill name matches folder") do
    data['name'].is_a?(String) && data['name'].match?(/\A[a-z0-9-]+\z/) && data['name'] == id
  end
end

commands.each do |name, data|
  check("#{name}: valid V2 command metadata") do
    (data.keys - %w[description agent model subagent subtask]).empty? && data['subagent'] == false
  end
  check("#{name}: selected agent exists") { agents.key?(data['agent']) }
  check("#{name}: arguments retained") { text("commands/#{name}.md").include?('$ARGUMENTS') }
  check("#{name}: no permission-bypassing shell template") { !text("commands/#{name}.md").include?('!`') }
end
check('/plan selects enforced planner') { commands['plan']['agent'] == 'planner' }
check('/fix remains ask') { commands['fix']['agent'] == 'ask' }
check('execution commands remain edit') do
  (expected_commands - %w[plan fix]).all? { |name| commands[name]['agent'] == 'edit' }
end

%w[ask planner chat explore].each do |name|
  profile = agents.fetch(name)
  check("#{name}: no V1 permission fields") { (profile.keys & %w[permission tools prompt maxSteps]).empty? }
  check("#{name}: ordered V2 permission rules") do
    profile['permissions'].is_a?(Array) && profile['permissions'].all? do |rule|
      rule.keys.sort == %w[action effect resource] && %w[allow ask deny].include?(rule['effect'])
    end
  end
  %w[edit execute browser github_create_pull_request aws_delete_resource unknown_mutating_tool].each do |action|
    check("#{name}: denies #{action}") { effect(profile, action, '*') == 'deny' }
  end
  check("#{name}: cannot delegate to general") { effect(profile, 'subagent', 'general') == 'deny' }
end
check('ask delegates only to restricted explore') do
  effect(agents['ask'], 'subagent', 'explore') == 'allow' && agents['explore']['mode'] == 'subagent'
end
%w[planner chat explore].each do |name|
  check("#{name}: denies shell and delegation") do
    effect(agents[name], 'shell', 'git status') == 'deny' && effect(agents[name], 'subagent', 'explore') == 'deny'
  end
end
%w[ask planner explore].each do |name|
  check("#{name}: preserves sensitive-read gates") do
    effect(agents[name], 'read', 'src/app.ts') == 'allow' &&
      effect(agents[name], 'read', '.env') == 'ask' &&
      effect(agents[name], 'read', '.env.example') == 'allow' &&
      effect(agents[name], 'read', '/home/user/.aws/credentials') == 'ask'
  end
end
check('chat denies project reads') { effect(agents['chat'], 'read', 'README.md') == 'deny' }
ask_shell = agents['ask']['permissions'].select { |rule| rule['action'] == 'shell' && rule['effect'] == 'allow' }
check('ask shell uses exact commands, not broad wildcards') do
  !ask_shell.empty? && ask_shell.none? { |rule| rule['resource'].match?(/[?*]/) }
end
ask_shell.each do |rule|
  check("allowed inspection: #{rule['resource']}") { effect(agents['ask'], 'shell', rule['resource']) == 'allow' }
end
['git push', 'git fetch', 'git reset --hard', 'pnpm test', 'sh preflight.sh', 'git diff --output=result.txt'].each do |command|
  check("ask rejects #{command}") { effect(agents['ask'], 'shell', command) == 'deny' }
end

%w[plan build implement commit git-isolation].each do |name|
  check("#{name}: command-only discovery") { skills[name].fetch('metadata').fetch('opencode/autoinvoke') == false }
end
%w[fix:branch fix:worktree fix:pr implement implement:branch].each do |name|
  check("#{name}: isolation dependency authorized") { text("commands/#{name}.md").include?('`git-isolation`') }
end
%w[fix:pr implement implement:branch].each do |name|
  check("#{name}: shared commit dependency authorized") { text("commands/#{name}.md").include?('`commit`') }
end
check('isolation references moved') do
  %w[branch worktree].all? do |mode|
    File.file?(File.join(ROOT, "skills/git-isolation/references/#{mode}.md")) &&
      !File.exist?(File.join(ROOT, "skills/implement/references/#{mode}.md"))
  end
end

# These assertions preserve written gates. They cannot establish that a model obeys them.
check('build preserves explicit approval gate') do
  body = text('skills/build/SKILL.md')
  body.include?('exact plan, approved phases, and explicit approval') &&
    body.include?('request it before mutations or write-producing commands')
end
check('build does not authorize delivery or isolation dependencies') do
  body = text('commands/build.md')
  %w[implement commit git-isolation].none? { |id| body.include?("`#{id}`") } &&
    body.include?('branches/worktrees, stage, commit, push, create PRs, merge, or close issues')
end
check('build contains no isolation/delivery execution snippets') do
  body = text('skills/build/SKILL.md')
  body.include?('no isolation or delivery subsystem') &&
    !body.match?(/`(?:git (?:add|commit|push|switch|checkout|worktree add)|gh (?:pr create|issue close)|worktree_create)\b/)
end
check('dirty branch switching remains blocked') { text('skills/git-isolation/references/branch.md').include?('dirty checkout blocks switching') }
check('worktree isolation preserves original changes') { text('skills/git-isolation/references/worktree.md').include?('Do not stash, reset, clean, discard, switch, or copy') }
check('diagnosis distinguishes hypotheses') { text('skills/fix-diagnosis/SKILL.md').match?(/hypothes/i) }
check('commit style preserves lowercase and optional trivial body') do
  body = text('skills/commit/SKILL.md')
  body.include?('lowercase') && body.match?(/trivial|self-explanatory/) && body.include?('backticks')
end
check('implement uses shared commit procedure') { text('skills/implement/SKILL.md').include?('`commit`') }
check('failed required checks stop delivery') do
  text('skills/implement/SKILL.md').include?('Unverified acceptance or required local checks stop delivery')
end
check('resumption retains base and CI budget') do
  text('skills/implement/SKILL.md').include?('preserve the recorded') &&
    text('skills/implement/references/delivery.md').include?('across retries and resumption')
end
check('delivery limits have one policy owner') do
  body = text('AGENTS.md')
  body.include?('`no commits` excludes staging, push, and PRs') &&
    body.include?('`no push` excludes PRs') && body.include?('`no PR` still permits authorized commits and push')
end
check('CI is bounded and published history append-only') do
  body = text('skills/implement/references/delivery.md')
  body.include?('three') && body.include?('15 minutes') && body.include?('append-only')
end
check('repair reruns original reproduction after regression proof') do
  text('skills/surgical-patch/SKILL.md').include?('rerun the original reproduction')
end
check('changing a confirmed commit plan requires renewed approval') do
  text('commands/commit.md').include?('request renewed approval')
end
check('commit confirmation differs from autonomous callers') do
  %w[implement implement:branch fix:pr].all? do |name|
    text("commands/#{name}.md").match?(/commit-plan (?:confirmation is not required|approval)/)
  end
end
check('PR reporting and issue closure remain gated') do
  body = text('skills/implement/SKILL.md')
  body.include?('verified URL is the final line') && body.include?('`question`') &&
    body.include?('exact repository and issue')
end
check('no unexplained Native Core terminology') do
  Dir.glob(File.join(ROOT, '{commands,skills}/**/*.md')).none? { |path| File.read(path).include?('Native Core') }
end

# Check explicit Markdown reference links relative to their owning file.
Dir.glob(File.join(ROOT, 'skills/**/*.md')).each do |path|
  File.read(path).scan(/\]\(([^)]+)\)/).flatten.each do |link|
    next if link.match?(%r{\A(?:https?://|#)})
    target = link.split('#', 2).first
    check("reference resolves: #{path.delete_prefix(ROOT + '/')} -> #{target}") do
      File.exist?(File.expand_path(target, File.dirname(path)))
    end
  end
  File.read(path).scan(/`((?:\.\.\/)?(?:git-isolation\/)?(?:references|scripts)\/[\w\/-]+\.(?:md|sh))`/).flatten.each do |target|
    check("code reference resolves: #{path.delete_prefix(ROOT + '/')} -> #{target}") do
      File.exist?(File.expand_path(target, File.dirname(path)))
    end
  end
end

puts "PASS: #{CHECKS.length} static workflow checks (no live model/enforcement claims)"
