/**
 * Typography tokens.
 *
 * Sourced from the Neoflo Product Design System Figma file
 * (`iDCodnA5uZ14EdttjSMCT1`), synced from the Figma "styles" +
 * "primitive" export (2026-07-29). That sync replaced the product
 * sans (Plus Jakarta Sans) with DM Sans and resolved the type scale
 * that was previously a placeholder — see DESIGNER_QUESTIONS.md #7.
 *
 *   Font families (primitive collection)
 *     - Product:    DM Sans            (Regular, Medium, SemiBold)
 *                   Instrument Serif   (Regular, Italic)
 *     - Mono:       Space Mono         (Regular, Bold) — declared in
 *                   Figma but not yet consumed by any component or
 *                   text style; not self-hosted until something needs it.
 *     - Marketing:  Clash Grotesk      (Regular, Medium, Bold)
 *                   Instrument Serif   (Regular, Italic)
 *
 *   Type scale (`styles.textStyles`, all DM Sans) — each rung ships a
 *   Medium and Regular cut with identical size/leading; only weight
 *   (and occasionally letter-spacing) differs between the two. The
 *   values below pick whichever cut this system already uses for that
 *   rung (Medium for headings, Regular for body/caption).
 */

/**
 * CSS font-family strings, ready to drop into a theme or `font-family`
 * declaration. The first family in each list is the brand font; the
 * rest are sensible system fallbacks.
 *
 * DM Sans and Instrument Serif are both available on Google Fonts and
 * are self-hosted via `@fontsource` (see `src/theme/fonts.ts`). Clash
 * Grotesk is currently hosted on Fontshare (not Google Fonts); it is
 * intentionally not yet wired into `next/font`, so its fallback chain
 * now points at DM Sans (the self-hosted product sans) rather than the
 * retired Plus Jakarta Sans.
 *
 * Each `var()` carries a literal font-name fallback (e.g.
 * `var(--font-dm-sans, "DM Sans")`). The Next.js docs site defines
 * these CSS variables via `next/font`, but other hosts (Vite, CRA) may
 * not. Without the inner fallback an undefined variable makes the
 * whole `font-family` declaration invalid, so the browser drops to its
 * serif default; the literal name keeps the brand font working when
 * the consumer loads it by family name, and otherwise degrades cleanly
 * to the system stack.
 */
export const fontFamilies = {
  product: {
    sans: 'var(--font-dm-sans, "DM Sans"), system-ui, -apple-system, sans-serif',
    serif: 'var(--font-instrument-serif, "Instrument Serif"), Georgia, "Times New Roman", serif',
    /** Declared in Figma; not yet self-hosted — see the header comment. */
    mono: '"Space Mono", ui-monospace, "SF Mono", Menlo, monospace',
  },
  marketing: {
    sans: '"Clash Grotesk", var(--font-dm-sans, "DM Sans"), system-ui, sans-serif',
    serif: 'var(--font-instrument-serif, "Instrument Serif"), Georgia, "Times New Roman", serif',
  },
} as const;

/**
 * Numeric font-weight values. Names match the Figma weight variables
 * exactly so designers and engineers share vocabulary. DM Sans ships
 * Regular/Medium/SemiBold (no Bold cut), replacing the old
 * Regular/Medium/Bold ladder.
 */
export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
} as const;

interface TypeSlot {
  /** Font size in pixels. */
  readonly size: number;
  /** Line height (leading) in pixels. */
  readonly leading: number;
  /** Letter spacing in `em` (matches Figma's percent-of-font-size tracking). */
  readonly letterSpacing: number;
}

/**
 * Typography slot scale. Sizes are pixels; `letterSpacing` is `em`.
 *
 * Confirmed against the live Figma `styles.textStyles` export — no
 * longer a placeholder (previously DESIGNER_QUESTIONS.md #7).
 */
export const typography = {
  display: {
    d1: { size: 120, leading: 128, letterSpacing: -0.01 },
  },
  headings: {
    h1: { size: 80, leading: 80, letterSpacing: 0 },
    h2: { size: 56, leading: 64, letterSpacing: 0 },
    h3: { size: 36, leading: 48, letterSpacing: 0 },
    h4: { size: 24, leading: 32, letterSpacing: -0.01 },
    h5: { size: 20, leading: 28, letterSpacing: -0.01 },
    h6: { size: 16, leading: 24, letterSpacing: -0.01 },
  },
  body: {
    b1: { size: 13, leading: 20, letterSpacing: -0.01 },
    b2: { size: 12, leading: 16, letterSpacing: 0 },
    caption: { size: 10, leading: 12, letterSpacing: 0.002 },
  },
} as const satisfies Record<string, Record<string, TypeSlot>>;

export type FontFamilies = typeof fontFamilies;
export type FontWeights = typeof fontWeights;
export type TypographyTokens = typeof typography;
