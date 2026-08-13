import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for the date picker. Read by `scripts/generate.ts` and
 * served through the MCP `get_component` tool and the docs site.
 *
 * `figmaUrl` is deliberately absent: the Product Design System draws no
 * date picker, and pointing at a node that does not exist would be worse
 * than the docs page saying "No Figma source", which is what it renders
 * when this field is missing.
 *
 * The props table leads with the four props this wrapper lifts out of
 * `slotProps`, then covers the MUI X props worth naming. It is not the
 * full surface — MUI X's is much larger and all of it works.
 */
export const data: ComponentExamplesData = {
  name: 'DatePicker',
  category: 'Inputs',
  tagline:
    'A date field you can type into, with a calendar in a popover on pointer devices and a modal on touch ones. Built on MUI X; its value is a Day.js object rather than a native Date.',
  props: [
    {
      name: 'status',
      type: "'error' | 'success' | 'warning'",
      default: '—',
      description:
        'Validation state, on the same three-status axis and the same tokens as `TextField`: it colours the field’s border and its label and helper text. Lifted from `slotProps.textField.error`, which is only a boolean — `status="error"` sets that too, so MUI’s own validation still behaves as documented.',
    },
    {
      name: 'helperText',
      type: 'ReactNode',
      default: '—',
      description:
        'Text under the field, which takes the status colour when `status` is set. Lifted from `slotProps.textField.helperText` so the picker reads like the text field beside it.',
    },
    {
      name: 'fullWidth',
      type: 'boolean',
      default: 'false',
      description:
        'Stretches the field to its container. Lifted from `slotProps.textField.fullWidth`.',
    },
    {
      name: 'clearable',
      type: 'boolean',
      default: 'false',
      description:
        'Adds a button that empties the value and fires `onChange` with `null`. It renders only while there is something to clear. Lifted from `slotProps.field.clearable`.',
    },
    {
      name: 'value',
      type: 'Dayjs | null',
      default: '—',
      description:
        'The selected date, for a controlled picker. A **Day.js** object, not a native `Date` — call `.toDate()` at the boundary where you hand it to something else.',
    },
    {
      name: 'onChange',
      type: '(value: Dayjs | null, context) => void',
      default: '—',
      description:
        'Fires on every edit, from the field as well as the calendar. `context.validationError` carries the result of the validation props, and `context.source` says which of the two the change came from. Use `onAccept` instead to hear only about committed dates.',
    },
    {
      name: 'label',
      type: 'ReactNode',
      default: '—',
      description:
        'Sits above the field rather than floating into the border, which is the house field’s treatment. Without one, the picker is just the box.',
    },
    {
      name: 'views',
      type: "('year' | 'month' | 'day')[]",
      default: "['year', 'day']",
      description:
        'Which views the calendar offers, in order. Drop `day` for a month-and-year picker. Set `format` to match, or the field will keep asking for a day the calendar cannot give.',
    },
    {
      name: 'openTo',
      type: "'year' | 'month' | 'day'",
      default: "'day'",
      description:
        'Which view the calendar opens on. `openTo="year"` suits a date far from today, where scrolling the month arrows would be tedious.',
    },
    {
      name: 'minDate / maxDate',
      type: 'Dayjs',
      default: '1900-01-01 / 2099-12-31',
      description:
        'The range the picker will accept. Days outside it are greyed in the grid and refused in the field, and `onError` reports which bound was crossed.',
    },
    {
      name: 'disablePast / disableFuture',
      type: 'boolean',
      default: 'false',
      description:
        'The same refusal as `minDate`/`maxDate`, relative to now rather than to a fixed date.',
    },
    {
      name: 'shouldDisableDate',
      type: '(date: Dayjs) => boolean',
      default: '—',
      description:
        'Refuses individual dates the ranges cannot express — weekends, holidays, days already booked. Called for every rendered day, so keep it cheap.',
    },
    {
      name: 'format',
      type: 'string',
      default: 'locale-dependent',
      description:
        'The Day.js format string the field reads and writes, which also sets the `MM/DD/YYYY` placeholder. Follow `views` when you narrow them.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description:
        'Dims the field and refuses both the calendar and the keyboard. Use `readOnly` instead for a value that should stay legible.',
    },
    {
      name: 'readOnly',
      type: 'boolean',
      default: 'false',
      description:
        'Keeps the value at full strength and still opens the calendar — it just will not accept a new date.',
    },
    {
      name: 'open / onOpen / onClose',
      type: 'boolean / () => void',
      default: '—',
      description:
        'Controls the popover yourself, for a picker opened by something other than its own button.',
    },
    {
      name: 'desktopModeMediaQuery',
      type: 'string',
      default: "'@media (pointer: fine)'",
      description:
        'The query that decides between the desktop popover and the mobile modal. This is why there is no separate `DesktopDatePicker` or `MobileDatePicker` export — one component covers both, and this prop moves the line.',
    },
    {
      name: 'slots / slotProps',
      type: 'object',
      default: '{}',
      description:
        'MUI X’s full slot tree. The house panel and the five Phosphor glyphs are already installed here; anything you pass is merged over them and wins, including `slotProps.textField` and `slotProps.field`, which the lifted props above also write to.',
    },
  ],
  examples: [
    {
      title: 'A labelled picker',
      description:
        'Everything is default. The adapter comes from `NeofloThemeProvider`, so there is no provider to add.',
      code: `<DatePicker label="Departure" />`,
    },
    {
      title: 'Controlled',
      description:
        'The value is a Day.js object. `onChange` fires on every edit, from the field as well as the calendar.',
      code: `const [date, setDate] = React.useState<Dayjs | null>(null);

<DatePicker label="Invoice date" value={date} onChange={setDate} />`,
    },
    {
      title: 'Validation, in the house statuses',
      description:
        'The same three-status axis as `TextField`, colouring the border and the label and helper text.',
      code: `<DatePicker
  label="Departure"
  status="error"
  helperText="Pick a date to continue"
/>`,
    },
    {
      title: 'Dates it will accept',
      description:
        'MUI X’s validation props. A refused day is greyed in the calendar and rejected in the field, and `onError` says which rule was broken.',
      code: `<DatePicker
  label="Delivery"
  disablePast
  maxDate={dayjs().add(90, 'day')}
  shouldDisableDate={(date) => [0, 6].includes(date.day())}
  onError={(reason) => setError(reason)}
/>`,
    },
    {
      title: 'Month and year only',
      description:
        'Narrowing `views` drops the day grid. `format` has to follow, or the field keeps asking for a day.',
      code: `<DatePicker
  label="Card expires"
  views={['year', 'month']}
  format="MM/YYYY"
/>`,
    },
    {
      title: 'Clearable',
      description:
        'Adds a button that empties the value and fires `onChange` with `null`. It shows only while there is a value.',
      code: `<DatePicker label="Cancelled on" clearable value={date} onChange={setDate} />`,
    },
    {
      title: 'Opened by something else',
      description:
        'Controlling `open` lets any trigger drive the calendar. Turning off the built-in button leaves the field to type into.',
      code: `const [open, setOpen] = React.useState(false);

<Stack direction="row" spacing={1} alignItems="flex-end">
  <DatePicker
    label="Departure"
    open={open}
    onOpen={() => setOpen(true)}
    onClose={() => setOpen(false)}
    slotProps={{ inputAdornment: { sx: { display: 'none' } } }}
  />
  <Button variant="secondary" onClick={() => setOpen(true)}>
    Pick a date
  </Button>
</Stack>`,
    },
    {
      title: 'In a form, next to a text field',
      description:
        'The point of lifting `helperText`, `status` and `fullWidth`: the two components read the same way.',
      code: `<Stack spacing={2}>
  <TextField label="Reference" fullWidth status={errors.ref ? 'error' : undefined} helperText={errors.ref} />
  <DatePicker label="Due" fullWidth status={errors.due ? 'error' : undefined} helperText={errors.due} />
</Stack>`,
    },
  ],
  dos: [
    'Render it below `NeofloThemeProvider` — that is where the Day.js adapter is installed, and MUI X reads the adapter from context',
    'Set `format` whenever you narrow `views`, so the field asks for exactly what the calendar can give',
    'Reach for `minDate` / `maxDate` / `disablePast` before `shouldDisableDate`; the ranges are cheaper and they also bound the year view',
    'Use `onAccept` when you only care about committed dates, and `onChange` when you want every keystroke',
    'Prefer `readOnly` over `disabled` for a date the user should still be able to read',
  ],
  donts: [
    'Don’t pass a native `Date` or an ISO string to `value`, `minDate` or `maxDate` — they take Day.js objects, and a `Date` will type-error rather than fail quietly',
    'Don’t wrap it in your own `LocalizationProvider` with a different adapter; the value type would stop matching the rest of the app',
    'Don’t reimplement validation in `onChange` when a validation prop covers it — the props also grey out the refused days, which a manual check cannot do',
    'Don’t write `slotProps={{ textField: { helperText } }}` — `helperText` is a prop here, and the two paths writing to the same slot is worth avoiding',
    'Don’t use it for a range; MUI X puts `DateRangePicker` in the paid tier, so a range is two pickers bounded against each other',
  ],
  relatedComponents: ['TimePicker', 'TextField', 'Select', 'Menu'],
};
