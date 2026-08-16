/**
 * Elevation / shadow tokens.
 *
 * Three Figma effect styles — `Shadow/small`, `Shadow/medium`,
 * `Shadow/large` — re-read from the `shadows` sheet (node 2080:23678,
 * swatches 953:3033-3035) on 2026-08-16. See DESIGNER_QUESTIONS.md #10:
 *
 *   - `small`  buttons, input focus, slight elevation
 *   - `medium` dropdowns, tooltips, floating elements
 *   - `large`  modals, dialogs, popovers
 *
 * Each is two stacked drop shadows of the same ink, `#161614`: a tight
 * contact layer and a looser ambient one below it. Both are written
 * contact-first, which is Figma's own effect order and also the
 * conventional CSS reading. Order is only a convention here — two
 * translucent layers of one colour composite to the same result either
 * way — so it is worth nothing beyond legibility.
 *
 * Figma stores the alpha as the last byte of an 8-digit hex, so the
 * values are `0x14 = 0.078`, `0x0A = 0.039` and `0x29 = 0.161`. They are
 * rounded to two places, matching how the rest of this file reads.
 *
 * ## The ladder is not geometric, and that is deliberate
 *
 * `small` to `medium` doubles cleanly — every offset and every radius
 * twice the last, both alphas held. `large` does not continue it. It
 * keeps `medium`'s contact geometry and doubles that layer's *ink*
 * instead (0.08 -> 0.16), then drops the ambient layer lower (y4 -> y8)
 * while tightening it (r8 -> r4).
 *
 * So `large`'s widest blur is 4px against `medium`'s 8px, which looks
 * like a transposition and is not one — it is what the sheet draws, and
 * the swatch renders as a darker, more grounded edge rather than a
 * bigger cloud. The rungs climb in contact, not in diffusion. Anyone
 * "fixing" the blur back to 16 would be reverting the design.
 */

export const elevation = {
  small:
    '0px 1px 2px 0px rgba(22, 22, 20, 0.08), 0px 2px 4px 0px rgba(22, 22, 20, 0.04)',
  medium:
    '0px 2px 4px 0px rgba(22, 22, 20, 0.08), 0px 4px 8px 0px rgba(22, 22, 20, 0.04)',
  large:
    '0px 2px 4px 0px rgba(22, 22, 20, 0.16), 0px 8px 4px 0px rgba(22, 22, 20, 0.04)',
} as const;

export type ElevationTokens = typeof elevation;
