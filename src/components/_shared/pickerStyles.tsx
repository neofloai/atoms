import {
  buttonClasses,
  formHelperTextClasses,
  formLabelClasses,
  iconButtonClasses,
  inputAdornmentClasses,
  inputLabelClasses,
} from '@mui/material';
import {
  pickersInputBaseClasses,
  pickersLayoutClasses,
  pickersOutlinedInputClasses,
} from '@mui/x-date-pickers';

import { fontWeights } from '@/src/tokens';

import { appearanceStyles, paired } from './actionStyles';
import {
  FIELD_BOX_RADIUS,
  FIELD_CONTENT_HEIGHT_PX,
  FIELD_GAP_PX,
  FIELD_INSET_INLINE_PX,
  FIELD_ROW_INSET_PX,
  FIELD_STACK_GAP_PX,
  adornmentBox,
  adornmentButton,
  fieldBlockPadding,
  fieldInk,
  fieldStatusInk,
  fieldType,
  rowGlyph,
} from './fieldStyles';
import {
  GLYPH_SIZE_PX,
  HAIRLINE_WIDTH_PX,
  PANEL_ELEVATION,
  PANEL_PADDING_PX,
  PANEL_RADIUS,
  cell,
  panel,
} from './pickerTokens';

import type * as React from 'react';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FieldStyleOptions } from './fieldStyles';

/**
 * The CSS every MUI X picker in the library shares: its field, and the
 * chrome of the panel its view opens in. Only the view itself — a calendar
 * grid, a clock — is written per component.
 *
 * Kept here for the reason given at the top of `pickerTokens.ts`: the field
 * and the panel are the same design in both pickers, and two copies of 150
 * lines of selectors would drift.
 */

/**
 * Adapts a Phosphor icon for one of MUI X's icon slots.
 *
 * MUI X fills those slots with Material `SvgIcon`s and hands them
 * `ownerState`, `fontSize` and `sx`. Phosphor components model none of
 * those, and React would forward the unknown ones onto the `<svg>` — the
 * reason `Tabs` adapts its caret rather than passing the Phosphor
 * component straight in. The adapter keeps `className`, which is how MUI
 * attaches its own slot class, and drops the rest.
 */
export function glyph(
  Icon: React.ComponentType<{ className?: string; size?: number }>,
  displayName: string
) {
  const Adapted = ({ className }: { className?: string }) => (
    <Icon className={className} size={GLYPH_SIZE_PX} />
  );
  Adapted.displayName = displayName;
  return Adapted;
}

/**
 * The floating panel, and the two rows MUI X puts around the view inside
 * it: the toolbar above and the action bar below.
 *
 * When each of those appears is not symmetrical between the two pickers.
 * The toolbar is mobile-only. The action bar renders whenever
 * `closeOnSelect` is false, and `DesktopDatePicker` defaults it to `true`
 * while `DesktopTimePicker` leaves it unset — so a date popover has no
 * action bar and a *time* popover carries Cancel / OK on the desktop too.
 * That is MUI's own default and the right one: picking an hour should not
 * dismiss the popover before the minutes have been picked.
 *
 * Spread this into a styled `Paper` and follow it with the component's own
 * view styles. One `Paper` serves both the desktop popper and the mobile
 * dialog, because MUI X types `desktopPaper` and `mobilePaper` as the same
 * component and the view renders inside the paper in either mode — so
 * descendant selectors reach it without a second copy.
 *
 * The chrome itself is `Menu`'s, token for token (node 3228:62331).
 */
export function panelSurface(theme: Theme): CSSObject {
  return {
    borderRadius: PANEL_RADIUS,
    padding: PANEL_PADDING_PX,
    borderWidth: HAIRLINE_WIDTH_PX,
    borderStyle: 'solid',
    boxShadow: PANEL_ELEVATION,

    // Both of these are MUI X's own, on the `MuiPickerPopper-paper` this
    // slot replaces, and both have to be restated because replacing the
    // slot replaces the component that carried them.
    //
    // `transformOrigin` is the one that shows: the popper is positioned
    // `bottom-start` against the field, but the `Grow` transition scales the
    // paper from its `transform-origin`, and a `Paper` on its own defaults
    // to `center center` — so the panel grew out of its own middle instead
    // of unfolding from the field's edge. MUI flips it to the bottom when
    // the popper has no room below and lands above the field instead, which
    // it signals with `data-popper-placement` on the popper root; matching
    // on that attribute keeps this a plain style function rather than one
    // that has to be handed `ownerState`.
    outline: 0,
    transformOrigin: 'top center',
    '[data-popper-placement^="top"] &': {
      transformOrigin: 'bottom center',
    },
    // MUI tints elevated `Paper` in dark mode with an overlay gradient
    // keyed off the elevation, which would double-tint a surface token
    // that already carries its own dark value — `Menu` cancels the same.
    backgroundImage: 'none',
    ...paired(theme, {
      backgroundColor: panel.background,
      borderColor: panel.border,
    }),

    // The layout owns no chrome of its own; the paper above is the surface.
    [`& .${pickersLayoutClasses.contentWrapper}`]: paired(theme, {
      color: cell.ink,
    }),

    // The mobile modal's toolbar: the current value, with the segment
    // being edited carried at full strength and the rest muted. MUI draws
    // it from `palette.text.secondary` / `text.primary`, which are close
    // to these but are not the tokens the rest of the panel reads from.
    [`& .${pickersLayoutClasses.toolbar}`]: {
      ...paired(theme, { color: cell.muted }),
      '& .Mui-selected': paired(theme, { color: cell.ink }),
    },

    // The Cancel / OK row — the mobile modal's, and the desktop time
    // popover's. MUI renders these as its own text `Button`s, so they arrive
    // on `palette.primary` rather than on the house text-button treatment;
    // `appearanceStyles` is the same table `Button variant="primary"
    // appearance="text"` reads from.
    [`& .${pickersLayoutClasses.actionBar} .${buttonClasses.root}`]:
      appearanceStyles(theme, 'primary', 'text', 'button'),
  };
}

/**
 * The picker's field: `TextField`'s field, against MUI X's parallel class
 * tree.
 *
 * ## Why it is restated rather than shared with `TextField`
 *
 * MUI X v9 renders its field through `PickersTextField`, not MUI's
 * `TextField`. It is a parallel implementation with a parallel class tree —
 * `MuiPickersOutlinedInput-root` where MUI has `MuiOutlinedInput-root`,
 * `MuiPickersInputBase-sectionsContainer` where MUI has an `<input>` — so
 * nothing that targets `.MuiOutlinedInput-*` reaches it, and neither does
 * the theme's `MuiTextField` override.
 *
 * The structure differs for a reason: the value is not one input but a span
 * per section, which is what lets the arrow keys step the month
 * independently of the year, or the hour independently of the minute. v9
 * removed the escape hatch that used to render a plain input
 * (`enableAccessibleFieldDOMStructure={false}`), so this is the only field
 * MUI X has.
 *
 * So the selectors are restated, but not the design: every size, colour and
 * type treatment below is imported from `fieldStyles.ts`, the module
 * `TextField` and `Select` read too. Before the 1 October redraw this file
 * carried its own copy of the tokens, and that copy is how the pickers came
 * to be drawing the previous sheet beside a redrawn text field.
 */
export function pickerFieldStyles(
  theme: Theme,
  { status, size }: FieldStyleOptions
): CSSObject {
  const tone = status ? fieldStatusInk[status] : undefined;
  const restingBorder = tone ? tone.border : fieldInk.border;
  const root = pickersOutlinedInputClasses.root;
  const outline = pickersOutlinedInputClasses.notchedOutline;
  const focused = pickersOutlinedInputClasses.focused;
  const disabled = pickersOutlinedInputClasses.disabled;

  return {
    // Static label above the field rather than MUI's floating one.
    [`& .${inputLabelClasses.root}`]: {
      position: 'static',
      transform: 'none',
      maxWidth: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: FIELD_STACK_GAP_PX,
      padding: `0 ${FIELD_ROW_INSET_PX}px`,
      marginBottom: FIELD_STACK_GAP_PX,
      ...fieldType.label,
      ...rowGlyph(theme, fieldInk.glyph),
      ...paired(theme, { color: fieldInk.label }),
      // MUI colours a focused or errored label from the theme palette; the
      // house label stays neutral in every state but disabled.
      [`&.${inputLabelClasses.focused}, &.${inputLabelClasses.error}`]:
        paired(theme, { color: fieldInk.label }),
      [`&.${inputLabelClasses.disabled}`]: paired(theme, {
        color: fieldInk.disabledInk,
      }),
      [`& .${formLabelClasses.asterisk}`]: {
        fontWeight: fontWeights.regular,
        ...paired(theme, { color: fieldInk.asterisk }),
      },
    },
    [`& .${root}`]: {
      borderRadius: FIELD_BOX_RADIUS,
      paddingBlock: fieldBlockPadding(size),
      paddingInline: FIELD_INSET_INLINE_PX,
      gap: FIELD_GAP_PX,
      ...fieldType.input,
      ...paired(theme, {
        color: fieldInk.value,
        backgroundColor: tone ? tone.fill : fieldInk.fill,
      }),
      [`& .${outline}`]: {
        borderWidth: HAIRLINE_WIDTH_PX,
        ...paired(theme, { borderColor: restingBorder }),
        // The label sits outside the field, so there is no notch to cut.
        '& legend': { width: 0 },
      },
      // MUI X doubles the border on focus and recolours it from the theme.
      // `.Mui-focused` is repeated to break a specificity tie: MUI X's own
      // rule is `&.Mui-focused:not(.Mui-error) .notchedOutline`, whose
      // `:not()` contributes its argument's weight — four classes, the same
      // as a single `.Mui-focused` here, so MUI X won on injection order.
      [`&:hover .${outline}, &.${focused}.${focused} .${outline}`]: {
        borderWidth: HAIRLINE_WIDTH_PX,
        ...paired(theme, { borderColor: restingBorder }),
      },
      // Neutral hover and focus: one step down the layer ladder, and on
      // focus a full-strength hairline on all four sides. A status keeps its
      // own tint and border through both.
      ...(!tone && {
        [`&:hover:not(.${disabled}), &.${focused}`]: paired(theme, {
          backgroundColor: fieldInk.fillActive,
        }),
        [`&.${focused}.${focused} .${outline}`]: {
          borderWidth: HAIRLINE_WIDTH_PX,
          ...paired(theme, { borderColor: fieldInk.borderFocus }),
        },
      }),
      [`&.${disabled}`]: {
        ...paired(theme, {
          color: fieldInk.disabledInk,
          backgroundColor: fieldInk.disabledFill,
        }),
        [`& .${outline}`]: paired(theme, {
          borderColor: fieldInk.disabledBorder,
        }),
      },
      // v9 underlines the section being edited. The house field carries its
      // focus on the border instead, and two accents read as a fault.
      [`& .${pickersInputBaseClasses.activeBar}`]: { display: 'none' },
    },
    // MUI X pads the sections container to make room for a floating label;
    // the padding is on the root here, as it is on `TextField`. Its line
    // height is restated because MUI X's `1.4375em` resolves to 20.13px at
    // 14px and would leave the field a fraction taller than the text field
    // beside it.
    [`& .${pickersInputBaseClasses.sectionsContainer}`]: {
      padding: 0,
      height: FIELD_CONTENT_HEIGHT_PX,
      lineHeight: `${FIELD_CONTENT_HEIGHT_PX}px`,
    },
    [`& .${pickersInputBaseClasses.root}`]: fieldType.input,
    [`& .${formHelperTextClasses.root}`]: {
      margin: `${FIELD_STACK_GAP_PX}px 0 0`,
      padding: `${FIELD_STACK_GAP_PX}px ${FIELD_ROW_INSET_PX}px`,
      display: 'flex',
      alignItems: 'center',
      gap: FIELD_STACK_GAP_PX,
      ...fieldType.helper,
      ...rowGlyph(theme),
      ...paired(theme, { color: tone ? tone.helper : fieldInk.helper }),
      [`&.${formHelperTextClasses.error}`]: paired(theme, {
        color: tone ? tone.helper : fieldInk.helper,
      }),
      [`&.${formHelperTextClasses.disabled}`]: paired(theme, {
        color: fieldInk.disabledInk,
      }),
    },
    [`& .${inputAdornmentClasses.root}`]: {
      ...adornmentBox(),
      ...paired(theme, { color: tone ? tone.glyph : fieldInk.glyph }),
    },
    // The open-picker button and the clear button beside it, on exactly the
    // geometry `TextField`'s adornment buttons use — same circular target,
    // same ripple, and no effect on the field's height.
    [`& .${iconButtonClasses.root}`]: {
      ...adornmentButton(theme),
      ...(tone && paired(theme, { color: tone.glyph })),
      '&:hover': paired(theme, { backgroundColor: cell.hover }),
      [`&.${iconButtonClasses.disabled}`]: paired(theme, {
        color: fieldInk.disabledGlyph,
      }),
    },
  };
}

/**
 * Merges one of a wrapper's slot-prop defaults with whatever the caller
 * passed for the same slot.
 *
 * MUI X accepts either an object or a callback for every entry in
 * `slotProps`. Spreading an object over a callback would drop the
 * callback, so a caller's function is wrapped instead: it is invoked with
 * the same `ownerState` MUI X would have given it, and its result is
 * layered over the defaults. Either way the caller wins on conflict.
 */
export function mergeSlotProps<Defaults extends object>(
  defaults: Defaults,
  callerProps: unknown
): Defaults | ((ownerState: never) => Defaults) {
  if (callerProps === undefined) return defaults;
  if (typeof callerProps === 'function') {
    return (ownerState: never) => ({
      ...defaults,
      ...(callerProps as (state: never) => object)(ownerState),
    });
  }
  return { ...defaults, ...(callerProps as object) };
}
