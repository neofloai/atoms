import {
  border,
  fontFamilies,
  fontWeights,
  spacing,
  surface,
  text,
  typography,
} from '@/src/tokens';

import { paired } from '../_shared/actionStyles';

import type { CSSObject, Theme } from '@mui/material/styles';
import type { ModeToken } from '@/src/tokens';

/**
 * Geometry, type, and colour shared by the six parts of the list,
 * transcribed from the Figma `list` frame (node 3653:29671) inside the
 * `List` section (3648:25970).
 *
 * The sheet is a four-axis matrix — `2-line` × `State` × `Type` ×
 * `Action`, 120 symbols — but it binds only three primitives, and every
 * measurement in all 120 falls out of them:
 *
 *   - `Scale/300` (16) — padding on all four sides of a row, and the
 *                        gap between the row's content and its trailing
 *                        control.
 *   - `Scale/200` (8)  — the gap between the leading element and the
 *                        text block.
 *   - `Sans/B1` + `Sans/B2` — 13/20 for the title, 12/16 for the
 *                        subtitle, stacked flush with no gap.
 *
 * Which makes the six distinct row heights arithmetic rather than
 * opinion, and they were checked that way. Every one is
 * `16 + content + 16`, where `content` is the taller of the text block
 * and whatever the caller put beside it:
 *
 *   text, 1-line                52 = 16 + 20 + 16
 *   text, 2-line                68 = 16 + (20 + 16) + 16
 *   avatar `sm` (24), 1-line    56 = 16 + 24 + 16
 *   icon tile (32), 1-line      64 = 16 + 32 + 16
 *   text + button (32), 1-line  64 = 16 + 32 + 16
 *   avatar `md` (36), 2-line    68 = 16 + 36 + 16
 *
 * The last of those is the only one that does not need the avatar to be
 * any particular size: the text block is 36 tall on its own, so a
 * two-line row measures 68 whether the avatar beside it is the sheet's
 * 36 or this system's `Avatar size="md"`, which is 32. (The two disagree
 * — the sheet's own avatar instance reports `min-width: 32` and
 * `width: 36` in the same box. Logged as DESIGNER_QUESTIONS.md #51.)
 *
 * That arithmetic is the evidence for the single most important fact
 * about this component: **the row owns no content chrome.** The leading
 * element is 24px in one row and 36px in the next; the trailing one is a
 * `Switch` here and two 32px `IconButton`s there. Each is an instance of
 * a component this system already ships, dropped in by the designer, and
 * the row's only job is to inset it by 16 and centre it. So none of the
 * sheet's four axes becomes a prop — see `List.types.ts`.
 */

/**
 * Padding inside a row, on all four sides, and the gap between the
 * row's content and its trailing control.
 *
 * A named literal rather than a token, for the same reason `Card`'s and
 * `Accordion`'s are: the component spacing ladder runs 0, 4, 8, 12, 24,
 * 48, 64, 96, so it skips `Scale/300` entirely. `radius.lg` is also 16,
 * but borrowing a radius for a distance reads as a radius at the call
 * site. Tracked in DESIGNER_QUESTIONS.md #31.
 */
export const LIST_ROW_PADDING_PX = 16;

/**
 * `Scale/200`, the gap between the leading element and the text block.
 *
 * Spent as the row's flex `gap`, which makes it the gap between every
 * pair of direct children. The trailing control then adds the same
 * amount again as a margin to reach `Scale/300` — see `ListItem.tsx`.
 */
export const LIST_CONTENT_GAP_PX = spacing.component.xs;

/**
 * `Scale/100`, between two controls in the same trailing group — the
 * gap the sheet's `icon-button` cell puts between its pencil and its
 * caret.
 */
export const LIST_ACTION_GAP_PX = spacing.component.xxs;

/** The hairline along the bottom edge of every row. */
export const LIST_BORDER_WIDTH_PX = 1;

/**
 * `Sans/B1/Regular` — the row's title, and the only line a one-line row
 * has.
 *
 * Set explicitly rather than left to MUI. `ListItemText` renders its two
 * slots as `Typography` with the `body1` and `body2` variants, which are
 * Material's 16/24 and 14/20 rather than this design's 13/20 and 12/16.
 */
export const listPrimaryType: CSSObject = {
  fontFamily: fontFamilies.product.sans,
  fontWeight: fontWeights.regular,
  fontSize: typography.body.b1.size,
  lineHeight: `${typography.body.b1.leading}px`,
  letterSpacing: `${typography.body.b1.letterSpacing}em`,
};

/**
 * `Sans/B2/Regular` — the subtitle on a two-line row.
 *
 * Stacked flush against the title: no margin between them, which is
 * what makes a two-line row 68 rather than 68-plus-a-gap.
 */
export const listSecondaryType: CSSObject = {
  fontFamily: fontFamilies.product.sans,
  fontWeight: fontWeights.regular,
  fontSize: typography.body.b2.size,
  lineHeight: `${typography.body.b2.leading}px`,
  letterSpacing: `${typography.body.b2.letterSpacing}em`,
};

/**
 * The resting band: a `surface/layers/card 1` fill under a 1px
 * `border/layers/card 1` hairline along the bottom edge only.
 *
 * The same model `Accordion` uses, and for the same reason — the Figma
 * component there is literally called `accordion-list-items`. There is
 * no card, no radius, no shadow, and no gap between rows; a stack of
 * them reads as a list because each one ends on a rule.
 *
 * Both halves are absolute rather than inherited, and that is
 * deliberate. Hover moves the fill to `card 2`; if the resting fill were
 * transparent instead, a list dropped onto a `card 2` surface would
 * answer the pointer with nothing at all. That is the bug
 * DESIGNER_QUESTIONS.md #23 records for `MenuItem`, avoided here by
 * painting both ends of the transition.
 *
 * `backgroundClip: padding-box` keeps the fill from painting under the
 * hairline, which is what MUI's own `divider` does and what stops the
 * rule reading a shade lighter than it is.
 */
export function listRowSurface(theme: Theme): CSSObject {
  return {
    borderBottomStyle: 'solid',
    borderBottomWidth: LIST_BORDER_WIDTH_PX,
    backgroundClip: 'padding-box',
    ...paired(theme, {
      backgroundColor: surface.layers.card1,
      borderBottomColor: border.layers.card1,
    }),
  };
}

/**
 * Every colour the row's `State` axis moves, resolved to a token.
 *
 * The sheet draws four states and each one is exact. Hover and focus
 * share a fill and differ only in the hairline, which is the sheet's way
 * of saying the rule is the focus indicator:
 *
 *   enabled    `card 1`             / `border/layers/card 1`
 *   hovered    `card 2`             / `border/layers/card 1`
 *   focused    `card 2`             / `border/primary/3`
 *   disabled   `surface/disabled`   / `border/disabled/default`
 *
 * `selected` is not in that list, because the sheet has no selected
 * cell — and a list is where selection lives, so it cannot be left on
 * MUI's default, which tints with a translucent `primary.main` that
 * belongs to no ladder here. It borrows `MenuItem`'s treatment instead:
 * the primary subtle rung, one step up under the pointer, which keeps a
 * selected row in the brand family rather than dropping it back to the
 * neutral hover tint. Logged as DESIGNER_QUESTIONS.md #51.
 *
 * `disabledInk` is one deviation from the sheet, and deliberate. Figma
 * dims the *title* to `text/disabled/default` but leaves the subtitle at
 * `text/default/b2` — which is darker, so a disabled row's second line
 * would read as more prominent than its first. That inverts the
 * hierarchy every other disabled control here observes, so both lines
 * dim. Also logged as #51.
 */
export const listRowState = {
  hoverFill: surface.layers.card2,
  focusRule: border.primary.focus,
  selectedFill: surface.primary.subtle,
  selectedHoverFill: surface.primary.subtleHover,
  disabledFill: surface.disabled.default,
  disabledRule: border.disabled.default,
  disabledInk: text.disabled.default,
} satisfies Record<string, ModeToken>;

/**
 * The row's layout: a flex line, 16 inside, 8 between children.
 *
 * Shared by `ListItem` and `ListItemButton` because the design draws one
 * row and MUI offers two elements to be it — a plain `li` for a row that
 * only displays, a `ButtonBase` for a row that responds. Neither is
 * "the" row, so both get the same box.
 */
export const listRowBox: CSSObject = {
  boxSizing: 'border-box',
  gap: LIST_CONTENT_GAP_PX,
};
