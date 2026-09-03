'use client';

import * as React from 'react';
import { iconButtonClasses, menuItemClasses } from '@mui/material';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import {
  TimePicker as MuiTimePicker,
  clockClasses,
  clockNumberClasses,
  clockPointerClasses,
  digitalClockClasses,
  multiSectionDigitalClockClasses,
  multiSectionDigitalClockSectionClasses,
  timeClockClasses,
} from '@mui/x-date-pickers';

import { CaretLeftIcon, CaretRightIcon, ClockIcon, XIcon } from '@/src/icons/glyphs';
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
  panel,
} from '../_shared/pickerTokens';
import { clockFace } from './timePickerTokens';

import type { PaperProps } from '@mui/material/Paper';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { TimePickerProps, TimePickerStatus } from './TimePicker.types';

const HOUSE_ICONS = {
  openPickerIcon: glyph(ClockIcon, 'TimePickerOpenIcon'),
  clearIcon: glyph(XIcon, 'TimePickerClearIcon'),
  leftArrowIcon: glyph(CaretLeftIcon, 'TimePickerLeftArrowIcon'),
  rightArrowIcon: glyph(CaretRightIcon, 'TimePickerRightArrowIcon'),
} as const;

/* ------------------------------------------------------------------ *
 * The popover
 * ------------------------------------------------------------------ */

/**
 * One value in a clock column — an hour, a minute, a meridiem.
 *
 * MUI X builds these columns out of MUI `MenuList` / `MenuItem`, which is
 * the right structure and the wrong styling: the items arrive on MUI's own
 * `MenuItem` rather than the house one, because `src/components/MenuItem`
 * is a styled component and not a theme override, so nothing MUI X renders
 * internally can pick it up.
 *
 * The treatment below is therefore `MenuItem`'s, restated — 8px corners, an
 * 8px inset, one density, the disabled ink instead of MUI's 38% opacity —
 * with two departures, both because these are *values* rather than commands:
 *
 *   - rows sit flush, as `Menu` specifies (the panel owns the inset and the
 *     gap between items is `Scale/0`). MUI's own `2px` vertical margin is
 *     not a rung on the spacing ladder.
 *   - a selected value takes the *solid* primary fill a selected day takes
 *     in the calendar, not the subtle tint a selected `MenuItem` takes. A
 *     picker's two views have to agree with each other before either agrees
 *     with a menu.
 */
function clockItem(theme: Theme): CSSObject {
  return {
    ...fieldType,
    borderRadius: FIELD_RADIUS,
    padding: spacing.component.xs,
    // Flush vertically; the 4px each side is the panel's own inset, carried
    // in on the item because the scrolling column cannot pad itself.
    margin: `0 ${spacing.component.xxs}px`,
    // MUI's `&:first-of-type { marginTop: 4 }` on top of the panel's inset
    // would double it.
    '&:first-of-type': { marginTop: 0 },
    // MUI floors menu rows at 48px below the `sm` breakpoint, which would
    // make a column taller on a narrow window than on a wide one.
    minHeight: 'auto',
    ...paired(theme, { color: cell.ink }),
    '&:hover': paired(theme, { backgroundColor: cell.hover }),
    '&:active': paired(theme, { backgroundColor: cell.pressed }),
    [`&.${menuItemClasses.focusVisible}`]: pairedFocusRing(
      theme,
      { backgroundColor: cell.hover },
      cell.focusRing,
      'inset'
    ),
    [`&.${menuItemClasses.selected}`]: {
      ...paired(theme, {
        backgroundColor: cell.selectedBackground,
        color: cell.selectedInk,
      }),
      '&:hover': paired(theme, {
        backgroundColor: cell.selectedBackgroundHover,
        color: cell.selectedInk,
      }),
      // MUI X scrolls the selected value into view and focuses it as the
      // clock opens, so a focused-selected row has to keep the selected fill
      // rather than picking up hover. It also has to restate the ring rather
      // than inherit the one above, which is a primary border drawn inside a
      // primary fill — see `cell.selectedFocusRing`.
      [`&.${menuItemClasses.focusVisible}`]: pairedFocusRing(
        theme,
        {
          backgroundColor: cell.selectedBackground,
          color: cell.selectedInk,
        },
        cell.selectedFocusRing,
        'inset'
      ),
    },
    // MUI fades a disabled row to 38% opacity; the house has a disabled ink,
    // which keeps the value legible-but-inert like every other control here.
    [`&.${menuItemClasses.disabled}`]: {
      opacity: 1,
      ...paired(theme, { color: cell.disabledInk }),
    },
  };
}

/**
 * The floating panel, and the clock inside it.
 *
 * The panel chrome and the two mobile-only rows around the view come from
 * `panelSurface`, shared with the date picker. Everything below it is the
 * clock — the part with no Figma source, on house colour and MUI's own
 * geometry.
 *
 * Two clocks are styled here, not one, because `TimePicker` renders a
 * different view per pointer type: scrolling columns on a pointer device,
 * an analog face in a modal on a touch one. Both are reached by descendant
 * selectors from this single `Paper`, which MUI X types identically for the
 * desktop popper and the mobile dialog.
 */
const PanelPaper = styled(Paper)(({ theme }) => ({
  ...panelSurface(theme),

  /* --- Pointer devices: scrolling columns of values --- */

  [`& .${multiSectionDigitalClockClasses.root}`]: {
    // MUI rules off the bottom of the columns with `palette.divider`, which
    // in dark mode is a rung *darker* than the panel it sits on and reads
    // as a smudge rather than a line — the same correction `Menu` makes to
    // a standalone `Divider`.
    borderBottomWidth: HAIRLINE_WIDTH_PX,
    ...paired(theme, { borderBottomColor: panel.border }),
  },
  // The hairline between the hours, minutes and meridiem columns, on the
  // same token for the same reason.
  [`& .${multiSectionDigitalClockSectionClasses.root}:not(:first-of-type)`]: {
    borderLeftWidth: HAIRLINE_WIDTH_PX,
    ...paired(theme, { borderLeftColor: panel.border }),
  },
  // Both digital renderers share one item treatment. Which of the two MUI X
  // picks depends on how many options `timeSteps` produces —
  // `1440 / (hours * minutes)` — against
  // `thresholdToRenderTimeInASingleColumn`, 24 by default: at or below it one
  // list, above it separate columns. The default 5-minute step gives 288.
  [`& .${multiSectionDigitalClockSectionClasses.item}, & .${digitalClockClasses.item}`]:
    clockItem(theme),

  /* --- Touch devices: the analog face in the modal --- */

  [`& .${clockClasses.clock}`]: paired(theme, {
    backgroundColor: clockFace.background,
  }),
  // The hand, and the dot it pivots on, both take the selected fill — the
  // face has exactly one selected value and the hand is what marks it.
  [`& .${clockClasses.pin}, & .${clockPointerClasses.root}`]: paired(theme, {
    backgroundColor: cell.selectedBackground,
  }),
  // The ring at the end of the hand: on-colour ink inside, selected fill
  // around it, so the numeral it circles stays readable through the middle.
  [`& .${clockPointerClasses.thumb}`]: paired(theme, {
    backgroundColor: cell.selectedInk,
    borderColor: cell.selectedBackground,
  }),
  [`& .${clockNumberClasses.root}`]: {
    ...fieldType,
    ...paired(theme, { color: cell.ink }),
    [`&.${clockNumberClasses.selected}`]: paired(theme, {
      color: cell.selectedInk,
    }),
    [`&.${clockNumberClasses.disabled}`]: paired(theme, {
      color: cell.disabledInk,
    }),
  },
  // AM / PM on the face itself, which only renders when the caller sets
  // `ampmInClock` — the mobile default puts the meridiem in the toolbar
  // instead, and the toolbar is coloured by `panelSurface`.
  [`& .${clockClasses.amButton}, & .${clockClasses.pmButton}`]: {
    ...paired(theme, { color: cell.ink }),
    '&:hover': paired(theme, { backgroundColor: cell.hover }),
    [`&.${clockClasses.selected}`]: {
      ...paired(theme, {
        backgroundColor: cell.selectedBackground,
        color: cell.selectedInk,
      }),
      '&:hover': paired(theme, {
        backgroundColor: cell.selectedBackgroundHover,
        color: cell.selectedInk,
      }),
    },
  },
  [`& .${clockClasses.meridiemText}`]: fieldType,
  // The hours/minutes arrows above the face, which are MUI `IconButton`s
  // rather than the house one.
  [`& .${timeClockClasses.arrowSwitcher} .${iconButtonClasses.root}`]: {
    ...paired(theme, { color: cell.glyph }),
    '&:hover': paired(theme, { backgroundColor: cell.hover }),
    [`&.${iconButtonClasses.disabled}`]: paired(theme, {
      color: cell.disabledInk,
    }),
  },
})) as React.JSXElementConstructor<PaperProps>;

/* ------------------------------------------------------------------ *
 * The field
 * ------------------------------------------------------------------ */

interface StyledTimePickerProps {
  neofloStatus?: TimePickerStatus;
}

const StyledTimePicker = styled(MuiTimePicker, {
  shouldForwardProp: (prop) => prop !== 'neofloStatus',
})<StyledTimePickerProps>(({ theme, neofloStatus }) =>
  pickerFieldStyles(theme, neofloStatus)
);

/* ------------------------------------------------------------------ *
 * The wrapper
 * ------------------------------------------------------------------ */

/**
 * Branded time picker. Wraps MUI X `TimePicker` — a field you can type a
 * time into, and a clock in a popover on pointer devices or a modal on
 * touch ones. Built the same way as `DatePicker` and sharing its field and
 * panel, so the two read identically in a form.
 *
 * **The value is a Day.js object, and it carries a date as well as a
 * time.** Day.js has no time-only type, so an untouched picker fills the
 * date part from today (or from `referenceDate`): read the time off the
 * value and ignore the rest, or set `referenceDate` to the day the time
 * belongs to. `minTime` / `maxTime` are the same shape, and MUI X ignores
 * their date part unless `disableIgnoringDatePartForTimeValidation` is set.
 * The Day.js adapter is installed by `NeofloThemeProvider`, so there is
 * nothing to configure — but a picker rendered outside that provider will
 * throw, because MUI X reads its adapter from context.
 *
 * **It opens two different clocks.** On a pointer device the popover holds
 * scrolling columns — hours, minutes, and AM/PM where the locale uses it.
 * On a touch device a modal holds an analog face with a draggable hand.
 * Both are MUI's own defaults and both are styled here; `viewRenderers`
 * moves the line if an app wants one of them everywhere.
 *
 * Which *digital* renderer appears depends on how many options `timeSteps`
 * produces — `1440 / (timeSteps.hours * timeSteps.minutes)` — measured
 * against `thresholdToRenderTimeInASingleColumn`, 24 by default: at or below
 * it the popover holds one list of times, above it separate columns. So the
 * default 5-minute step gives 288 and renders columns, `{ minutes: 60 }`
 * gives 24 and renders a list, and a half-hour step gives 48, which stays on
 * columns until the threshold is raised to match.
 *
 * One difference from `DatePicker` is worth expecting: the popover carries a
 * **Cancel / OK** row on the desktop, where the calendar has none. MUI
 * defaults `closeOnSelect` to `true` for a desktop date picker and leaves it
 * unset for a time picker, which is the right call — picking an hour should
 * not dismiss the popover before the minutes have been picked. Pass
 * `closeOnSelect` to change it.
 *
 * Every capability of MUI X's `TimePicker` survives, including the ones
 * this wrapper does not mention: `views`, `openTo`, `ampm`, `ampmInClock`,
 * `minTime` / `maxTime`, `minutesStep`, `shouldDisableTime`,
 * `disableFuture` / `disablePast`, `skipDisabled`, `format`, `timezone`,
 * controlled `open`, `onAccept`, `onError`, and the whole `slots` /
 * `slotProps` tree. Only the responsive variants are not exported
 * separately: `TimePicker` already chooses between the two clocks off
 * `desktopModeMediaQuery`, which is MUI's own switch and still a prop here.
 *
 * Four things are moved and one is swapped:
 *
 *   - `status`, `helperText` and `fullWidth` are lifted out of
 *     `slotProps.textField`, and `clearable` out of `slotProps.field`, so
 *     the picker reads like the house `TextField` it sits beside. Passing
 *     your own `slotProps` still works — the two are merged, and yours
 *     wins.
 *   - the four Material glyphs MUI X ships (the clock button, the clear
 *     button, and the two view arrows) are replaced with their Phosphor
 *     equivalents at 16px.
 *
 * The field is styled to match `TextField` exactly, with one divergence it
 * cannot reach: MUI X fades the `hh:mm aa` placeholder with an opacity it
 * computes from `ownerState`, so no selector can swap it for the house
 * placeholder ink. It resolves to a near-identical grey.
 *
 * @example A labelled picker
 * <TimePicker label="Starts at" />
 *
 * @example Controlled, on a 24-hour clock
 * const [time, setTime] = React.useState<Dayjs | null>(null);
 *
 * <TimePicker label="Starts at" value={time} onChange={setTime} ampm={false} />
 *
 * @example Validation, in the house statuses
 * <TimePicker label="Starts at" status="error" helperText="Pick a time" />
 *
 * @example Hourly slots, which renders one list instead of columns
 * <TimePicker label="Slot" timeSteps={{ minutes: 60 }} />
 *
 * @see Related: DatePicker, TextField, Select, Menu
 */
export const TimePicker = React.forwardRef<HTMLDivElement, TimePickerProps>(
  function TimePicker(
    { status, helperText, fullWidth, clearable, slots, slotProps, ...rest },
    ref
  ) {
    return (
      <StyledTimePicker
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

TimePicker.displayName = 'TimePicker';
