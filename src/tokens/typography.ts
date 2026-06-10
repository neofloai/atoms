/**
 * Typography tokens.
 *
 * Sourced from the Neoflo Product Design System Figma file
 * (`iDCodnA5uZ14EdttjSMCT1`). Confirmed structure:
 *
 *   Font families (primitive collection)
 *     - Product:    Plus Jakarta Sans  (Regular, Medium, Bold)
 *                   Instrument Serif   (Regular, Italic)
 *     - Marketing:  Clash Grotesk      (Regular, Medium, Bold)
 *                   Instrument Serif   (Regular, Italic)
 *
 *   Type scale (responsive collection — STRING values that vary per breakpoint)
 *     - Headings:   H1, H2, H3, H4   ({ size, leading })
 *     - Body:       B1, B2           ({ size, leading })
 *     - Caption:                       { size, leading }
 *
 * Heads-up: numerical sizes and leadings below are *placeholders*.
 * The actual values live in a "responsive" Figma variable collection
 * whose values the MCP can only resolve when a frame using them is
 * selected in the Figma desktop app. Replace once the designer hands
 * off the resolved numbers — see DESIGNER_QUESTIONS.md #7.
 */

/**
 * CSS font-family strings, ready to drop into a theme or `font-family`
 * declaration. The first family in each list is the brand font; the
 * rest are sensible system fallbacks.
 *
 * Plus Jakarta Sans and Instrument Serif are both available on Google
 * Fonts and are loaded via `next/font/google` in `app/layout.tsx`.
 * Clash Grotesk is currently hosted on Fontshare (not Google Fonts);
 * it is intentionally not yet wired into `next/font`, so a system
 * sans-serif will render until the marketing-side font is hosted.
 */
export const fontFamilies = {
  product: {
    sans: 'var(--font-plus-jakarta-sans), system-ui, -apple-system, sans-serif',
    serif: 'var(--font-instrument-serif), Georgia, "Times New Roman", serif',
  },
  marketing: {
    sans: '"Clash Grotesk", var(--font-plus-jakarta-sans), system-ui, sans-serif',
    serif: 'var(--font-instrument-serif), Georgia, "Times New Roman", serif',
  },
} as const;

/**
 * Numeric font-weight values. Names match the Figma weight variables
 * exactly so designers and engineers share vocabulary.
 */
export const fontWeights = {
  regular: 400,
  medium: 500,
  bold: 700,
} as const;

interface TypeSlot {
  /** Font size in pixels. */
  readonly size: number;
  /** Line height (leading) in pixels. */
  readonly leading: number;
}

/**
 * Typography slot scale. Sizes are pixels.
 *
 * PLACEHOLDER VALUES — Figma's responsive variable collection holds
 * the canonical numbers per breakpoint and they are not yet wired in.
 */
export const typography = {
  headings: {
    h1: { size: 48, leading: 56 },
    h2: { size: 36, leading: 44 },
    h3: { size: 28, leading: 36 },
    h4: { size: 22, leading: 30 },
  },
  body: {
    b1: { size: 16, leading: 24 },
    b2: { size: 14, leading: 20 },
    caption: { size: 12, leading: 16 },
  },
} as const satisfies Record<string, Record<string, TypeSlot>>;

export type FontFamilies = typeof fontFamilies;
export type FontWeights = typeof fontWeights;
export type TypographyTokens = typeof typography;
