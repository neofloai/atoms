/**
 * The release record: what has shipped, what version the tools write code
 * against, and how to tell whether a given install can run that code.
 *
 * This module is the single source of truth for "which version is this
 * and what changed". It is:
 *   - serialized to `data/release.json` by `scripts/generate.ts`
 *     (consumed by the MCP `check_version` tool and the version gate), and
 *   - rendered by the docs changelog page.
 *
 * The problem it exists for: Atoms installs from a git ref, so a
 * consumer's `package.json` often holds a commit SHA rather than a
 * version, and the MCP server has no view of their disk at all. It serves
 * whatever the deployed docs site was built from. When those two drift,
 * an agent pastes in code for a version the project does not have, gets a
 * missing-export error, and "fixes" it by inventing a prop. Every export
 * here is aimed at that: name the current version, say what changed, and
 * give the tools a way to refuse to hand back code they cannot vouch for.
 */

import { RELEASES } from './changelog';
import {
  ATOMS_VERSION,
  compareVersions,
  isNotInstalled,
  parseVersion,
  formatVersion,
} from './version';

import type { Release, ReleaseGuide, VersionCheck } from './types';

export * from './types';
export { RELEASES } from './changelog';
export {
  ATOMS_VERSION,
  compareVersions,
  compareVersionStrings,
  formatVersion,
  isNotInstalled,
  parseVersion,
} from './version';

/**
 * How to find out what is installed.
 *
 * Two commands rather than one, and the order matters. `npm ls` reports
 * what is actually in `node_modules`; reading the dependency line out of
 * the consumer's own `package.json` reports what was *asked for*, which
 * for a git install is usually a ref and not a version at all. An agent
 * that reads the wrong one of those confidently reports a commit SHA as a
 * version.
 */
const COMMANDS = {
  readInstalled: 'npm ls @neofloai/atoms --depth=0',
  readInstalledFallback:
    'node -p "require(\'./node_modules/@neofloai/atoms/package.json\').version"',
  upgrade: `npm install github:neofloai/atoms#semver:^${ATOMS_VERSION}`,
  pin: `npm install github:neofloai/atoms#semver:^${ATOMS_VERSION}`,
} as const;

const SEARCH_KEYWORDS: readonly string[] = [
  'changelog',
  'change log',
  'release',
  'releases',
  'release notes',
  'version',
  'versions',
  'what version',
  'which version',
  'installed version',
  'upgrade',
  'update',
  'updating',
  'bump',
  'semver',
  'migration',
  'migrate',
  'breaking change',
  'breaking changes',
  'deprecated',
  'what changed',
  "what's new",
  'whats new',
  'latest',
  'out of date',
  'outdated',
  'compatibility',
  'compatible',
  // Deliberately no version numbers here. `search_docs` derives them from
  // `releases`, so every published version and tag is searchable without
  // anyone remembering to add two more strings to this list at release
  // time.
  //
  // Nothing describing what a release *contains* belongs here either. The
  // release hit is pushed above components and patterns, so a keyword
  // like `icons` or `bundle size` would hand the changelog to every
  // search for the icon set. Keep this to words that ask about versioning
  // itself.
];

/**
 * The newest release is the current one.
 *
 * Derived rather than restated, so a release added to the changelog is
 * current by virtue of being there. The generator checks it against
 * `package.json`.
 */
const CURRENT = RELEASES[0];

export const release: ReleaseGuide = {
  packageName: '@neofloai/atoms',
  repo: 'neofloai/atoms',
  current: CURRENT.version,
  currentTag: CURRENT.tag,
  // Pinned rather than tracking `current`, which is the whole point of
  // the field: 1.0.1 fixed how the package is bundled and moved no API,
  // so every example `get_component` and `get_pattern` serve still runs
  // unchanged on 1.0.0. A caller on 1.0.0 should be told there is an
  // upgrade worth taking, not refused code that would work.
  //
  // This moves only when a release actually removes or renames something
  // the served code uses -- it is the oldest version that code still runs
  // on, not the oldest version anyone should be on.
  minimumSupported: '1.0.0',
  releases: RELEASES,
  commands: COMMANDS,
  keywords: SEARCH_KEYWORDS,
};

/** Releases strictly newer than `version`, newest first. */
function releasesAfter(
  version: string,
  releases: readonly Release[]
): readonly Release[] {
  const installed = parseVersion(version);
  if (!installed) {
    return [];
  }
  return releases.filter((entry) => {
    const candidate = parseVersion(entry.version);
    return candidate !== null && compareVersions(installed, candidate) < 0;
  });
}

/**
 * Works out where a reported version stands against the current release.
 *
 * `reported` is whatever a caller could find -- `1.0.0`, `^1.0.0`,
 * `v1.0.0`, `github:neofloai/atoms#semver:^1.0.0`, a commit SHA, `none`,
 * or nothing at all. Five of those resolve to a version and three do not,
 * and the three that do not are the common case for a git-installed
 * package, so they get their own statuses rather than being folded into
 * "old".
 *
 * `reported` is always echoed back on the result alongside what was read
 * out of it. A loose parse is the price of accepting real answers, and
 * showing both is what makes a misread visible instead of silent.
 */
export function checkVersion(
  reported: string | undefined,
  guide: ReleaseGuide = release
): VersionCheck {
  const base = { current: guide.current, missed: [] as readonly Release[] };

  if (reported === undefined || reported.trim() === '') {
    return { ...base, status: 'unknown' };
  }

  const trimmed = reported.trim();
  if (isNotInstalled(trimmed)) {
    return { ...base, status: 'not-installed', reported: trimmed };
  }

  const installed = parseVersion(trimmed);
  if (!installed) {
    return { ...base, status: 'unresolved', reported: trimmed };
  }

  const resolved = formatVersion(installed);
  const currentParsed = parseVersion(guide.current);
  const minimumParsed = parseVersion(guide.minimumSupported);

  // Both come from this module's own data, so neither can fail to parse
  // in practice. Handled rather than asserted, because the alternative is
  // a thrown error inside a tool whose whole job is to report a status.
  if (!currentParsed || !minimumParsed) {
    return { ...base, status: 'unresolved', reported: trimmed, resolved };
  }

  const againstCurrent = compareVersions(installed, currentParsed);
  if (againstCurrent > 0) {
    return { ...base, status: 'ahead', reported: trimmed, resolved };
  }
  if (againstCurrent === 0) {
    return { ...base, status: 'current', reported: trimmed, resolved };
  }

  const missed = releasesAfter(resolved, guide.releases);
  const status =
    compareVersions(installed, minimumParsed) < 0 ? 'unsupported' : 'behind';
  return { ...base, status, reported: trimmed, resolved, missed };
}
