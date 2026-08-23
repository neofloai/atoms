/**
 * Contracts for the release record: what has shipped, what version the
 * MCP server writes code against, and what a caller's installed version
 * is allowed to be.
 *
 * Serialized to `data/release.json` by `scripts/generate.ts` and served
 * through the MCP `check_version` tool. The docs changelog page renders
 * the same objects, so the release notes a person reads and the ones an
 * agent is told about cannot drift apart.
 */

/**
 * What one line of a release did.
 *
 * `breaking` is separate from `changed` because it is the only kind that
 * decides whether an upgrade can be done by a version bump alone.
 */
export type ChangeKind =
  | 'added'
  | 'changed'
  | 'fixed'
  | 'removed'
  | 'breaking';

export interface ChangeEntry {
  kind: ChangeKind;
  /** One line, in the past tense, saying what a consumer gets. */
  summary: string;
  /**
   * Components, tools or entry points this line touches.
   *
   * The reason there is no `since` field on every component: when a caller
   * is behind, what they need to know is which of the things they are
   * about to use moved. Scopes across the releases between their version
   * and the current one answer that, and they only have to be written for
   * the lines that actually moved something.
   */
  scope?: readonly string[];
}

export interface Release {
  /** Semver, exactly as `package.json` carries it. */
  version: string;
  /** Git tag as published, e.g. `v1.0.0`. */
  tag: string;
  /** ISO date, `YYYY-MM-DD`. */
  date: string;
  /** One line for the nav and the search hit. */
  headline: string;
  /** A paragraph: what this release is, for someone deciding to take it. */
  summary: string;
  changes: readonly ChangeEntry[];
  /**
   * Anything a consumer has to do by hand to move onto this version,
   * beyond changing the version they install. Absent means a bump is the
   * whole upgrade.
   */
  migration?: readonly string[];
}

/**
 * The verdict on a reported version.
 *
 * Six of the seven are not "an old version": most of the ways this goes
 * wrong are a caller who cannot name their version at all, which is the
 * common case for a package installed from a git ref. Each one gets its
 * own status because each one has a different fix.
 */
export type VersionStatus =
  /** Same as the current release. */
  | 'current'
  /** Older, but new enough to run the code these tools serve. */
  | 'behind'
  /** Older than `minimumSupported` — the served code will not run. */
  | 'unsupported'
  /** Newer than this server knows about; its data may be stale. */
  | 'ahead'
  /** Atoms is not in the project yet. */
  | 'not-installed'
  /** Something was reported, but no version could be read out of it. */
  | 'unresolved'
  /** Nothing was reported. */
  | 'unknown';

export interface VersionCheck {
  status: VersionStatus;
  /** What the caller passed, verbatim, so a misread is visible. */
  reported?: string;
  /** The semver read out of it, when one could be. */
  resolved?: string;
  /** The release the MCP server writes code against. */
  current: string;
  /** Releases newer than the resolved version, newest first. */
  missed: readonly Release[];
}

/** Commands quoted verbatim by every tool that talks about versions. */
export interface ReleaseCommands {
  /** Resolve the installed version. */
  readInstalled: string;
  /** Same, when there is no npm on the path or the tree is odd. */
  readInstalledFallback: string;
  /** Move an install onto the current release. */
  upgrade: string;
  /** Install pinned to a range that resolves against release tags. */
  pin: string;
}

export interface ReleaseGuide {
  packageName: string;
  repo: string;
  /** The newest published release. Must equal `package.json` version. */
  current: string;
  /** Git tag for `current`. */
  currentTag: string;
  /**
   * The oldest installed version that can run the code these tools hand
   * back.
   *
   * Equal to `current` while there is one release: there is no older
   * version of a first release to be compatible with.
   */
  minimumSupported: string;
  /** Newest first. */
  releases: readonly Release[];
  commands: ReleaseCommands;
  /** Search terms that should surface the changelog. */
  keywords: readonly string[];
}
