'use client';

import * as React from 'react';
import {
  formHelperTextClasses,
  iconButtonClasses,
  inputAdornmentClasses,
  inputLabelClasses,
} from '@mui/material';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import {
  DatePicker as MuiDatePicker,
  dateCalendarClasses,
  dayCalendarClasses,
  monthCalendarClasses,
  pickerDayClasses,
  pickersCalendarHeaderClasses,
  pickersInputBaseClasses,
  pickersLayoutClasses,
  pickersOutlinedInputClasses,
  yearCalendarClasses,
} from '@mui/x-date-pickers';

import {
  CalendarBlankIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  XIcon,
} from '@/src/icons';
import { spacing } from '@/src/tokens';

import { paired, pairedFocusRing } from '../_shared/actionStyles';
import { adornmentBox, adornmentButton } from '../_shared/fieldStyles';
import {
  FIELD_CONTENT_HEIGHT_PX,
  FIELD_PADDING_PX,
  FIELD_RADIUS,
  GLYPH_SIZE_PX,
  HAIRLINE_WIDTH_PX,
  PANEL_ELEVATION,
  PANEL_PADDING_PX,
  PANEL_RADIUS,
  calendar,
  field,
  fieldType,
  headerType,
  helperType,
  labelType,
  panel,
  statusBorder,
  statusInk,
} from './datePickerTokens';

import type { PaperProps } from '@mui/material/Paper';
import type { CSSObject } from '@mui/material/styles';
import type { DatePickerProps, DatePickerStatus } from './DatePicker.types';

/**
 * MUI X fills its icon slots with Material `SvgIcon`s and hands them
 * `ownerState`, `fontSize` and `sx`. Phosphor components model none of
 * those, and React would forward the unknown ones onto the `<svg>` — the
 * reason `Tabs` adapts its caret rather than passing the Phosphor
 * component straight in. Each adapter keeps `className`, which is how MUI
 * attaches its own slot class, and drops the rest.
 */
function glyph(Icon: typeof CalendarBlankIcon, displayName: string) {
  const Adapted = ({ className }: { className?: string }) => (
    <Icon className={className} size={GLYPH_SIZE_PX} />
  );
  Adapted.displayName = displayName;
  return Adapted;
}

const OpenPickerIcon = glyph(CalendarBlankIcon, 'DatePickerOpenIcon');
const ClearIcon = glyph(XIcon, 'DatePickerClearIcon');
const SwitchViewIcon = glyph(CaretDownIcon, 'DatePickerSwitchViewIcon');
const LeftArrowIcon = glyph(CaretLeftIcon, 'DatePickerLeftArrowIcon');
const RightArrowIcon = glyph(CaretRightIcon, 'DatePickerRightArrowIcon');

const HOUSE_ICONS = {
  openPickerIcon: OpenPickerIcon,
  clearIcon: ClearIcon,
  switchViewIcon: SwitchViewIcon,
  leftArrowIcon: LeftArrowIcon,
  rightArrowIcon: RightArrowIcon,
} as const;

/* ------------------------------------------------------------------ *
 * The popover
 * ------------------------------------------------------------------ */

/**
 * The floating panel, and everything inside it.
 *
 * One styled `Paper` serves both the desktop popper and the mobile
 * dialog, because MUI X types `desktopPaper` and `mobilePaper` as the
 * same component and the calendar renders inside the paper in either
 * mode — so every selector below reaches the grid without a second copy.
 *
 * The panel chrome is `Menu`'s, token for token (node 3228:62331). The
 * calendar's colour is house tokens on MUI's own geometry; see
 * `datePickerTokens.ts` for why that split exists.
 */
const PanelPaper = styled(Paper)(({ theme }) => ({
  borderRadius: PANEL_RADIUS,
  padding: PANEL_PADDING_PX,
  borderWidth: HAIRLINE_WIDTH_PX,
  borderStyle: 'solid',
  boxShadow: PANEL_ELEVATION,
  // MUI tints elevated `Paper` in dark mode with an overlay gradient
  // keyed off the elevation, which would double-tint a surface token
  // that already carries its own dark value — `Menu` cancels the same.
  backgroundImage: 'none',
  ...paired(theme, {
    backgroundColor: panel.background,
    borderColor: panel.border,
  }),

  // The layout owns no chrome of its own; the paper above is the surface.
  [`& .${pickersLayoutClasses.contentWrapper}`]: {
    ...paired(theme, { color: calendar.ink }),
  },

  // --- Month header: the label, its caret, and the two arrows ---
  [`& .${pickersCalendarHeaderClasses.root}`]: {
    // MUI's default header reserves a 30px top margin for a floating
    // label the house field does not have.
    paddingLeft: spacing.component.xs,
    paddingRight: spacing.component.xs,
    marginTop: spacing.component.xxs,
    marginBottom: spacing.component.xxs,
    [`& .${pickersCalendarHeaderClasses.label}`]: {
      ...headerType,
      ...paired(theme, { color: calendar.ink }),
    },
    [`& .${pickersCalendarHeaderClasses.switchViewIcon}`]: paired(theme, {
      color: calendar.glyph,
    }),
    // The arrow buttons and the view-switch button, which are MUI
    // `IconButton`s rather than the house one, so they are recoloured
    // here instead of inheriting.
    [`& .${iconButtonClasses.root}`]: {
      ...paired(theme, { color: calendar.glyph }),
      '&:hover': paired(theme, { backgroundColor: calendar.cellHover }),
      [`&.${iconButtonClasses.disabled}`]: paired(theme, {
        color: calendar.disabledInk,
      }),
    },
  },

  // --- The weekday row ---
  [`& .${dayCalendarClasses.weekDayLabel}`]: {
    ...labelType,
    ...paired(theme, { color: calendar.muted }),
  },
  [`& .${dayCalendarClasses.weekNumberLabel}, & .${dayCalendarClasses.weekNumber}`]:
    {
      ...labelType,
      ...paired(theme, { color: calendar.muted }),
    },

  // --- Day cells ---
  [`& .${pickerDayClasses.root}`]: {
    ...fieldType,
    ...paired(theme, { color: calendar.ink }),
    '&:hover': paired(theme, { backgroundColor: calendar.cellHover }),
    '&:active': paired(theme, { backgroundColor: calendar.cellPressed }),
    // `pairedFocusRing` rather than `paired` + `focusRing`, which would
    // drop one of the two dark blocks — see `actionStyles.ts`.
    '&:focus-visible': pairedFocusRing(
      theme,
      { backgroundColor: calendar.cellHover },
      calendar.focusRing,
      'inset'
    ),
    // Today, while it is not the selected day. The fill and the ring go in
    // one `paired` call so neither discards the other's dark block, and it
    // replaces MUI X's own `alpha(primary, 0.12)` — see `todayBackground`.
    [`&.${pickerDayClasses.today}:not(.${pickerDayClasses.selected})`]: {
      borderWidth: HAIRLINE_WIDTH_PX,
      borderStyle: 'solid',
      ...paired(theme, {
        backgroundColor: calendar.todayBackground,
        borderColor: calendar.todayBorder,
      }),
    },
    [`&.${pickerDayClasses.dayOutsideMonth}`]: paired(theme, {
      color: calendar.muted,
    }),
    // MUI keys the selected day off the theme's primary palette; the
    // house fill and its on-colour ink go on together so neither
    // `paired` call discards the other's dark block.
    [`&.${pickerDayClasses.selected}`]: {
      ...paired(theme, {
        backgroundColor: calendar.selectedBackground,
        color: calendar.selectedInk,
      }),
      // `:hover` only, deliberately not `:focus`. MUI X moves focus to the
      // selected day as the calendar opens, so pairing the two would show
      // every freshly opened picker's selection in the hover fill. Keyboard
      // focus is carried by the ring on `:focus-visible` above instead.
      '&:hover': paired(theme, {
        backgroundColor: calendar.selectedBackgroundHover,
        color: calendar.selectedInk,
      }),
    },
    [`&.${pickerDayClasses.disabled}`]: paired(theme, {
      color: calendar.disabledInk,
    }),
  },

  // --- Month and year cells, in the `month` and `year` views ---
  [`& .${monthCalendarClasses.button}, & .${yearCalendarClasses.button}`]: {
    ...fieldType,
    borderRadius: FIELD_RADIUS,
    ...paired(theme, { color: calendar.ink }),
    '&:hover': paired(theme, { backgroundColor: calendar.cellHover }),
    '&:active': paired(theme, { backgroundColor: calendar.cellPressed }),
    '&:focus-visible': pairedFocusRing(
      theme,
      { backgroundColor: calendar.cellHover },
      calendar.focusRing,
      'inset'
    ),
    [`&.${monthCalendarClasses.selected}, &.${yearCalendarClasses.selected}`]: {
      ...paired(theme, {
        backgroundColor: calendar.selectedBackground,
        color: calendar.selectedInk,
      }),
      // `:hover` only, for the reason given on the selected day above.
      '&:hover': paired(theme, {
        backgroundColor: calendar.selectedBackgroundHover,
        color: calendar.selectedInk,
      }),
    },
    [`&.${monthCalendarClasses.disabled}, &.${yearCalendarClasses.disabled}`]:
      paired(theme, { color: calendar.disabledInk }),
  },

  // The mobile dialog's Cancel / OK row, and the toolbar above it.
  [`& .${pickersLayoutClasses.actionBar} .${iconButtonClasses.root}`]: paired(
    theme,
    { color: calendar.glyph }
  ),
  [`& .${dateCalendarClasses.root}`]: {
    // MUI caps the calendar at 336px; the panel's own 4px inset would
    // otherwise be swallowed by the grid's fixed width.
    maxWidth: '100%',
  },
})) as React.JSXElementConstructor<PaperProps>;

/* ------------------------------------------------------------------ *
 * The field
 * ------------------------------------------------------------------ */

interface StyledDatePickerProps {
  neofloStatus?: DatePickerStatus;
}

/**
 * The field. Every declaration here is `TextField`'s, restated against
 * MUI X's parallel class tree — see `datePickerTokens.ts` for why the two
 * cannot share.
 */
const StyledDatePicker = styled(MuiDatePicker, {
  shouldForwardProp: (prop) => prop !== 'neofloStatus',
})<StyledDatePickerProps>(({ theme, neofloStatus }) => {
  const styles: CSSObject = {
    // Static label above the field rather than MUI's floating one, which
    // is what the house field does (node 3179:106156).
    [`& .${inputLabelClasses.root}`]: {
      position: 'static',
      transform: 'none',
      maxWidth: 'none',
      padding: `0 ${FIELD_PADDING_PX}px`,
      marginBottom: spacing.component.xxs,
      ...labelType,
      ...paired(theme, { color: field.label }),
      // MUI colours a focused label with the theme primary; the house
      // label stays neutral unless a status recolours it below.
      [`&.${inputLabelClasses.focused}`]: paired(theme, { color: field.label }),
      [`&.${inputLabelClasses.disabled}`]: paired(theme, {
        color: field.disabledInk,
      }),
    },
    [`& .${pickersOutlinedInputClasses.root}`]: {
      borderRadius: FIELD_RADIUS,
      padding: FIELD_PADDING_PX,
      gap: FIELD_PADDING_PX,
      ...fieldType,
      ...paired(theme, {
        color: field.ink,
        backgroundColor: field.background,
      }),
      [`& .${pickersOutlinedInputClasses.notchedOutline}`]: {
        borderWidth: HAIRLINE_WIDTH_PX,
        ...paired(theme, { borderColor: field.border }),
        // The label sits outside the field, so there is no notch to cut.
        '& legend': { width: 0 },
      },
      // Focus keeps the resting border on three sides and recolours only
      // the bottom edge. MUI X sets its own focused border colour and
      // doubles the width, so both are cancelled first — and the two
      // colours go in one `paired` call, `borderColor` before
      // `borderBottomColor`, so the override wins in both schemes.
      //
      // `.Mui-focused` is repeated to break a specificity tie. MUI X's own
      // rule is `&.Mui-focused:not(.Mui-error) .notchedOutline`, whose
      // `:not()` contributes its argument's weight — four classes, the same
      // as this selector had, so MUI X won on injection order and painted
      // the primary colour on all four edges.
      [`&.${pickersOutlinedInputClasses.focused}.${pickersOutlinedInputClasses.focused} .${pickersOutlinedInputClasses.notchedOutline}`]:
        {
          borderWidth: HAIRLINE_WIDTH_PX,
          ...paired(theme, {
            borderColor: field.border,
            borderBottomColor: field.borderFocus,
          }),
        },
      [`&.${pickersOutlinedInputClasses.disabled}`]: {
        ...paired(theme, {
          color: field.disabledInk,
          backgroundColor: field.disabledBackground,
        }),
        [`& .${pickersOutlinedInputClasses.notchedOutline}`]: paired(theme, {
          borderColor: field.disabledBorder,
        }),
      },
      // v9 underlines the section being edited. The house field carries
      // its focus on the bottom border instead, and two accents on one
      // edge read as a rendering fault rather than as emphasis.
      [`& .${pickersInputBaseClasses.activeBar}`]: { display: 'none' },
    },
    // MUI X pads the sections container to make room for a floating
    // label; the padding is on the root here, as it is on `TextField`.
    // Its line height is restated for the reason given on
    // `FIELD_CONTENT_HEIGHT_PX` — MUI X's `1.4375em` resolves to 18.69px
    // on this ramp and would leave the field 1.3px shorter than the text
    // field beside it.
    [`& .${pickersInputBaseClasses.sectionsContainer}`]: {
      padding: 0,
      height: FIELD_CONTENT_HEIGHT_PX,
      lineHeight: `${FIELD_CONTENT_HEIGHT_PX}px`,
    },
    [`& .${pickersInputBaseClasses.root}`]: {
      ...fieldType,
    },
    [`& .${formHelperTextClasses.root}`]: {
      margin: `${spacing.component.xxs}px 0 0`,
      padding: `0 ${FIELD_PADDING_PX}px`,
      ...helperType,
      ...paired(theme, { color: field.label }),
      [`&.${formHelperTextClasses.disabled}`]: paired(theme, {
        color: field.disabledInk,
      }),
    },
    [`& .${inputAdornmentClasses.root}`]: adornmentBox(),
    // The calendar button and the clear button beside it, on exactly the
    // geometry `TextField`'s adornment buttons use — same circular target,
    // same ripple, and no effect on the field's height.
    [`& .${iconButtonClasses.root}`]: {
      ...adornmentButton(theme),
      '&:hover': paired(theme, { backgroundColor: calendar.cellHover }),
      [`&.${iconButtonClasses.disabled}`]: paired(theme, {
        color: field.disabledInk,
      }),
    },
  };

  if (!neofloStatus) {
    // No status: a subtle tint carries hover, matching the house field's
    // `hover` cell. Skipped once a status owns the border instead.
    styles[`& .${pickersOutlinedInputClasses.root}`] = {
      ...(styles[`& .${pickersOutlinedInputClasses.root}`] as CSSObject),
      [`&:hover:not(.${pickersOutlinedInputClasses.focused}):not(.${pickersOutlinedInputClasses.disabled})`]:
        paired(theme, { backgroundColor: field.backgroundHover }),
    };
  } else {
    // Status colour wins over the resting, hover and focused borders,
    // and recolours the label and helper text.
    styles[
      [
        `& .${pickersOutlinedInputClasses.root} .${pickersOutlinedInputClasses.notchedOutline}`,
        `& .${pickersOutlinedInputClasses.root}:hover .${pickersOutlinedInputClasses.notchedOutline}`,
        `& .${pickersOutlinedInputClasses.root}.${pickersOutlinedInputClasses.focused} .${pickersOutlinedInputClasses.notchedOutline}`,
      ].join(', ')
    ] = paired(theme, { borderColor: statusBorder[neofloStatus] });
    // Merged into the existing selectors rather than added as separate
    // rules, so each nested `.Mui-disabled` override stays one class more
    // specific and keeps winning regardless of declaration order.
    styles[`& .${inputLabelClasses.root}`] = {
      ...(styles[`& .${inputLabelClasses.root}`] as CSSObject),
      ...paired(theme, { color: statusInk[neofloStatus] }),
    };
    styles[`& .${formHelperTextClasses.root}`] = {
      ...(styles[`& .${formHelperTextClasses.root}`] as CSSObject),
      ...paired(theme, { color: statusInk[neofloStatus] }),
    };
  }

  return styles;
});

/* ------------------------------------------------------------------ *
 * The wrapper
 * ------------------------------------------------------------------ */

/**
 * Merges one of the wrapper's slot-prop defaults with whatever the caller
 * passed for the same slot.
 *
 * MUI X accepts either an object or a callback for every entry in
 * `slotProps`. Spreading an object over a callback would drop the
 * callback, so a caller's function is wrapped instead: it is invoked with
 * the same `ownerState` MUI X would have given it, and its result is
 * layered over the defaults. Either way the caller wins on conflict.
 */
function mergeSlotProps<Defaults extends object>(
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

/**
 * Branded date picker. Wraps MUI X `DatePicker` — a field you can type a
 * date into, and a calendar in a popover on pointer devices or a modal on
 * touch ones.
 *
 * **The value is a Day.js object, not a native `Date`.** Atoms
 * standardises on Day.js: it is MUI X's own recommendation and the
 * smallest of the four supported libraries (~7.5 KB gzipped with its
 * adapter), and pinning one library rather than exposing the adapter as a
 * prop is what keeps every Neoflo app agreeing on a single date type. The
 * adapter is installed by `NeofloThemeProvider`, so there is nothing to
 * configure — but a picker rendered outside that provider will throw,
 * because MUI X reads its adapter from context.
 *
 * Every capability of MUI X's `DatePicker` survives, including the ones
 * this wrapper does not mention: `views`, `openTo`, `minDate` / `maxDate`,
 * `disableFuture` / `disablePast`, `shouldDisableDate`, `format`,
 * `timezone`, controlled `open`, `onAccept`, `onError`, and the whole
 * `slots` / `slotProps` tree. Only the responsive variants are not
 * exported separately: `DatePicker` already renders the desktop popover
 * or the mobile modal off `desktopModeMediaQuery`, which is MUI's own
 * switch and still a prop here.
 *
 * Four things are moved and one is swapped:
 *
 *   - `status`, `helperText` and `fullWidth` are lifted out of
 *     `slotProps.textField`, and `clearable` out of `slotProps.field`, so
 *     the picker reads like the house `TextField` it sits beside. Passing
 *     your own `slotProps` still works — the two are merged, and yours
 *     wins.
 *   - the five Material glyphs MUI X ships (the calendar button, the
 *     clear button, the view caret, and the two month arrows) are
 *     replaced with their Phosphor equivalents at 16px.
 *
 * The field is styled to match `TextField` exactly, with one divergence
 * it cannot reach: MUI X fades the `MM/DD/YYYY` placeholder with an
 * opacity it computes from `ownerState`, so no selector can swap it for
 * the house placeholder ink. It resolves to a near-identical grey.
 *
 * @example A labelled picker
 * <DatePicker label="Departure" />
 *
 * @example Controlled, with a range it will accept
 * const [date, setDate] = React.useState<Dayjs | null>(null);
 *
 * <DatePicker
 *   label="Departure"
 *   value={date}
 *   onChange={setDate}
 *   minDate={dayjs()}
 *   maxDate={dayjs().add(1, 'year')}
 * />
 *
 * @example Validation, in the house statuses
 * <DatePicker label="Departure" status="error" helperText="Pick a date" />
 *
 * @example Month and year only
 * <DatePicker label="Expires" views={['year', 'month']} format="MM/YYYY" />
 *
 * @see Related: TextField, Select, Menu
 */
export const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  function DatePicker(
    { status, helperText, fullWidth, clearable, slots, slotProps, ...rest },
    ref
  ) {
    return (
      <StyledDatePicker
        ref={ref}
        neofloStatus={status}
        slots={{
          desktopPaper: PanelPaper,
          mobilePaper: PanelPaper,
          ...HOUSE_ICONS,
          // Spread last so a caller replacing any slot — including the
          // paper or an icon — still wins.
          ...slots,
        }}
        slotProps={{
          ...slotProps,
          textField: mergeSlotProps(
            {
              error: status === 'error',
              helperText,
              fullWidth,
              // `shrink` pins the label above the field and, with the
              // zeroed legend in the styles, keeps the notch closed.
              slotProps: {
                inputLabel: { shrink: true, disableAnimation: true },
              },
            },
            slotProps?.textField
          ),
          field: mergeSlotProps({ clearable }, slotProps?.field),
        }}
        {...rest}
      />
    );
  }
);

DatePicker.displayName = 'DatePicker';
