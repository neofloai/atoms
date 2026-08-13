import { border, surface } from '@/src/tokens';

import type { ModeToken } from '@/src/tokens';

/**
 * The two colours that belong to the calendar grid and nowhere else.
 *
 * Everything else the date picker paints — the field, the popover, and the
 * states of a value cell — is shared with the time picker and lives in
 * `src/components/_shared/pickerTokens.ts`, which also records why a picker
 * has no Figma source and how each role was chosen. Read that file first.
 *
 * The grid's *geometry* is left exactly as MUI X ships it: 36px cells, a
 * 7-column grid, circular days, 3-or-4-up year buttons. Only colour and
 * type are moved onto house tokens.
 */

/**
 * Today, when it is not the selected day: the subtle primary fill and a
 * mid-strength primary ring — plainly primary-flavoured, and plainly
 * weaker than a selected day's solid fill.
 *
 * Both are stated rather than left to MUI X, which computes the fill as
 * `alpha(palette.primary.main, 0.12)`. A composited alpha is not a token
 * and does not follow the ladder in dark mode, and MUI's ring alone
 * (`border.primary.default`) is pale enough to disappear against the
 * panel.
 */
export const today = {
  background: surface.primary.subtle,
  border: border.primary.focus,
} as const satisfies Record<string, ModeToken>;
