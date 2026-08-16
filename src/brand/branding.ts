/**
 * Brand guidelines for Neoflo.
 *
 * Single source of truth for "what is the Neoflo brand" content — the
 * logo, brand colours, typography, and theming philosophy. Like the
 * installation guide, it is:
 *   - serialized to `data/brand.json` by `scripts/generate.ts` (so the
 *     MCP `search_docs` tool can answer brand questions), and
 *   - rendered by the docs-site `/branding` page.
 *
 * Keep this brand-specific (identity, logo, colour, type, theme). Raw
 * token values live in `src/tokens` and are surfaced via `get_tokens`;
 * this module is the narrative around them.
 */

export interface BrandSection {
  /** Stable id, also used as the docs-page anchor. */
  id: string;
  title: string;
  /** Extra search terms beyond the title/summary/body words. */
  keywords: string[];
  /** One-line answer surfaced in search results. */
  summary: string;
  /** Full guidance, plain text with light markdown. */
  body: string;
}

export interface BrandGuide {
  name: string;
  tagline: string;
  sections: BrandSection[];
}

export const branding: BrandGuide = {
  name: 'Neoflo',
  tagline:
    'The Neoflo brand: one monochrome mark, a single blue accent, and a two-typeface system, all expressed through the Atoms theme.',
  sections: [
    {
      id: 'identity',
      title: 'Brand identity',
      keywords: ['brand', 'identity', 'neoflo', 'voice', 'about'],
      summary:
        'Neoflo is a calm, precise product brand: monochrome by default, with a single confident blue accent and restrained type.',
      body: [
        'Neoflo is a calm, precise, product-first brand. The system leans on a neutral greyscale foundation so content and data stay the focus, with one confident blue accent reserved for primary actions and emphasis.',
        '',
        'Atoms is the design system that ships the brand. Everything visual — colour, type, spacing, elevation, the logo — flows through the Atoms theme, so any product built on @neofloai/atoms is on-brand by construction. Do not introduce off-theme colours, fonts, or a restyled logo.',
      ].join('\n'),
    },
    {
      id: 'logo',
      title: 'Logo',
      keywords: ['logo', 'mark', 'wordmark', 'brand mark', 'icon', 'neoflo logo'],
      summary:
        'The Neoflo mark is a single monochrome "N" Union shape; use NeofloLogo (mark or full lockup), which inherits currentColor.',
      body: [
        'The Neoflo logo is a single geometric "N" mark. It comes in two forms: the mark (icon only) and the full lockup (mark + the lowercase "neoflo" wordmark).',
        '',
        'Ship it with the NeofloLogo component, never a re-drawn copy:',
        '',
        "  import { NeofloLogo } from '@neofloai/atoms';",
        '',
        '  <NeofloLogo />                          // icon mark, 24px',
        '  <NeofloLogo variant="full" size={28} /> // mark + wordmark',
        '',
        'The logo is monochrome and renders from currentColor, so it is dark on light surfaces and light on dark surfaces from one source — there are no separate colour assets. Set the colour by setting `color` on an ancestor. Keep clear space around it, do not recolour it into the brand blue, and do not stretch or rotate it.',
      ].join('\n'),
    },
    {
      id: 'favicon',
      title: 'Favicon',
      keywords: [
        'favicon',
        'favicon.ico',
        'tab icon',
        'browser icon',
        'app icon',
        'apple touch icon',
        'touch icon',
        'home screen icon',
        'metadata icons',
      ],
      summary:
        'The off-white disc is the default favicon — one file that reads on both light and dark browser chrome. Download the set from the Branding page and serve it from your own origin; never hotlink it.',
      body: [
        'A favicon cannot inherit currentColor the way NeofloLogo does — it is a file, rendered by browser chrome the theme has no reach into. So the mark ships pre-rendered, and which one you use is a real choice rather than an automatic one.',
        '',
        '  favicon-dark.png      off-white disc, dark mark — THE DEFAULT, used on both chromes',
        '  favicon-light.png     dark disc, off-white mark — optional, light chrome only',
        '  apple-touch-icon.png  full-bleed off-white square, dark mark — iOS home screen',
        '  favicon.ico           16/32/48px copy of the default, for the /favicon.ico path',
        '',
        'The PNGs are named for the scheme they are shown IN, not the colour they are made of. Default to the off-white disc: it is the only one that survives both backgrounds, because its dark mark stays legible on light chrome while the disc itself carries it on dark. The dark disc is crisp on light chrome and invisible on dark, so it is worth adding only behind a (prefers-color-scheme: light) query — and only if you accept losing the icon entirely in a browser that ignores `media` on an icon link.',
        '',
        'The Apple touch icon is a square rather than a disc on purpose: iOS ignores transparency, composites onto black, and applies its own rounding.',
        '',
        'Download the files from the Branding page of the docs site and commit them to your own repository. Do not hotlink the Atoms site, or any other origin — an icon served from somewhere you do not control disappears the day that origin does.',
        '',
        'Next.js App Router — put the files in `public/` and declare them in the root layout:',
        '',
        '  export const metadata = {',
        '    icons: {',
        '      icon: [',
        "        { url: '/favicon.ico', sizes: '16x16 32x32 48x48' },",
        "        { url: '/brand/favicon-dark.png', type: 'image/png' },",
        '      ],',
        "      apple: { url: '/brand/apple-touch-icon.png', type: 'image/png' },",
        '    },',
        '  };',
        '',
        'Plain HTML — the same thing, with paths relative to your own site:',
        '',
        '  <link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">',
        '  <link rel="icon" type="image/png" href="/brand/favicon-dark.png">',
        '  <link rel="apple-touch-icon" href="/brand/apple-touch-icon.png">',
        '',
        'To make the mark invert with the OS scheme instead, swap the single PNG entry for the pair. The app/icon.png file convention cannot express `media`, so either way the icons need explicit metadata:',
        '',
        "  { url: '/brand/favicon-light.png', type: 'image/png', media: '(prefers-color-scheme: light)' },",
        "  { url: '/brand/favicon-dark.png', type: 'image/png', media: '(prefers-color-scheme: dark)' },",
      ].join('\n'),
    },
    {
      id: 'color',
      title: 'Brand colours',
      keywords: [
        'color',
        'colour',
        'palette',
        'brand color',
        'primary',
        'blue',
        'accent',
        'orange',
        'purple',
      ],
      summary:
        'Neutral greyscale foundation + one primary blue (#4961dc). Semantic green/red/yellow/blue for status, exposed as MUI palette roles; orange and purple are Chip tag tints only.',
      body: [
        'The brand colour story is deliberately small:',
        '',
        '- Primary blue — #4961dc (primary/500). The single brand accent, used for primary actions, selection, and focus. One per view. Reach it as `palette.primary.main`. (primary/600, #343eb3, is one rung darker — the palette\'s `.dark` shade, e.g. pressed states — not the resting accent.)',
        '- Neutral greyscale — the foundation for surfaces, borders, and text. Most of any screen is greyscale.',
        '- Semantic status — green (success), red (error/destructive), yellow (warning), blue (informational). These are the MUI palette roles: `palette.success`, `palette.error`, `palette.warning`, `palette.info`.',
        '- Orange and purple are not brand colours. They are tag tints with a single consumer each — Chip\'s flat `size="sm"` variant (`variant="orange"` / `"purple"`) — and are only ever used as the confirmed token pair, `surface.<name>.default` for the fill plus `text.<name>.caption` for the label. They have no palette role and no shade-500 usage anywhere in the system; do not treat them as accents to reach for.',
        '',
        'Always pull colours from the theme/tokens (call get_tokens for the colors and surface categories). Never hardcode hex; the palette roles and the semantic surface/border/text tokens carry the correct light and dark values.',
      ].join('\n'),
    },
    {
      id: 'typography',
      title: 'Typography & fonts',
      keywords: [
        'font',
        'fonts',
        'typeface',
        'typography',
        'dm sans',
        'instrument serif',
        'clash grotesk',
        'type',
      ],
      summary:
        'Product UI uses DM Sans (with Instrument Serif accents); marketing uses Clash Grotesk. Weights: 400 / 500 / 600.',
      body: [
        'Neoflo runs a two-context type system:',
        '',
        '- Product (the app UI): DM Sans is the primary sans for all interface text; Instrument Serif is an occasional accent for editorial/display moments.',
        '- Marketing: Clash Grotesk is the display face for marketing surfaces, with Instrument Serif as the serif accent.',
        '',
        'Weights are Regular (400), Medium (500), and SemiBold (600) — DM Sans has no Bold cut. DM Sans and Instrument Serif are self-hosted by the package (via @fontsource) and load automatically through NeofloThemeProvider — consumers do not wire fonts themselves. Clash Grotesk is not yet self-hosted, so marketing text falls back to DM Sans until it is hosted (see DESIGNER_QUESTIONS.md #7).',
        '',
        'Use the typography scale from the theme rather than ad-hoc font sizes (call get_tokens for the typography category).',
      ].join('\n'),
    },
    {
      id: 'theme',
      title: 'Theme & colour modes',
      keywords: [
        'theme',
        'dark mode',
        'light mode',
        'color scheme',
        'mode',
        'NeofloThemeProvider',
        'defaultMode',
      ],
      summary:
        'One MUI-based theme drives the brand. Wrap apps in NeofloThemeProvider; light and dark are both first-class, defaulting to the system scheme.',
      body: [
        'The brand is delivered as one MUI v9 theme built entirely from tokens. Wrap your app once in NeofloThemeProvider and every Atoms component is themed and on-brand:',
        '',
        "  import { NeofloThemeProvider } from '@neofloai/atoms';",
        '',
        '  <NeofloThemeProvider>{children}</NeofloThemeProvider>',
        '',
        'Light and dark are both first-class — every semantic token carries a light and a dark value. The provider defaults to the system colour scheme; pass defaultMode="light" or "dark" to pin a single scheme. Do not theme components individually or override brand colours; change the tokens/theme instead.',
      ].join('\n'),
    },
  ],
};
