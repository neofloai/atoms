import type * as React from 'react';
import type { TimePickerProps as MuiTimePickerProps } from '@mui/x-date-pickers';

/**
 * Public API for the time picker.
 *
 * MUI X's prop surface survives whole — every capability documented at
 * https://mui.com/x/react-date-pickers/time-picker/ is reachable, including
 * the ones this file does not name: `views`, `openTo`, `onViewChange`,
 * `ampm`, `ampmInClock`, `minTime`, `maxTime`, `minutesStep`,
 * `shouldDisableTime`, `disableIgnoringDatePartForTimeValidation`,
 * `disableFuture`, `disablePast`, `timeSteps`, `skipDisabled`,
 * `thresholdToRenderTimeInASingleColumn`, `format`, `referenceDate`,
 * `timezone`, `open` / `onOpen` / `onClose`, `closeOnSelect`, `onAccept`,
 * `onError`, `desktopModeMediaQuery`, `localeText`, `viewRenderers`, and
 * the full `slots` / `slotProps` tree.
 *
 * Nothing is renamed and nothing is dropped. Four props are **lifted** —
 * they exist in MUI X, but two levels down inside `slotProps`, and three of
 * the four are top-level props on the house `TextField`, which is the
 * component this one's field is a copy of. They are the same four
 * `DatePicker` lifts, so the two pickers and the text field beside them all
 * read the same way.
 *
 * ## The two things to know before using it
 *
 * The value is a **Day.js** object, not a native `Date`, and it is a full
 * date-time rather than a bare time — a time on its own has no
 * representation in Day.js. An untouched picker fills the date part from
 * today (or from `referenceDate`), so read the time off the value and
 * ignore the rest, or set `referenceDate` to the day the time belongs to.
 * The same applies to `minTime` / `maxTime`, whose date part MUI X ignores
 * unless `disableIgnoringDatePartForTimeValidation` is set.
 *
 * The picker renders **two different clocks**. On a pointer device it opens
 * scrolling columns of hours and minutes; on a touch device it opens a
 * modal with an analog clock face. Both are MUI's own defaults, kept
 * deliberately — `viewRenderers` moves the line if an app wants one of them
 * everywhere.
 */

/**
 * Validation state of the field, mapped onto the same three statuses the
 * house `TextField` carries.
 *
 * MUI X models validity as a boolean `error` on the field slot, which is
 * one state where the design system has three, each with its own border and
 * its own label/helper ink. `status` is the house axis; `error` still works
 * underneath and is set for you when `status="error"`.
 */
export type TimePickerStatus = 'error' | 'success' | 'warning';

export interface TimePickerProps extends MuiTimePickerProps {
  /**
   * Validation state — colours the field's border and its label and helper
   * text. The same three statuses, the same tokens, and the same treatment
   * as `TextField` and `DatePicker`.
   *
   * Lifted from `slotProps.textField.error`, which is a boolean. Setting
   * `status="error"` sets MUI's `error` too, so `onError` and the field's
   * own validation still behave as documented.
   */
  status?: TimePickerStatus;
  /**
   * Text under the field. Takes the status colour when `status` is set,
   * exactly as it does on `TextField`.
   *
   * Lifted from `slotProps.textField.helperText`.
   */
  helperText?: React.ReactNode;
  /**
   * Stretches the field to its container's width. Off by default, matching
   * both MUI and `TextField`.
   *
   * Lifted from `slotProps.textField.fullWidth`.
   *
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Adds a clear button to the field, which empties the value and fires
   * `onChange` with `null`. The button only renders while there is
   * something to clear.
   *
   * Lifted from `slotProps.field.clearable`. Pair it with `onClear` — also
   * on `slotProps.field` — if you need to react to the clear itself rather
   * than to the resulting `onChange`.
   *
   * @default false
   */
  clearable?: boolean;
}
