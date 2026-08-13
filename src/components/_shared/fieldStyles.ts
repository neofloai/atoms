import { spacing, text, typography } from '@/src/tokens';

import { paired } from './actionStyles';

import type { CSSObject, Theme } from '@mui/material/styles';

/**
 * Geometry shared by every field in the library — `TextField` today, and
 * `DatePicker`, whose field is a copy of it because MUI X builds its own
 * rather than reusing MUI's (see
 * `src/components/DatePicker/datePickerTokens.ts`).
 *
 * It exists for one reason: a field's height must not depend on what it
 * carries. Before this, a `TextField` with a plain start adornment measured
 * 36px and the same field with an `IconButton` at the end measured 48px,
 * because the house `IconButton`'s smallest size is 32px and the field pads
 * by 8 on each edge. Two fields side by side in a form disagreed by 12px,
 * and the ripple was a different size in each one.
 */

/**
 * Inset from the field's border on every edge, and the gap between the
 * value and an adornment beside it (Figma `Scale/200`, node 3179:106156).
 */
export const FIELD_PADDING_PX = spacing.component.xs;

/**
 * Height of a field's content row, which fixes the field itself at
 * `FIELD_HEIGHT_PX`. The `B1` leading, because the value is `B1` text.
 */
export const FIELD_CONTENT_HEIGHT_PX = typography.body.b1.leading;

/** What every field in the library measures: 8 + 20 + 8. */
export const FIELD_HEIGHT_PX =
  FIELD_CONTENT_HEIGHT_PX + 2 * FIELD_PADDING_PX;

/**
 * The glyph inside a field's adornment button. 16px against the
 * `IconContext` default of 24 that `NeofloThemeProvider` sets — a control
 * inside a 36px field reads as chrome at 16 and crowds it at 24.
 */
export const ADORNMENT_GLYPH_PX = 16;

/**
 * The circular hit target around that glyph.
 *
 * Sized between the 20px content row and the 32px of the house
 * `IconButton`'s smallest size, because neither fits: the content row
 * leaves no room for padding, and 32px in a 36px field would leave 2px to
 * the border. 28 gives 6px of padding around the glyph and still clears
 * the field's edge.
 */
export const ADORNMENT_BUTTON_PX = 28;

/** Padding that centres the glyph in the target. */
export const ADORNMENT_PADDING_PX =
  (ADORNMENT_BUTTON_PX - ADORNMENT_GLYPH_PX) / 2;

/**
 * How far the target hangs past the content row, top and bottom. Taken
 * back as a negative margin so the button cannot make the field taller —
 * the same technique MUI uses to fit a 40px button into its own inputs.
 */
const OVERHANG_PX = (ADORNMENT_BUTTON_PX - FIELD_CONTENT_HEIGHT_PX) / 2;

/**
 * A button sitting in a field's adornment: circular, one size, one ripple,
 * and unable to change the field's height.
 *
 * Applied by the field rather than asked of the caller, because the field
 * owns its own height. It therefore overrides whatever `size` a house
 * `IconButton` was given — `<IconButton size="sm">` and `size="lg"` both
 * come out at `ADORNMENT_BUTTON_PX` here, which is the point: the ripple
 * has to look the same in every field.
 *
 * Colour is left to the caller's `appearance` / `variant` except for the
 * resting glyph, which takes the field's own adornment ink so an
 * unstyled `IconButton` matches a bare icon in the same position.
 */
export function adornmentButton(theme: Theme): CSSObject {
  return {
    boxSizing: 'border-box',
    width: ADORNMENT_BUTTON_PX,
    height: ADORNMENT_BUTTON_PX,
    minWidth: ADORNMENT_BUTTON_PX,
    minHeight: ADORNMENT_BUTTON_PX,
    padding: ADORNMENT_PADDING_PX,
    borderRadius: '50%',
    flexShrink: 0,
    // Collapse the overhang so the field stays `FIELD_HEIGHT_PX`.
    marginTop: -OVERHANG_PX,
    marginBottom: -OVERHANG_PX,
    // MUI hands its own end-adornment buttons `edge="end"`, whose -12px
    // right margin is sized for MUI's 14px field padding around a 24px
    // glyph in a 40px button. These fields pad by 8 around a 16px glyph,
    // so the pull would hang the button over the border.
    marginLeft: 0,
    marginRight: 0,
    ...paired(theme, { color: text.default.caption }),
    // One glyph size regardless of what the caller's icon defaults to.
    '& svg': {
      width: ADORNMENT_GLYPH_PX,
      height: ADORNMENT_GLYPH_PX,
      fontSize: ADORNMENT_GLYPH_PX,
    },
  };
}

/**
 * The adornment wrapper around that button, or around a bare icon.
 *
 * MUI insets an adornment by 8px of its own, which lands on top of the 8px
 * `gap` the field root already declares — 16px in total, twice the inset
 * the value gets on the other side. The gap is the design's, so MUI's
 * margin goes rather than the gap. `maxHeight` is MUI's clamp for a
 * floating label, which these fields do not have.
 */
export function adornmentBox(): CSSObject {
  return {
    margin: 0,
    height: 'auto',
    maxHeight: 'none',
  };
}
