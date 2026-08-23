import { z } from 'zod';

import { checkVersion } from '@/src/release';
import { loadRelease } from './data-loader';
import { renderMovedScopes } from './format';

import type { ReleaseManifest } from './types';
import type { VersionCheck } from '@/src/release/types';

/**
 * The version gate: what stands between a caller and a code block.
 *
 * The MCP server has no view of the caller's disk. It serves whatever the
 * deployed docs site was built from, which is the current release -- and
 * the project on the other end is on whatever it installed, which for a
 * package that ships from a git ref is very often something else. When
 * those disagree the failure is not subtle and it is not honest: an agent
 * pastes in a component or a prop that does not exist in the installed
 * version, the import fails, and the agent repairs its own mistake by
 * inventing an API that looks plausible. What ends up in the project is
 * then wrong in a way that reads as intentional.
 *
 * The rule this module enforces, and the only rule it enforces:
 *
 *   **It withholds pasteable code. It never withholds knowledge.**
 *
 * Props, taglines, do/don't lists, token values and related-component
 * pointers always go out, whatever the version situation -- reading them
 * cannot break a build, and an agent that has been refused everything
 * stops asking and starts guessing, which is the outcome this exists to
 * prevent. Code blocks are what get held back, because a code block is an
 * instruction to paste.
 *
 * Four of the seven statuses block, and only one of the four is "your
 * version is too old". The other three are all forms of not knowing --
 * which is the common case, not the edge case, for an install that comes
 * from a git ref rather than a registry.
 */

/**
 * The `installedVersion` input, declared once so every tool asks for it
 * in the same words.
 *
 * Optional rather than required. A required argument would make every
 * existing call a validation error rather than a version warning, and a
 * caller who cannot answer it needs to be told how to find out -- which
 * is a response, not a rejection.
 */
export const installedVersionSchema = z
  .string()
  .optional()
  .describe(
    'The version of @neofloai/atoms actually installed in the target project. Get it by running `npm ls @neofloai/atoms --depth=0` in the project, NOT by reading the dependency line in its package.json -- Atoms installs from a git ref, so that line is usually a commit SHA or a range rather than a version. Pass "none" if Atoms is not installed yet. Omit only if there is no project yet. Code examples are withheld until this is resolved.'
  );

export interface VersionGate {
  check: VersionCheck;
  /** True when pasteable code must be withheld from the response. */
  blocked: boolean;
  /**
   * Markdown to emit. The whole response when `blocked`, a short banner
   * above the code when not. Empty when the installed version is exactly
   * the current release and there is nothing to say.
   */
  notice: string;
}

/** How to resolve the version, quoted the same way everywhere. */
function howToResolve(guide: ReleaseManifest): string {
  return [
    'Run this in the target project:',
    '',
    '```bash',
    guide.commands.readInstalled,
    '',
    '# if npm is unavailable or the tree is unusual',
    guide.commands.readInstalledFallback,
    '```',
    '',
    `Do not read it off the \`${guide.packageName}\` line in the project's own \`package.json\`. Atoms installs from a git ref, so that line is normally \`github:${guide.repo}#<sha>\` or \`github:${guide.repo}#semver:^x.y.z\` — a ref or a range, neither of which is the version that got installed.`,
  ].join('\n');
}

/** What the caller is missing, when they are behind. */
function whatChanged(check: VersionCheck): string {
  if (check.missed.length === 0) {
    return '';
  }
  const versions = check.missed.map((entry) => entry.version).join(', ');
  const moved = renderMovedScopes(check.missed);
  const lines = [
    `Released since ${check.resolved}: ${versions}. Call \`check_version\` with the same \`installedVersion\` for the full notes.`,
  ];
  if (moved) {
    lines.push(
      `Named in those releases: ${moved}. If what you are about to write touches any of them, read the notes before writing it.`
    );
  }
  return lines.join('\n\n');
}

function renderNotice(check: VersionCheck, guide: ReleaseManifest): string {
  const { packageName, current } = guide;
  const upgrade = ['```bash', guide.commands.upgrade, '```'].join('\n');

  switch (check.status) {
    case 'unknown':
      return [
        '## Withheld: the installed Atoms version is not known',
        '',
        `The code for this response is written against ${packageName} ${current}. It has been held back because no \`installedVersion\` was passed, and code naming a component or prop the installed version does not have fails at import — after which the usual repair is to invent an API that looks right.`,
        '',
        howToResolve(guide),
        '',
        'Then call this tool again with `installedVersion` set to what came back. Everything except the code is in this response already, so nothing has to be re-read.',
        '',
        `If Atoms is not in the project yet, pass \`installedVersion: "none"\`. If there is no project yet, you are scaffolding — call \`scaffold_app\`, which installs ${current}.`,
      ].join('\n');

    case 'not-installed':
      return [
        '## Withheld: Atoms is not installed',
        '',
        `Reported: \`${check.reported}\`. Nothing in this response can be pasted into a project that cannot resolve \`${packageName}\`, so the code has been held back — an import of a package that is not there is a build error, not a to-do.`,
        '',
        `Install it first — call \`get_installation\` for the framework's setup steps, or run:`,
        '',
        upgrade,
        '',
        `Then call this tool again with \`installedVersion: "${current}"\`. If the project itself does not exist yet, call \`scaffold_app\` instead: it creates the app with Atoms, the theme and the brand already wired.`,
      ].join('\n');

    case 'unresolved':
      return [
        '## Withheld: that is not a version',
        '',
        `Reported: \`${check.reported}\` — no version could be read out of it. That usually means a commit pin (\`github:${guide.repo}#1a2b3c4\`), a branch-tracking install, a \`file:\`/\`link:\` path, or a range with no version in it. None of those say which API is on disk, so the code has been held back.`,
        '',
        howToResolve(guide),
        '',
        'Then call this tool again with the version that comes back. If the answer is that Atoms genuinely is not there, pass `"none"`.',
      ].join('\n');

    case 'unsupported':
      return [
        '## Withheld: the installed version is too old',
        '',
        `Installed: ${check.resolved} (reported as \`${check.reported}\`). The code in this response is written against ${current}, and ${guide.minimumSupported} is the oldest version it runs on. Pasting it into ${check.resolved} produces missing exports and unknown props.`,
        '',
        whatChanged(check),
        '',
        'Tell the user their project is on an Atoms version this code cannot target, show them the upgrade, and wait for them to take it:',
        '',
        upgrade,
        '',
        'Then call this tool again with the new version. Do not paste the code first and patch the errors — the errors are the version gap, and patching them means writing an API that does not exist.',
      ]
        .filter((part) => part !== '')
        .join('\n');

    case 'behind':
      return [
        `**Atoms ${check.resolved} is installed; ${current} is current.** The code below targets ${current} and runs on ${check.resolved} — nothing it uses was removed or renamed in between — so it is served as-is.`,
        '',
        whatChanged(check),
        '',
        `Worth telling the user they are a release behind, with the upgrade if they want it: \`${guide.commands.upgrade}\`.`,
      ]
        .filter((part) => part !== '')
        .join('\n');

    case 'ahead':
      return [
        `**Atoms ${check.resolved} is installed; this server knows ${current} as current.** The install is newer than the published release record, so the code below may lag what is actually available — likely an install tracking a branch or a commit ahead of the tag. Prefer what the installed package's own types say where they disagree, and check with the user before treating anything here as missing.`,
      ].join('\n');

    case 'current':
      return `**Atoms ${current} — matches the installed version.**`;
  }
}

/**
 * Resolves what a reported version means for a response that contains
 * code.
 *
 * Loads the release record itself rather than taking it as an argument,
 * so a tool adding a version check is one call and cannot forget to pass
 * the guide it compares against.
 */
export async function gateVersion(
  reported: string | undefined
): Promise<VersionGate> {
  const guide = await loadRelease();
  const check = checkVersion(reported, guide);
  const blocked =
    check.status === 'unknown' ||
    check.status === 'not-installed' ||
    check.status === 'unresolved' ||
    check.status === 'unsupported';

  return { check, blocked, notice: renderNotice(check, guide) };
}
