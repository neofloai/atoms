import type * as React from 'react';
import type { DatePickerProps as MuiDatePickerProps } from '@mui/x-date-pickers';

/**
 * Public API for the date picker.
 *
 * MUI X's prop surface survives whole — every capability documented at
 * https://mui.com/x/react-date-pickers/date-picker/ is reachable, including
 * the ones this file does not name: `views`, `openTo`, `onViewChange`,
 * `minDate`, `maxDate`, `disableFuture`, `disablePast`, `shouldDisableDate`,
 * `shouldDisableMonth`, `shouldDisableYear`, `format`, `referenceDate`,
 * `timezone`, `open` / `onOpen` / `onClose`, `closeOnSelect`, `onAccept`,
 * `onError`, `loading`, `showDaysOutsideCurrentMonth`, `displayWeekNumber`,
 * `fixedWeekNumber`, `dayOfWeekFormatter`, `monthsPerRow`, `yearsPerRow`,
 * `reduceAnimations`, `desktopModeMediaQuery`, `localeText`, `viewRenderers`,
 * and the full `slots` / `slotProps` tree.
 *
 * Nothing is renamed and nothing is dropped. Four props are **lifted** —
 * they exist in MUI X, but two levels down inside `slotProps`, and three of
 * the four are top-level props on the house `TextField`, which is the
 * component this one's field is a copy of. A picker whose `helperText` had
 * to be written as `slotProps={{ textField: { helperText } }}` while the
 * text field beside it took `helperText` directly would be the same design
 * with two APIs.
 *
 * ## The one thing to know before using it
 *
 * The value is a **Day.js** object, not a native `Date`. Atoms standardises
 * on Day.js — see `src/components/DatePicker/DatePicker.tsx` — so
 * `value`, `defaultValue`, `minDate`, `maxDate` and the argument to
 * `onChange` are all `Dayjs`. Reach for `.toDate()` at the boundary where
 * you hand a date to something else.
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
export type DatePickerStatus = 'error' | 'success' | 'warning';

export interface DatePickerProps extends MuiDatePickerProps {
  /**
   * Validation state — colours the field's border and its label and helper
   * text. The same three statuses, the same tokens, and the same treatment
   * as `TextField`.
   *
   * Lifted from `slotProps.textField.error`, which is a boolean. Setting
   * `status="error"` sets MUI's `error` too, so `onError` and the field's
   * own validation still behave as documented.
   */
  status?: DatePickerStatus;
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
