/**
 * The installed version, and how to read one out of whatever a caller
 * reports.
 *
 * Deliberately free of runtime imports. `ATOMS_VERSION` is re-exported
 * from the package entry, and a leaf module is what keeps the changelog
 * out of a consumer's bundle when they import it.
 *
 * `scripts/generate.ts` fails the build if `ATOMS_VERSION` and
 * `package.json`'s version disagree, so this constant cannot drift from
 * what npm installs.
 */

/**
 * The version of `@neofloai/atoms` this build is.
 *
 * Exported from the package so an app -- or an agent reading an app --
 * can answer "which version is in here" from code rather than from a
 * lockfile:
 *
 * @example
 * import { ATOMS_VERSION } from '@neofloai/atoms';
 * console.error(`Atoms ${ATOMS_VERSION}`);
 */
export const ATOMS_VERSION = '1.0.1';

export interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
  /** Dot-separated identifiers after a `-`, or null for a release. */
  prerelease: readonly string[] | null;
}

/**
 * Answers that mean "it is not in the project", in the words someone
 * would actually reply with.
 *
 * Matched as whole answers rather than substrings: "none" is a
 * not-installed answer, but a path containing the letters n-o-n-e is not.
 */
const NOT_INSTALLED_ANSWERS: readonly string[] = [
  'none',
  'not installed',
  'not-installed',
  'notinstalled',
  'no',
  'nope',
  'absent',
  'missing',
  'nothing',
  'n/a',
  'na',
  'never',
  'first time',
  'new',
];

/**
 * A version anywhere inside a longer string.
 *
 * Loose on purpose: the string this runs against is rarely a bare
 * version. It is `^1.2.0`, or `v1.2.0`, or the whole dependency spec
 * `github:neofloai/atoms#semver:^1.2.0`. Patch is optional because
 * people report `1.2` and mean `1.2.0`.
 */
const VERSION_PATTERN = /(\d+)\.(\d+)(?:\.(\d+))?(?:-([0-9A-Za-z.-]+))?/;

/** Whether an answer means Atoms is not in the project at all. */
export function isNotInstalled(reported: string): boolean {
  return NOT_INSTALLED_ANSWERS.includes(reported.trim().toLowerCase());
}

/**
 * Reads a version out of anything a caller might report.
 *
 * Returns null when there is no version in there to find, which is not a
 * failure but a distinct and common answer: `github:neofloai/atoms#1a2b3c4`
 * is a commit pin, `file:../atoms` is a local link, and neither one names
 * a version. Since Atoms installs from a git ref rather than a registry,
 * the string in a consumer's `package.json` is frequently one of those --
 * the version has to come from the installed tree instead.
 */
export function parseVersion(reported: string): ParsedVersion | null {
  const match = VERSION_PATTERN.exec(reported);
  if (!match) {
    return null;
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: match[3] === undefined ? 0 : Number(match[3]),
    prerelease: match[4] === undefined ? null : match[4].split('.'),
  };
}

/** A parsed version back as `1.2.3` or `1.2.3-rc.1`. */
export function formatVersion(version: ParsedVersion): string {
  const core = `${version.major}.${version.minor}.${version.patch}`;
  return version.prerelease ? `${core}-${version.prerelease.join('.')}` : core;
}

/**
 * Compares two prerelease identifier lists, per semver: numeric
 * identifiers sort below alphanumeric ones, and a shorter list sorts
 * below a longer one that matches it so far.
 */
function comparePrerelease(
  a: readonly string[],
  b: readonly string[]
): number {
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index += 1) {
    const left = a[index];
    const right = b[index];
    if (left === undefined) return -1;
    if (right === undefined) return 1;
    const leftNumeric = /^\d+$/.test(left);
    const rightNumeric = /^\d+$/.test(right);
    if (leftNumeric && rightNumeric) {
      if (Number(left) !== Number(right)) {
        return Number(left) < Number(right) ? -1 : 1;
      }
      continue;
    }
    if (leftNumeric !== rightNumeric) {
      return leftNumeric ? -1 : 1;
    }
    if (left !== right) {
      return left < right ? -1 : 1;
    }
  }
  return 0;
}

/**
 * Orders two parsed versions: negative when `a` is older.
 *
 * A prerelease sorts below the release it leads to, so `1.0.0-rc.1` is
 * older than `1.0.0`. That matters here rather than being pedantry: an
 * install left on a release candidate has to read as behind, not as
 * current.
 */
export function compareVersions(a: ParsedVersion, b: ParsedVersion): number {
  if (a.major !== b.major) return a.major < b.major ? -1 : 1;
  if (a.minor !== b.minor) return a.minor < b.minor ? -1 : 1;
  if (a.patch !== b.patch) return a.patch < b.patch ? -1 : 1;
  if (a.prerelease && !b.prerelease) return -1;
  if (!a.prerelease && b.prerelease) return 1;
  if (a.prerelease && b.prerelease) {
    return comparePrerelease(a.prerelease, b.prerelease);
  }
  return 0;
}

/**
 * Compares two version strings, or null when either cannot be read.
 *
 * The null is why this exists as its own function: a caller comparing
 * strings would have to decide what an unreadable version means, and the
 * answer is never "treat it as zero".
 */
export function compareVersionStrings(a: string, b: string): number | null {
  const left = parseVersion(a);
  const right = parseVersion(b);
  if (!left || !right) {
    return null;
  }
  return compareVersions(left, right);
}
