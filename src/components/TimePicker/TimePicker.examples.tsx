import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for the time picker. Read by `scripts/generate.ts` and
 * served through the MCP `get_component` tool and the docs site.
 *
 * `figmaUrl` is deliberately absent, as it is on `DatePicker`: the Product
 * Design System draws no picker of any kind, and pointing at a node that
 * does not exist would be worse than the docs page saying "No Figma
 * source", which is what it renders when this field is missing.
 *
 * The props table leads with the four props this wrapper lifts out of
 * `slotProps`, then covers the MUI X props worth naming. It is not the full
 * surface — MUI X's is much larger and all of it works.
 */
export const data: ComponentExamplesData = {
  name: 'TimePicker',
  category: 'Inputs',
  tagline:
    'A time field you can type into, with scrolling hour and minute columns in a popover on pointer devices and an analog clock in a modal on touch ones. Built on MUI X; its value is a Day.js object that carries a date as well as a time.',
  props: [
    {
      name: 'status',
      type: "'error' | 'success' | 'warning'",
      default: '—',
      description:
        'Validation state, on the same three-status axis and the same tokens as `TextField` and `DatePicker`: it colours the field’s border and its label and helper text. Lifted from `slotProps.textField.error`, which is only a boolean — `status="error"` sets that too, so MUI’s own validation still behaves as documented.',
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
        'The selected time, for a controlled picker. A **Day.js** object carrying a full date-time, because Day.js has no time-only type — an untouched picker fills the date part from today, or from `referenceDate`. Read the time off it and ignore the rest.',
    },
    {
      name: 'onChange',
      type: '(value: Dayjs | null, context) => void',
      default: '—',
      description:
        'Fires on every edit, from the field as well as the clock. `context.validationError` carries the result of the validation props, and `context.source` says which of the two the change came from. Use `onAccept` instead to hear only about committed times.',
    },
    {
      name: 'ampm',
      type: 'boolean',
      default: 'locale-dependent',
      description:
        'Whether the field and the clock run on a 12-hour cycle with AM/PM or a 24-hour one. Defaults to whatever the active locale uses, so set it explicitly if a form has to read the same everywhere.',
    },
    {
      name: 'ampmInClock',
      type: 'boolean',
      default: 'true on desktop, false on mobile',
      description:
        'Where the AM/PM control lives: a third column in the popover, or on the modal’s toolbar. The two defaults differ because the analog face has room for it and the columns are the natural place for it.',
    },
    {
      name: 'views',
      type: "('hours' | 'minutes' | 'seconds')[]",
      default: "['hours', 'minutes']",
      description:
        'Which units the clock offers, in order. Add `seconds` for a third column. Set `format` to match, or the field will keep asking for a unit the clock cannot give.',
    },
    {
      name: 'timeSteps',
      type: '{ hours?, minutes?, seconds? }',
      default: '{ hours: 1, minutes: 5, seconds: 5 }',
      description:
        'The interval between the options offered, and — through the number of options it produces — which clock the popover renders. See `thresholdToRenderTimeInASingleColumn`.',
    },
    {
      name: 'thresholdToRenderTimeInASingleColumn',
      type: 'number',
      default: '24',
      description:
        'The option count at or below which the popover renders one list of times instead of separate hour and minute columns. The count is `1440 ÷ (timeSteps.hours × timeSteps.minutes)`, so the default 5-minute step gives 288 and renders columns, `{ minutes: 60 }` gives 24 and renders a list, and a half-hour step gives 48 — which stays on columns until this is raised to match.',
    },
    {
      name: 'minTime / maxTime',
      type: 'Dayjs',
      default: '—',
      description:
        'The window the picker will accept. Times outside it are greyed in the clock and refused in the field. Only the time part is read, unless `disableIgnoringDatePartForTimeValidation` is set.',
    },
    {
      name: 'minutesStep',
      type: 'number',
      default: '1',
      description:
        'Refuses minute values that are not a multiple of this — a validation rule, unlike `timeSteps`, which only decides what the clock offers. Set both when a form takes quarter-hours only.',
    },
    {
      name: 'shouldDisableTime',
      type: '(value: Dayjs, view) => boolean',
      default: '—',
      description:
        'Refuses individual values the window cannot express — a lunch break, slots already booked. Called per rendered option and per view, so keep it cheap.',
    },
    {
      name: 'skipDisabled',
      type: 'boolean',
      default: 'false',
      description:
        'Leaves refused options out of the clock entirely rather than greying them. Useful when a long stretch of the day is unavailable and the greyed rows are just scrolling.',
    },
    {
      name: 'disablePast / disableFuture',
      type: 'boolean',
      default: 'false',
      description:
        'The same refusal as `minTime` / `maxTime`, relative to now rather than to a fixed time.',
    },
    {
      name: 'format',
      type: 'string',
      default: 'locale-dependent',
      description:
        'The Day.js format string the field reads and writes, which also sets the `hh:mm aa` placeholder. Follow `views` and `ampm` when you change them.',
    },
    {
      name: 'referenceDate',
      type: 'Dayjs',
      default: 'today',
      description:
        'The day the picked time lands on while `value` is empty. Set it whenever the time belongs to a known date — otherwise the value carries today’s, which is easy to miss until something compares two of them.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description:
        'Dims the field and refuses both the clock and the keyboard. Use `readOnly` instead for a value that should stay legible.',
    },
    {
      name: 'readOnly',
      type: 'boolean',
      default: 'false',
      description:
        'Keeps the value at full strength and still opens the clock — it just will not accept a new time.',
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
        'The query that decides between the column popover and the analog modal. This is why there is no separate `DesktopTimePicker` or `MobileTimePicker` export — one component covers both, and this prop moves the line.',
    },
    {
      name: 'viewRenderers',
      type: 'object',
      default: '—',
      description:
        'Replaces the clock per view. Pass `renderMultiSectionDigitalClockTimeView` for every view to get the columns on touch devices too, or `renderTimeViewClock` to get the analog face everywhere.',
    },
    {
      name: 'slots / slotProps',
      type: 'object',
      default: '{}',
      description:
        'MUI X’s full slot tree. The house panel and the four Phosphor glyphs are already installed here; anything you pass is merged over them and wins, including `slotProps.textField` and `slotProps.field`, which the lifted props above also write to.',
    },
  ],
  examples: [
    {
      title: 'A labelled picker',
      description:
        'Everything is default. The adapter comes from `NeofloThemeProvider`, so there is no provider to add.',
      code: `<TimePicker label="Starts at" />`,
    },
    {
      title: 'Controlled',
      description:
        'The value is a Day.js object. `onChange` fires on every edit, from the field as well as the clock.',
      code: `const [time, setTime] = React.useState<Dayjs | null>(null);

<TimePicker label="Starts at" value={time} onChange={setTime} />`,
    },
    {
      title: 'A 24-hour clock',
      description:
        '`ampm` defaults to whatever the locale uses. Set it — and `format` with it — when a form has to read the same everywhere.',
      code: `<TimePicker label="Departs" ampm={false} format="HH:mm" />`,
    },
    {
      title: 'Validation, in the house statuses',
      description:
        'The same three-status axis as `TextField`, colouring the border and the label and helper text.',
      code: `<TimePicker
  label="Starts at"
  status="error"
  helperText="Pick a time to continue"
/>`,
    },
    {
      title: 'Times it will accept',
      description:
        'MUI X’s validation props. A refused option is greyed in the clock and rejected in the field, and `onError` says which rule was broken.',
      code: `<TimePicker
  label="Delivery window"
  minTime={dayjs().set('hour', 9).startOf('hour')}
  maxTime={dayjs().set('hour', 17).startOf('hour')}
  minutesStep={15}
  shouldDisableTime={(value, view) => view === 'hours' && value.hour() === 13}
  onError={(reason) => setError(reason)}
/>`,
    },
    {
      title: 'Half-hour slots, as one list',
      description:
        'The popover renders one list of times rather than columns once the option count reaches the threshold. A half-hour step gives 48, so the threshold has to be raised to match — `{ minutes: 60 }` would fall under the default 24 on its own.',
      code: `<TimePicker
  label="Slot"
  timeSteps={{ minutes: 30 }}
  thresholdToRenderTimeInASingleColumn={48}
/>`,
    },
    {
      title: 'On a known day',
      description:
        'The value carries a date whether you want one or not. `referenceDate` decides which, so two times can be compared without surprises.',
      code: `<TimePicker
  label="Starts at"
  referenceDate={eventDate}
  value={time}
  onChange={setTime}
/>`,
    },
    {
      title: 'Beside a date picker, in a form',
      description:
        'The point of sharing the field and lifting the same four props: the three components read the same way.',
      code: `<Stack spacing={2}>
  <TextField label="Title" fullWidth />
  <DatePicker label="Day" fullWidth status={errors.day ? 'error' : undefined} helperText={errors.day} />
  <TimePicker label="Starts at" fullWidth status={errors.time ? 'error' : undefined} helperText={errors.time} />
</Stack>`,
    },
  ],
  dos: [
    'Render it below `NeofloThemeProvider` — that is where the Day.js adapter is installed, and MUI X reads the adapter from context',
    'Set `referenceDate` whenever the time belongs to a known day, so the date half of the value is deliberate rather than incidental',
    'Set `ampm` and `format` together when a form has to read the same in every locale',
    'Pair `timeSteps` with `minutesStep` when a form only takes quarter-hours: the first decides what the clock offers, the second is what actually refuses a typed value',
    'Prefer `readOnly` over `disabled` for a time the user should still be able to read',
  ],
  donts: [
    'Don’t treat the value as a time on its own — it is a full Day.js date-time, and two pickers left on their defaults will carry today’s date',
    'Don’t pass a native `Date` or an ISO string to `value`, `minTime` or `maxTime` — they take Day.js objects, and a `Date` will type-error rather than fail quietly',
    'Don’t assume `timeSteps` validates anything; it only decides which options the clock shows. A typed value outside the step is accepted unless `minutesStep` refuses it',
    'Don’t write `slotProps={{ textField: { helperText } }}` — `helperText` is a prop here, and the two paths writing to the same slot is worth avoiding',
    'Don’t reach for a date-and-time picker by pairing this with `DatePicker` when one field would do; MUI X has `DateTimePicker`, which Atoms has not wrapped yet',
  ],
  relatedComponents: ['DatePicker', 'TextField', 'Select', 'Menu'],
};
