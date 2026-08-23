import { loadRelease } from '../data-loader';
import { renderMovedScopes, renderRelease } from '../format';
import { installedVersionSchema } from '../version-gate';

import { checkVersion } from '@/src/release';

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ReleaseManifest } from '../types';
import type { VersionCheck } from '@/src/release/types';

/** The two commands, as a block, so every branch quotes them alike. */
function resolveBlock(guide: ReleaseManifest): string {
  return [
    '```bash',
    `# in the target project`,
    guide.commands.readInstalled,
    '',
    '# if npm is unavailable or the tree is unusual',
    guide.commands.readInstalledFallback,
    '```',
  ].join('\n');
}

/**
 * The verdict, in one line, and what to do about it.
 *
 * One line per status rather than a paragraph: this is the part the model
 * acts on, and the reasoning that produced it is already in the release
 * notes below.
 */
function renderVerdict(check: VersionCheck, guide: ReleaseManifest): string {
  switch (check.status) {
    case 'unknown':
      return [
        '**Verdict: unknown — nothing was reported.**',
        '',
        'Resolve it before writing any Atoms code into an existing project:',
        '',
        resolveBlock(guide),
        '',
        `Read it out of the installed tree, not the \`${guide.packageName}\` line in the project's \`package.json\` — Atoms installs from a git ref, so that line is normally a commit SHA or a range and not a version at all. If the command returns nothing, Atoms is not installed: call \`get_installation\`. If there is no project yet, call \`scaffold_app\`, which installs ${guide.current}.`,
        '',
        'If neither command can be run — no access to the project, or the user is asking in the abstract — ask the user directly: "which version of @neofloai/atoms is in the project?" Do not assume the current one.',
      ].join('\n');

    case 'not-installed':
      return [
        `**Verdict: not installed** (reported \`${check.reported}\`).`,
        '',
        `Install ${guide.current} before writing anything that imports from ${guide.packageName}:`,
        '',
        '```bash',
        guide.commands.upgrade,
        '```',
        '',
        'Call `get_installation` for the provider wiring that goes with it, or `scaffold_app` if the project does not exist yet.',
      ].join('\n');

    case 'unresolved':
      return [
        `**Verdict: could not read a version out of \`${check.reported}\`.**`,
        '',
        'That is a ref, a path, or a range rather than a version — a commit pin, a branch-tracking install, or a `file:`/`link:` dependency. Resolve the installed version instead:',
        '',
        resolveBlock(guide),
      ].join('\n');

    case 'unsupported':
      return [
        `**Verdict: ${check.resolved} is too old.** ${guide.minimumSupported} is the oldest version the code these tools serve will run on.`,
        '',
        'Tell the user, show them the upgrade, and wait for them to take it before writing Atoms code:',
        '',
        '```bash',
        guide.commands.upgrade,
        '```',
      ].join('\n');

    case 'behind':
      return [
        `**Verdict: ${check.resolved} works, but ${guide.current} is current.** Nothing the served code uses was removed or renamed in between, so there is no need to upgrade before building.`,
        '',
        'Worth offering anyway, since the release notes below are what they are missing:',
        '',
        '```bash',
        guide.commands.upgrade,
        '```',
      ].join('\n');

    case 'ahead':
      return [
        `**Verdict: ${check.resolved} is newer than the ${guide.current} this server knows about.**`,
        '',
        'The install is ahead of the published release record — normally a branch-tracking or commit-pinned install sitting past the tag. Where the installed package\'s own types disagree with what these tools describe, the installed types are right. Nothing to do, but do not report a component as missing on the strength of this server\'s data alone.',
      ].join('\n');

    case 'current':
      return `**Verdict: up to date.** ${check.resolved} is the current release, so everything these tools serve targets exactly what is installed.`;
  }
}

/**
 * The releases worth printing for this caller.
 *
 * A caller who is behind gets the span they missed and nothing else --
 * the whole history is noise when the question is "what do I not have".
 * A caller who reported nothing, or who is current, gets everything,
 * because for them the question is "what is in this thing".
 */
function releasesToShow(
  check: VersionCheck,
  guide: ReleaseManifest
): { heading: string; body: string } {
  if (check.missed.length > 0) {
    const moved = renderMovedScopes(check.missed);
    const scopeLine = moved
      ? `\n\nNamed across these releases: ${moved}.`
      : '';
    return {
      heading: `## What ${check.resolved} is missing`,
      body: `${check.missed.map(renderRelease).join('\n\n')}${scopeLine}`,
    };
  }
  return {
    heading: '## Releases',
    body: guide.releases.map(renderRelease).join('\n\n'),
  };
}

function renderResponse(check: VersionCheck, guide: ReleaseManifest): string {
  const shown = releasesToShow(check, guide);
  const reported =
    check.reported === undefined
      ? '_nothing reported_'
      : check.resolved && check.resolved !== check.reported
        ? `\`${check.reported}\` (read as ${check.resolved})`
        : `\`${check.reported}\``;

  return [
    `# ${guide.packageName} — version check`,
    '',
    `**Current release:** ${guide.current} (\`${guide.currentTag}\`, ${guide.releases[0]?.date ?? 'unreleased'})`,
    `**Installed, as reported:** ${reported}`,
    `**Oldest version the served code runs on:** ${guide.minimumSupported}`,
    '',
    renderVerdict(check, guide),
    '',
    shown.heading,
    '',
    shown.body,
    '',
    '## Installing a fixed version',
    '',
    'Pin to a range so npm resolves against release tags rather than tracking the default branch:',
    '',
    '```bash',
    guide.commands.pin,
    '```',
    '',
    `A bare \`npm install github:${guide.repo}\` tracks the default branch and can change under the project between installs. A commit pin never moves at all, which is right for reproducing a build and wrong for staying current.`,
  ].join('\n');
}

/**
 * Registers the `check_version` tool: what has shipped, what the caller
 * has, and what to do about the difference.
 *
 * Its own tool rather than a line in `get_installation` because it
 * answers three questions that arrive separately -- what version is
 * current, what changed, and is what I have good enough -- and because
 * `get_component` and `get_pattern` withhold their code until it has been
 * answered, so there has to be somewhere to go and answer it.
 */
export function registerCheckVersion(server: McpServer): void {
  server.registerTool(
    'check_version',
    {
      title: 'Check the Atoms version',
      description:
        "Returns the current @neofloai/atoms release, the changelog, and a verdict on the version a project has installed. ALWAYS call this before writing Atoms code into a project that already exists, and whenever the user asks what version they are on, what changed, what is new, or whether they should update. Pass `installedVersion` with what `npm ls @neofloai/atoms --depth=0` reports in that project; omit it to get the full changelog plus the commands to find out. `get_component` and `get_pattern` withhold their code examples until the installed version is known, and this is the tool that resolves it.",
      inputSchema: {
        installedVersion: installedVersionSchema,
      },
    },
    async ({ installedVersion }) => {
      const guide = await loadRelease();
      const check = checkVersion(installedVersion, guide);

      return {
        content: [{ type: 'text', text: renderResponse(check, guide) }],
      };
    }
  );
}
