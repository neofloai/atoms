import type { Release } from './types';

/**
 * Every published release, newest first.
 *
 * Hand-written rather than generated from commits. A commit log says what
 * changed in the repo; a release note says what changed for someone who
 * installed the package, and those are different lists -- most commits
 * here move docs, data or the MCP server and are invisible to a consumer.
 *
 * One entry per version, added in the same commit that bumps
 * `package.json` and `ATOMS_VERSION`. `scripts/generate.ts` fails the
 * build if the newest entry here and the package version disagree.
 *
 * Keep `scope` populated on any line that moves a component's API. It is
 * what lets `check_version` tell a caller which of the things they are
 * about to use changed since their install, without a `since` field on
 * every component.
 */
export const RELEASES: readonly Release[] = [
  {
    version: '1.0.0',
    tag: 'v1.0.0',
    date: '2026-08-23',
    headline: 'First release. The component library, the tokens, the patterns and the MCP endpoint.',
    summary:
      'The initial release, and the first version that can be installed by a range rather than a commit. Everything the design system had been building towards is in it: 44 components wrapping MUI v9 behind the Neoflo API, design tokens carrying both colour schemes, six whole-screen patterns, and an MCP endpoint that serves all three to an AI editor. Before this, a bare install tracked the default branch and could change under you between installs -- from 1.0.0 on, a version is a fixed thing, and what changes between two of them is written down here.',
    changes: [
      {
        kind: 'added',
        summary:
          '44 components across Layout, Inputs, Data Display, Navigation, Feedback and Motion. Each one wraps an MUI v9 component and renames its API to the Neoflo vocabulary, so `variant="primary"` rather than `variant="contained"`.',
      },
      {
        kind: 'added',
        summary:
          '`NeofloThemeProvider` -- the single provider an app mounts once. It applies the theme, the CSS baseline, the self-hosted brand fonts (DM Sans, Instrument Serif) and the Phosphor icon defaults, and it takes a `defaultMode` prop to pin light, dark, or follow the OS.',
        scope: ['NeofloThemeProvider'],
      },
      {
        kind: 'added',
        summary:
          'Design tokens in ten categories -- colours, surface, border, text, icon, spacing, typography, responsive, elevation, radius -- from `@neofloai/atoms/tokens`. Every semantic token carries a light and a dark value, so a colour scheme is one prop rather than a second stylesheet.',
      },
      {
        kind: 'added',
        summary:
          'Every Phosphor icon from `@neofloai/atoms/icons`, tree-shakable, with the house weight and size already applied by the provider.',
      },
      {
        kind: 'added',
        summary:
          'The constructed MUI theme object from `@neofloai/atoms/theme`, for the rare case that needs to read a theme value outside a component.',
      },
      {
        kind: 'added',
        summary:
          'Six page patterns -- dashboard, invoice-dashboard, extraction, matching, erp-posting, reporting -- each a whole screen rather than a fragment, served as pasteable tsx.',
      },
      {
        kind: 'added',
        summary:
          'The MCP endpoint at atoms.neoflo.ai/mcp, with nine tools covering project intake, scaffolding, components, tokens, patterns, search, installation and this version check.',
      },
      {
        kind: 'added',
        summary:
          '`ATOMS_VERSION`, exported from the package root, so an app or an agent can read the installed version from code instead of inferring it from a lockfile.',
        scope: ['ATOMS_VERSION'],
      },
      {
        kind: 'added',
        summary:
          'This changelog, on the docs site and through the `check_version` MCP tool, so an upgrade can be read before it is taken.',
      },
    ],
    migration: [
      'If you installed before 1.0.0, your `package.json` most likely pins a commit (`github:neofloai/atoms#1a2b3c4`) or tracks the default branch. Replace it with `github:neofloai/atoms#semver:^1.0.0` so npm resolves against release tags from here on.',
      'Nothing in the API changed at 1.0.0 -- there was no earlier release for it to change from. A pre-1.0.0 install can be moved onto the range without touching component code.',
    ],
  },
];
