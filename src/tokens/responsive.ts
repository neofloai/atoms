/**
 * Breakpoint-scoped tokens — the Figma "responsive" variable collection,
 * whose two modes are Desktop (1440px frame) and Mobile (440px).
 *
 * Two ladders resolve differently per breakpoint:
 *
 *   - `headings` / `body` — the *page*-scale type ramp used by marketing
 *     and long-form layouts, where a heading shrinks on small screens
 *     (H1 is 80px on desktop, 56px on mobile). Sizes, leading, and
 *     paragraph spacing are all pixels.
 *   - `spacing` — the *page*-scale gap ladder, aliased to the primitive
 *     "Scale" set. The mid rungs halve on mobile (`m` is 48px on
 *     desktop, 32px on mobile); `none`/`xxs`/`xs`/`xl`/`xxl` are shared.
 *
 * Neither replaces its component-scale counterpart: `./typography.ts`
 * holds the component type ramp (13px `b1`, and the `h5`/`h6` rungs this
 * collection has no equivalent for) and `./spacing.ts` the component gap
 * ladder. The two ramps disagree on the shared `b1`/`b2`/`caption` names
 * and on heading leading — see DESIGNER_QUESTIONS.md #27.
 *
 * Generated from the Figma DTCG export (`Desktop.tokens.json` +
 * `Mobile.tokens.json`) — never hand-edit.
 */

export const responsive = {
  desktop: {
    frameWidth: 1440,
    headings: {
      display: { size: 120, leading: 128, paragraphSpacing: 128 },
      h1: { size: 80, leading: 100, paragraphSpacing: 100 },
      h2: { size: 56, leading: 80, paragraphSpacing: 80 },
      h3: { size: 36, leading: 52, paragraphSpacing: 52 },
      h4: { size: 24, leading: 36, paragraphSpacing: 36 },
    },
    body: {
      b1: { size: 16, leading: 24, paragraphSpacing: 24 },
      b2: { size: 14, leading: 24, paragraphSpacing: 24 },
      caption: { size: 12, leading: 16, paragraphSpacing: 16 },
    },
    spacing: {
      none: 0,
      xxs: 4,
      xs: 8,
      s: 24,
      m: 48,
      l: 64,
      xl: 96,
      xxl: 128,
    },
  },
  mobile: {
    frameWidth: 440,
    headings: {
      display: { size: 80, leading: 96, paragraphSpacing: 96 },
      h1: { size: 56, leading: 72, paragraphSpacing: 72 },
      h2: { size: 40, leading: 52, paragraphSpacing: 52 },
      h3: { size: 28, leading: 40, paragraphSpacing: 40 },
      h4: { size: 20, leading: 28, paragraphSpacing: 28 },
    },
    body: {
      b1: { size: 16, leading: 24, paragraphSpacing: 24 },
      b2: { size: 14, leading: 20, paragraphSpacing: 20 },
      caption: { size: 12, leading: 16, paragraphSpacing: 16 },
    },
    spacing: {
      none: 0,
      xxs: 4,
      xs: 8,
      s: 16,
      m: 32,
      l: 48,
      xl: 96,
      xxl: 128,
    },
  },
} as const;

export type Breakpoint = keyof typeof responsive;
export type ResponsiveTokens = typeof responsive;
