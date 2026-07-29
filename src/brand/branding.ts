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
        'Atoms is the design system that ships the brand. Everything visual — colour, type, spacing, elevation, the logo — flows through the Atoms theme, so any product built on @neoflo/atoms is on-brand by construction. Do not introduce off-theme colours, fonts, or a restyled logo.',
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
        "  import { NeofloLogo } from '@neoflo/atoms';",
        '',
        '  <NeofloLogo />                          // icon mark, 24px',
        '  <NeofloLogo variant="full" size={28} /> // mark + wordmark',
        '',
        'The logo is monochrome and renders from currentColor, so it is dark on light surfaces and light on dark surfaces from one source — there are no separate colour assets. Set the colour by setting `color` on an ancestor. Keep clear space around it, do not recolour it into the brand blue, and do not stretch or rotate it.',
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
      ],
      summary:
        'Neutral greyscale foundation + one primary blue (#343eb3). Semantic green/red/yellow/blue for status; orange is a sparing accent.',
      body: [
        'The brand colour story is deliberately small:',
        '',
        '- Primary blue — #343eb3 (primary/600). The single brand accent, used for primary actions, selection, and focus. One per view.',
        '- Neutral greyscale — the foundation for surfaces, borders, and text. Most of any screen is greyscale.',
        '- Semantic status — green (success), red (error/destructive), yellow (warning), blue (informational).',
        '- Orange (#fe9934) — a sparing accent (e.g. default avatars); not a primary brand colour.',
        '',
        'Always pull colours from the theme/tokens (call get_tokens for the colors and surface categories). Never hardcode hex; the semantic surface/border/text tokens carry the correct light and dark values.',
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
        "  import { NeofloThemeProvider } from '@neoflo/atoms';",
        '',
        '  <NeofloThemeProvider>{children}</NeofloThemeProvider>',
        '',
        'Light and dark are both first-class — every semantic token carries a light and a dark value. The provider defaults to the system colour scheme; pass defaultMode="light" or "dark" to pin a single scheme. Do not theme components individually or override brand colours; change the tokens/theme instead.',
      ].join('\n'),
    },
  ],
};
