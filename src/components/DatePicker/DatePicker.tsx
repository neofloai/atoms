'use client';

import * as React from 'react';
import { iconButtonClasses } from '@mui/material';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import {
  DatePicker as MuiDatePicker,
  dateCalendarClasses,
  dayCalendarClasses,
  monthCalendarClasses,
  pickerDayClasses,
  pickersCalendarHeaderClasses,
  yearCalendarClasses,
} from '@mui/x-date-pickers';

import {
  CalendarBlankIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  XIcon,
} from '@/src/icons/glyphs';
import { spacing } from '@/src/tokens';

import { paired, pairedFocusRing } from '../_shared/actionStyles';
import {
  glyph,
  mergeSlotProps,
  panelSurface,
  pickerFieldStyles,
} from '../_shared/pickerStyles';
import {
  FIELD_RADIUS,
  HAIRLINE_WIDTH_PX,
  cell,
  fieldType,
  headerType,
  labelType,
} from '../_shared/pickerTokens';
import { today } from './datePickerTokens';

import type { PaperProps } from '@mui/material/Paper';
import type { DatePickerProps, DatePickerStatus } from './DatePicker.types';

const HOUSE_ICONS = {
  openPickerIcon: glyph(CalendarBlankIcon, 'DatePickerOpenIcon'),
  clearIcon: glyph(XIcon, 'DatePickerClearIcon'),
  switchViewIcon: glyph(CaretDownIcon, 'DatePickerSwitchViewIcon'),
  leftArrowIcon: glyph(CaretLeftIcon, 'DatePickerLeftArrowIcon'),
  rightArrowIcon: glyph(CaretRightIcon, 'DatePickerRightArrowIcon'),
} as const;

/* ------------------------------------------------------------------ *
 * The popover
 * ------------------------------------------------------------------ */

/**
 * The floating panel, and the calendar inside it.
 *
 * The panel chrome and the two mobile-only rows around the view come from
 * `panelSurface`, shared with the time picker. Everything below it is the
 * calendar grid — the part with no Figma source, on house colour and MUI's
 * own geometry.
 */
const PanelPaper = styled(Paper)(({ theme }) => ({
  ...panelSurface(theme),

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
      ...paired(theme, { color: cell.ink }),
    },
    [`& .${pickersCalendarHeaderClasses.switchViewIcon}`]: paired(theme, {
      color: cell.glyph,
    }),
    // The arrow buttons and the view-switch button, which are MUI
    // `IconButton`s rather than the house one, so they are recoloured
    // here instead of inheriting.
    [`& .${iconButtonClasses.root}`]: {
      ...paired(theme, { color: cell.glyph }),
      '&:hover': paired(theme, { backgroundColor: cell.hover }),
      [`&.${iconButtonClasses.disabled}`]: paired(theme, {
        color: cell.disabledInk,
      }),
    },
  },

  // --- The weekday row ---
  [`& .${dayCalendarClasses.weekDayLabel}`]: {
    ...labelType,
    ...paired(theme, { color: cell.muted }),
  },
  [`& .${dayCalendarClasses.weekNumberLabel}, & .${dayCalendarClasses.weekNumber}`]:
    {
      ...labelType,
      ...paired(theme, { color: cell.muted }),
    },

  // --- Day cells ---
  [`& .${pickerDayClasses.root}`]: {
    ...fieldType,
    ...paired(theme, { color: cell.ink }),
    '&:hover': paired(theme, { backgroundColor: cell.hover }),
    '&:active': paired(theme, { backgroundColor: cell.pressed }),
    // `pairedFocusRing` rather than `paired` + `focusRing`, which would
    // drop one of the two dark blocks — see `actionStyles.ts`.
    '&:focus-visible': pairedFocusRing(
      theme,
      { backgroundColor: cell.hover },
      cell.focusRing,
      'inset'
    ),
    // Today, while it is not the selected day. The fill and the ring go in
    // one `paired` call so neither discards the other's dark block, and it
    // replaces MUI X's own `alpha(primary, 0.12)` — see `today`.
    [`&.${pickerDayClasses.today}:not(.${pickerDayClasses.selected})`]: {
      borderWidth: HAIRLINE_WIDTH_PX,
      borderStyle: 'solid',
      ...paired(theme, {
        backgroundColor: today.background,
        borderColor: today.border,
      }),
    },
    [`&.${pickerDayClasses.dayOutsideMonth}`]: paired(theme, {
      color: cell.muted,
    }),
    // MUI keys the selected day off the theme's primary palette; the
    // house fill and its on-colour ink go on together so neither
    // `paired` call discards the other's dark block.
    [`&.${pickerDayClasses.selected}`]: {
      ...paired(theme, {
        backgroundColor: cell.selectedBackground,
        color: cell.selectedInk,
      }),
      // `:hover` only, deliberately not `:focus`. MUI X moves focus to the
      // selected day as the calendar opens, so pairing the two would show
      // every freshly opened picker's selection in the hover fill.
      '&:hover': paired(theme, {
        backgroundColor: cell.selectedBackgroundHover,
        color: cell.selectedInk,
      }),
      // Restated rather than inherited from the `:focus-visible` above,
      // whose ring is a primary border drawn inside a primary fill — see
      // `cell.selectedFocusRing`.
      '&:focus-visible': pairedFocusRing(
        theme,
        {
          backgroundColor: cell.selectedBackground,
          color: cell.selectedInk,
        },
        cell.selectedFocusRing,
        'inset'
      ),
    },
    [`&.${pickerDayClasses.disabled}`]: paired(theme, {
      color: cell.disabledInk,
    }),
  },

  // --- Month and year cells, in the `month` and `year` views ---
  [`& .${monthCalendarClasses.button}, & .${yearCalendarClasses.button}`]: {
    ...fieldType,
    borderRadius: FIELD_RADIUS,
    ...paired(theme, { color: cell.ink }),
    '&:hover': paired(theme, { backgroundColor: cell.hover }),
    '&:active': paired(theme, { backgroundColor: cell.pressed }),
    '&:focus-visible': pairedFocusRing(
      theme,
      { backgroundColor: cell.hover },
      cell.focusRing,
      'inset'
    ),
    [`&.${monthCalendarClasses.selected}, &.${yearCalendarClasses.selected}`]: {
      ...paired(theme, {
        backgroundColor: cell.selectedBackground,
        color: cell.selectedInk,
      }),
      // `:hover` and the restated ring, both for the reasons given on the
      // selected day above.
      '&:hover': paired(theme, {
        backgroundColor: cell.selectedBackgroundHover,
        color: cell.selectedInk,
      }),
      '&:focus-visible': pairedFocusRing(
        theme,
        {
          backgroundColor: cell.selectedBackground,
          color: cell.selectedInk,
        },
        cell.selectedFocusRing,
        'inset'
      ),
    },
    [`&.${monthCalendarClasses.disabled}, &.${yearCalendarClasses.disabled}`]:
      paired(theme, { color: cell.disabledInk }),
  },

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

const StyledDatePicker = styled(MuiDatePicker, {
  shouldForwardProp: (prop) => prop !== 'neofloStatus',
})<StyledDatePickerProps>(({ theme, neofloStatus }) =>
  pickerFieldStyles(theme, neofloStatus)
);

/* ------------------------------------------------------------------ *
 * The wrapper
 * ------------------------------------------------------------------ */

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
 * @see Related: TimePicker, TextField, Select, Menu
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
