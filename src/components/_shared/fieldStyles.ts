import {
  border,
  fontFamilies,
  fontWeights,
  icon,
  radius,
  spacing,
  surface,
  text,
  typography,
} from '@/src/tokens';

import { paired } from './actionStyles';

import type { CSSObject, Theme } from '@mui/material/styles';
import type { ModeToken } from '@/src/tokens';

/**
 * The field every input in the library draws — `TextField`, `Select`,
 * `DatePicker` and `TimePicker` — specified once.
 *
 * `TextField` and `Select` are both MUI `TextField`s, so they share
 * `outlinedFieldStyles` below outright. The two pickers are MUI X, whose
 * field is a parallel implementation with its own class tree, so
 * `pickerFieldStyles` restates the selectors — but reads every number and
 * every colour from here. A change to the field is a change to this file.
 *
 * That was not true before the 1 October redraw: each of the four carried
 * its own copy of the tokens, and when `TextField` was redrawn the other
 * three were left drawing the previous sheet side by side with it.
 *
 * It exists for one reason: a field's height must not depend on what it
 * carries. Before this, a `TextField` with a plain start adornment measured
 * 36px and the same field with an `IconButton` at the end measured 48px,
 * because the house `IconButton`'s smallest size is 32px and the field pads
 * by 8 on each edge. Two fields side by side in a form disagreed by 12px,
 * and the ripple was a different size in each one.
 */

/**
 * Height of a field's content row: the value's 20px line box, which every
 * size centres in its own height.
 */
export const FIELD_CONTENT_HEIGHT_PX = typography.body.b1.leading;

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
    // Collapse the overhang so the button cannot change the field's height.
    marginTop: -OVERHANG_PX,
    marginBottom: -OVERHANG_PX,
    // MUI hands its own end-adornment buttons `edge="end"`, whose -12px
    // right margin is sized for MUI's 14px field padding around a 24px
    // glyph in a 40px button. These fields pad by 12 around a 16px glyph,
    // so the pull would hang the button over the border.
    marginLeft: 0,
    marginRight: 0,
    ...paired(theme, { color: fieldInk.glyph }),
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

/* ------------------------------------------------------------ the design */

/** Field height rung. `md` 36, `lg` 40. */
export type FieldSize = 'md' | 'lg';

/** Validation status, shared by every field. */
export type FieldStatus = 'error' | 'success' | 'warning';

/**
 * Field height per size (node 3179:106156). `md` is the height every field
 * already had, so existing forms keep their rhythm; `lg` is the rung the
 * 1 October redraw adds.
 */
export const FIELD_HEIGHT_BY_SIZE: Record<FieldSize, number> = { md: 36, lg: 40 };

/**
 * The field box's inline inset (`Scale/250`). Replaces the 8px inset #15
 * settled on, which was right for the sheet it was measured against.
 */
export const FIELD_INSET_INLINE_PX = spacing.component.sm;

/** Gap between an adornment and the value (`Scale/200`). */
export const FIELD_GAP_PX = spacing.component.xs;

/**
 * The label and helper rows' inline inset (`Scale/200`) — less than the
 * box's, so their text sits just inside the field's content edge.
 */
export const FIELD_ROW_INSET_PX = spacing.component.xs;

/** Gap between label row, field and helper row (`Scale/100`). */
export const FIELD_STACK_GAP_PX = spacing.component.xxs;

/** The field box's corner (`Scale/100`), down from the 8px it used to be. */
export const FIELD_BOX_RADIUS = radius.xs;

/**
 * A multi-line field is top-aligned at `Scale/200` whatever its size: the
 * sheet's expanded cell starts its first line 8px from the top border and
 * lets the rows run on below, rather than centring a box the content sizes.
 */
export const FIELD_MULTILINE_PADDING_BLOCK_PX = spacing.component.xs;

/** A glyph a caller puts in the label or helper row (`WarningCircle`). */
export const FIELD_ROW_GLYPH_PX = 14;

/**
 * The input's size: 14px, which the sheet calls `Sans/B1/Regular`.
 *
 * A literal, because `typography.body.b1` is 13 — and so is the
 * `Sans/B1/Medium` the button sheet binds, so one rung name resolves to two
 * sizes in two component sets. The leading and tracking do agree with `b1`
 * and are read from it. DESIGNER_QUESTIONS.md #67.
 */
const FIELD_INPUT_SIZE_PX = 14;

/**
 * Vertical padding for a single-line field: whatever centres the 20px line
 * box in the drawn height — 8 at `md`, 10 at `lg`.
 *
 * Both MUI and MUI X draw the border as an absolutely positioned
 * `fieldset`, so it takes no layout space, the way a Figma inside stroke
 * doesn't; nothing has to be given back for it.
 */
export function fieldBlockPadding(size: FieldSize): number {
  return (FIELD_HEIGHT_BY_SIZE[size] - FIELD_CONTENT_HEIGHT_PX) / 2;
}

const sans = fontFamilies.product.sans;

/** The four type treatments a field carries. */
export const fieldType = {
  input: {
    fontFamily: sans,
    fontSize: FIELD_INPUT_SIZE_PX,
    fontWeight: fontWeights.regular,
    lineHeight: `${typography.body.b1.leading}px`,
    letterSpacing: `${typography.body.b1.letterSpacing}em`,
  },
  label: {
    fontFamily: sans,
    fontSize: typography.body.b2.size,
    fontWeight: fontWeights.medium,
    lineHeight: `${typography.body.b2.leading}px`,
    // `Sans/B2/Medium` carries -1% tracking where the Regular cut of the
    // same rung carries none, so the label cannot read it off `b2`.
    letterSpacing: '-0.01em',
  },
  helper: {
    fontFamily: sans,
    fontSize: typography.body.b2.size,
    fontWeight: fontWeights.regular,
    lineHeight: `${typography.body.b2.leading}px`,
    letterSpacing: `${typography.body.b2.letterSpacing}em`,
  },
  counter: {
    fontFamily: sans,
    fontSize: typography.body.caption.size,
    fontWeight: fontWeights.regular,
    lineHeight: `${typography.body.caption.leading}px`,
    letterSpacing: `${typography.body.caption.letterSpacing}em`,
  },
} as const satisfies Record<string, CSSObject>;

/**
 * Every colour the neutral field paints.
 *
 * Hover and focus share a fill — one step down the layer ladder — and focus
 * adds a full-strength hairline on all four sides. That replaces the
 * primary-coloured bottom edge the previous sheet used: focus is now a
 * change of weight rather than of hue.
 */
export const fieldInk = {
  label: text.default.b1,
  asterisk: text.error[3],
  counter: text.default.b3,
  value: text.default.b1,
  placeholder: text.default['placeholder on-color'],
  helper: text.default.b2,
  glyph: icon.default.b3,
  fill: surface.layers.card1,
  fillActive: surface.layers.card2,
  border: border.layers.card3,
  borderFocus: border.layers.card5OnColor,
  disabledInk: text.disabled.default,
  disabledGlyph: icon.disabled.default,
  disabledFill: surface.disabled.default,
  disabledBorder: border.default.default,
} as const satisfies Record<string, ModeToken>;

/**
 * What a status changes. It tints the field as well as outlining it, and
 * colours the helper row and any adornment glyph; the label stays neutral,
 * where the previous sheet coloured it with the status.
 */
export const fieldStatusInk: Record<
  FieldStatus,
  {
    readonly fill: ModeToken;
    readonly border: ModeToken;
    readonly helper: ModeToken;
    readonly glyph: ModeToken;
  }
> = {
  error: {
    fill: surface.error.subtle,
    border: border.error.focus,
    helper: text.error[4],
    glyph: icon.error[3],
  },
  success: {
    fill: surface.success.subtle,
    border: border.success.focus,
    helper: text.success[4],
    glyph: icon.success[3],
  },
  warning: {
    fill: surface.warning.subtle,
    border: border.warning.focus,
    helper: text.warning[2],
    glyph: icon.warning[2],
  },
};

/** Sizes a glyph a caller puts in a label or helper row. */
export function rowGlyph(theme: Theme, ink?: ModeToken): CSSObject {
  return {
    '& svg': {
      width: FIELD_ROW_GLYPH_PX,
      height: FIELD_ROW_GLYPH_PX,
      flexShrink: 0,
      ...(ink && paired(theme, { color: ink })),
    },
  };
}

/** Options for `outlinedFieldStyles`. */
export interface FieldStyleOptions {
  readonly status?: FieldStatus;
  readonly size: FieldSize;
}

/**
 * The whole field, against MUI's `TextField` class tree: label row, box,
 * value, adornments and helper row, in every state and both schemes.
 *
 * `TextField` uses it as it stands; `Select` layers its caret and its
 * pointer cursor on top. Measured in a browser against the sheet: 40/36px
 * boxes, 88/84px stacks with a helper row, and every state's fill, border,
 * helper and glyph colour exact.
 */
export function outlinedFieldStyles(
  theme: Theme,
  { status, size }: FieldStyleOptions
): CSSObject {
  const tone = status ? fieldStatusInk[status] : undefined;
  const restingBorder = tone ? tone.border : fieldInk.border;

  return {
    // Static label above the field, with the character counter
    // right-aligned on the same row (Figma's "1/100").
    '& .MuiInputLabel-root': {
      position: 'static',
      transform: 'none',
      maxWidth: 'none',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      // Packed from the start, with the counter claiming the slack. MUI
      // renders the required asterisk as a *sibling* of the label text, so
      // `space-between` would throw it to the far edge of the field.
      justifyContent: 'flex-start',
      gap: FIELD_STACK_GAP_PX,
      padding: `0 ${FIELD_ROW_INSET_PX}px`,
      marginBottom: FIELD_STACK_GAP_PX,
      ...fieldType.label,
      ...rowGlyph(theme, fieldInk.glyph),
      ...paired(theme, { color: fieldInk.label }),
      // MUI recolours its label on focus and on error from the theme
      // palette, one class deeper than the rule above. The sheet keeps the
      // label neutral in every state but disabled.
      '&.Mui-focused, &.Mui-error': paired(theme, { color: fieldInk.label }),
      '&.Mui-disabled': paired(theme, { color: fieldInk.disabledInk }),
      // The `gap` above spaces it: MUI's node is the string " *", and its
      // leading space collapses at the start of a flex item.
      '& .MuiFormLabel-asterisk': {
        fontWeight: fontWeights.regular,
        ...paired(theme, { color: fieldInk.asterisk }),
      },
      '& .Neoflo-TextField-counter': {
        // MUI appends the asterisk after the label's children, so without
        // `order` a required field with a counter read "Label  1/100 *".
        order: 1,
        marginLeft: 'auto',
        ...fieldType.counter,
        ...paired(theme, { color: fieldInk.counter }),
      },
      '&.Mui-disabled .Neoflo-TextField-counter': paired(theme, {
        color: fieldInk.disabledInk,
      }),
    },
    '& .MuiOutlinedInput-root': {
      borderRadius: FIELD_BOX_RADIUS,
      paddingBlock: fieldBlockPadding(size),
      paddingInline: FIELD_INSET_INLINE_PX,
      gap: FIELD_GAP_PX,
      ...fieldType.input,
      ...paired(theme, {
        color: fieldInk.value,
        backgroundColor: tone ? tone.fill : fieldInk.fill,
      }),
      '& .MuiOutlinedInput-notchedOutline': {
        borderWidth: 1,
        ...paired(theme, { borderColor: restingBorder }),
        // The label renders outside the field, so collapse the notch.
        '& legend': { width: 0 },
      },
      // MUI doubles the border on focus and recolours it on hover from the
      // theme; both are cancelled, and the neutral rule below decides.
      '&:hover .MuiOutlinedInput-notchedOutline, &.Mui-focused .MuiOutlinedInput-notchedOutline':
        {
          borderWidth: 1,
          ...paired(theme, { borderColor: restingBorder }),
        },
      // A status keeps its own tint and hairline through hover and focus,
      // so the field never stops saying what is wrong with it.
      ...(!tone && {
        '&:hover:not(.Mui-disabled), &.Mui-focused': paired(theme, {
          backgroundColor: fieldInk.fillActive,
        }),
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderWidth: 1,
          ...paired(theme, { borderColor: fieldInk.borderFocus }),
        },
      }),
      // A glyph passed straight to `startAdornment` / `endAdornment`,
      // without an `InputAdornment` around it, lands here as a direct
      // child. Both forms are in use — the dashboard and invoice-queue
      // search fields pass the icon bare — so both are sized and inked
      // alike; a bare 24px Phosphor glyph grew a `md` field to 40.
      '& > svg': {
        width: ADORNMENT_GLYPH_PX,
        height: ADORNMENT_GLYPH_PX,
        flexShrink: 0,
        ...paired(theme, { color: tone ? tone.glyph : fieldInk.glyph }),
      },
      '&.Mui-disabled > svg': paired(theme, { color: fieldInk.disabledGlyph }),
      '&.MuiInputBase-multiline': {
        alignItems: 'flex-start',
        paddingBlock: FIELD_MULTILINE_PADDING_BLOCK_PX,
      },
      '&.Mui-disabled': {
        ...paired(theme, {
          color: fieldInk.disabledInk,
          backgroundColor: fieldInk.disabledFill,
        }),
        '& .MuiOutlinedInput-notchedOutline': paired(theme, {
          borderColor: fieldInk.disabledBorder,
        }),
        '& .MuiInputAdornment-root': paired(theme, {
          color: fieldInk.disabledGlyph,
        }),
      },
    },
    '& .MuiOutlinedInput-input': {
      height: 'auto',
      padding: 0,
      '&::placeholder': {
        opacity: 1,
        ...paired(theme, { color: fieldInk.placeholder }),
      },
      '&.Mui-disabled': {
        ...paired(theme, { color: fieldInk.disabledInk }),
        WebkitTextFillColor: 'unset',
      },
    },
    // Multiline padding lives on the root, not the textarea.
    '& .MuiInputBase-inputMultiline': { padding: 0 },
    '& .MuiInputAdornment-root': {
      ...adornmentBox(),
      ...paired(theme, { color: tone ? tone.glyph : fieldInk.glyph }),
      // The sheet draws every adornment glyph at 16. Phosphor's own default
      // is 24, which is taller than the 20px line box, so an unsized icon
      // grew a `md` field to 40 — the height of `lg`.
      '& > svg': { width: ADORNMENT_GLYPH_PX, height: ADORNMENT_GLYPH_PX },
    },
    // Any button in either adornment, wrapped in `InputAdornment` or not:
    // one circular target, one ripple, no effect on the field's height.
    '& .MuiInputAdornment-root .MuiIconButton-root, & .MuiOutlinedInput-root > .MuiIconButton-root':
      adornmentButton(theme),
    '& .MuiFormHelperText-root': {
      // `Scale/100` below the field, and `Scale/100` of padding on the row
      // itself top and bottom, as the sheet stacks them.
      margin: `${FIELD_STACK_GAP_PX}px 0 0`,
      padding: `${FIELD_STACK_GAP_PX}px ${FIELD_ROW_INSET_PX}px`,
      display: 'flex',
      alignItems: 'center',
      gap: FIELD_STACK_GAP_PX,
      ...fieldType.helper,
      ...rowGlyph(theme),
      ...paired(theme, { color: tone ? tone.helper : fieldInk.helper }),
      // MUI paints an error helper from the theme palette, one class deeper.
      '&.Mui-error': paired(theme, {
        color: tone ? tone.helper : fieldInk.helper,
      }),
      '&.Mui-disabled': paired(theme, { color: fieldInk.disabledInk }),
    },
  };
}
