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
    version: '2.0.0',
    tag: 'v2.0.0',
    date: '2026-09-09',
    headline:
      'Font and icon colour tokens now carry the Figma variable names verbatim. Every one of them is renamed.',
    summary:
      'A breaking release with one reason behind it: until now the library renamed every font and icon colour on its way in from Figma, so `text/default/b2` was stored as `text.default.caption` and `text/primary/3` as `text.primary.accent`. The new names read better in isolation, which is why they lasted three releases -- but it meant the name a designer said in a review did not exist in the code, someone had to translate it by hand, and twice they translated it wrong and shipped the wrong colour. The translation layer is gone rather than documented. Every `text` and `icon` key is now the Figma variable name exactly: ask for `text/default/b2` and you write `text.default.b2`. No colour value moved -- all 78 rungs resolve to the same light and dark hex they did in 1.0.1 -- so this is a rename and nothing else, but it is a rename of every one of them and it will not compile until you do it. `Button` and `ToggleButton` also move to a 4px corner, which needs nothing from you.',
    changes: [
      {
        kind: 'breaking',
        summary:
          'Every `text` and `icon` token key is renamed to its Figma variable name. `text.default.caption` is `text.default.b2`, `text.primary.accent` is `text.primary[3]`, `text.disabled.onColor` is `text.disabled[\'on-color\']`. Three spellings now, because no single one is both exact and a valid identifier: bare names stay bare, pure numbers become bracket access, and anything with a space or hyphen has to be quoted. The migration note below lists all twelve rules.',
        scope: ['@neofloai/atoms/tokens'],
      },
      {
        kind: 'changed',
        summary:
          'No token value changed. Every renamed rung resolves to the same light and dark hex it did in 1.0.1, verified rung by rung in both directions -- 78 matched, nothing orphaned, nothing new. If a colour looks different after upgrading, it is a mis-migrated key rather than a retuned palette.',
        scope: ['@neofloai/atoms/tokens'],
      },
      {
        kind: 'changed',
        summary:
          '`Button` corners are 4px (`radius.xs`) where they were 8px. Nothing else about the component moves, and there is no prop for it -- the corner is the corner.',
        scope: ['Button'],
      },
      {
        kind: 'changed',
        summary:
          '`ToggleButton` and `ToggleButtonGroup` follow `Button` to 4px, including the corners the group hands back at `appearance="text"`. If you wrap a toggle group in a container with a pixel or two of padding, drop that container to 4px as well or a sliver of it shows outside the buttons.',
        scope: ['ToggleButton', 'ToggleButtonGroup'],
      },
      {
        kind: 'changed',
        summary:
          '`get_tokens` now prefixes `text`, `icon`, `surface` and `border` with a note saying how their keys are named -- which of them carry Figma names verbatim, which rename Figma\'s tier numbers, and which end of a numeric ladder is the darkest. An agent reading `"1": {...}` out of the raw JSON had no way to tell, and a guessed rung is a wrong colour that looks deliberate.',
        scope: ['get_tokens'],
      },
      {
        kind: 'changed',
        summary:
          '`theme.shape.borderRadius` is still 8px. Only the three controls named above moved, so anything inheriting a corner -- including your own `borderRadius: 1` -- is unaffected.',
      },
    ],
    migration: [
      'Rename every `text` and `icon` token you reference. Twelve rules cover all of them: `text.default.body` is now `text.default.b1`; `.caption` is `.b2`; `.placeholder` is `.b3`; `.headingOnColor`, `.bodyOnColor`, `.captionOnColor` and `.placeholderOnColor` become `text.default[\'heading on-color\']`, `[\'body on-color\']`, `[\'caption on-color\']` and `[\'placeholder on-color\']`. On every other role -- `primary`, `information`, `success`, `error`, `warning`, `orange`, `purple` -- `.body` is `[1]`, `.caption` is `[2]`, `.accent` is `[3]` and `.onColorHover` is `[4]`. `text.disabled.onColor` is `text.disabled[\'on-color\']`. `icon` renames identically. `heading`, `subtle` and `disabled.default` did not move.',
      'Two ladders start at 0 rather than 1, so `.body` on them is `[0]`, not `[1]`: `text.warning` and `text.orange`. `icon.orange` starts at 0 too, but `icon.warning` starts at 1 -- that asymmetry is in the Figma file and was carried through rather than normalised, because guessing which side is right would put the code out of step with the design either way.',
      'Do not run a blind find-and-replace on `text.primary` or `text.disabled`. Those are also MUI palette references, and `sx={{ color: \'text.primary\' }}` and `theme.palette.text.disabled` are correct and must not be touched. Anchor on three segments -- the token is always `text.<role>.<rung>` -- and check that the file imports `text` from `@neofloai/atoms/tokens` before rewriting anything in it.',
      'TypeScript will find the rest for you. The token objects are `as const`, so every stale key is a compile error rather than an `undefined` that renders as a missing colour at runtime. Upgrade, run `tsc`, and work the list.',
      'Nothing to do for the corner radius on `Button` or `ToggleButton` -- it is a visual change and it arrives with the upgrade. Worth a look at any toolbar where one of them sits beside an `IconButton`, `Chip`, `TextField` or `Select`: those are still on 8px, so the two corners no longer match.',
    ],
  },
  {
    version: '1.0.1',
    tag: 'v1.0.1',
    date: '2026-09-03',
    headline:
      'Importing anything from the package root no longer pulls in the whole Phosphor icon set.',
    summary:
      'One fix, and it is worth upgrading for on its own: an app that imported a single component from `@neofloai/atoms` was retaining the entire Phosphor icon set -- about 5 MB of icons, in a bundle that asked for a button. Nothing about the API changed, so upgrading is an install and no edits. If you have been carrying an entry chunk you could not account for, this was very likely it.',
    changes: [
      {
        kind: 'fixed',
        summary:
          'The package root no longer pins every Phosphor icon. `src/icons` re-exported the whole icon set with `export *`, and because Phosphor is an external dependency the bundler could not see through that star -- it built a namespace object at runtime and turned every icon reference inside the library into a property lookup. A consumer\'s bundler cannot prove which properties are read, so it had to keep all 1,512 icons. Measured on an app importing only `Button`: 6,265 KB before, 1,180 KB after -- the icon set alone was 5,085 KB of that. The library now imports the sixteen glyphs it actually draws by name.',
      },
      {
        kind: 'fixed',
        summary:
          'The weight was invisible from the outside, which is why it survived to 1.0.0: the published bundle is ~250 KB either way, because the icons are external and only materialise once an app resolves them. `npm run check:icons` now fails the build if it comes back.',
      },
    ],
    migration: [
      'Reinstall to pick it up -- `npm install github:neofloai/atoms#semver:^1.0.1`. There is nothing to change in your own code, but you do have to take the upgrade: the fix is in how the package is built, so a project still resolved to 1.0.0 keeps the 6 MB.',
      '`@neofloai/atoms/icons` behaved correctly before this and behaves the same now. If you were importing icons from that subpath to work around the size, you can keep doing exactly that -- it was never the leak.',
    ],
  },
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
