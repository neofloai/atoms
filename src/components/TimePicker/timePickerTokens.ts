import { surface } from '@/src/tokens';

import type { ModeToken } from '@/src/tokens';

/**
 * The one colour that belongs to the clock and nowhere else.
 *
 * Everything else the time picker paints — the field, the popover, and the
 * states of a value cell — is shared with the date picker and lives in
 * `src/components/_shared/pickerTokens.ts`, which also records why a picker
 * has no Figma source and how each role was chosen. Read that file first.
 *
 * The clock's *geometry* is left exactly as MUI X ships it: 56px columns
 * with a hairline between them, a 232px scroll height, a 220px analog face.
 * Only colour and type are moved onto house tokens.
 */

/**
 * The analog clock's face, which only renders in the mobile modal.
 *
 * MUI fills it with a literal `rgba(0,0,0,.07)` — a fixed 7% black that
 * does not invert, so in dark mode it darkens an already near-black panel
 * instead of lifting off it. `card 3` is the same intent expressed on the
 * ladder: one layer above the `card 2` panel the face sits on, in both
 * schemes. It is also the token a hovering cell takes, but nothing on the
 * face hovers — MUI gives its numerals no hover fill, because the pointer
 * is what shows the selection.
 */
export const clockFace = {
  background: surface.layers.card3,
} as const satisfies Record<string, ModeToken>;
