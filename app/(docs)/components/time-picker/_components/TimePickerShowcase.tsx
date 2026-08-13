'use client';

import * as React from 'react';
import dayjs from 'dayjs';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { TimePicker } from '@/src/components/TimePicker';

import type { Dayjs } from 'dayjs';

function PreviewCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        {children}
      </Paper>
    </Stack>
  );
}

PreviewCard.displayName = 'PreviewCard';

/** The resting field, empty and filled, beside each other. */
function Basics() {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
      <TimePicker label="Starts at" />
      <TimePicker label="Ends at" defaultValue={dayjs().hour(17).minute(30)} />
      <TimePicker label="No label above" />
    </Stack>
  );
}

Basics.displayName = 'Basics';

/**
 * Controlled, echoing the value back so the thing worth knowing is visible:
 * it is a full date-time, not a bare time.
 */
function Controlled() {
  const [time, setTime] = React.useState<Dayjs | null>(
    dayjs().hour(9).minute(15)
  );

  return (
    <Stack spacing={2}>
      <TimePicker
        label="Stand-up"
        value={time}
        onChange={setTime}
        helperText="Typed into the field or picked from the clock"
      />
      <Typography variant="caption" color="text.secondary">
        value: {time === null ? 'null' : time.format('YYYY-MM-DD HH:mm')}
      </Typography>
    </Stack>
  );
}

Controlled.displayName = 'Controlled';

/** The two cycles, the column `ampm` adds, and where that column can live. */
function Cycles() {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={3}
      useFlexGap
      sx={{ flexWrap: 'wrap' }}
    >
      <TimePicker label="12-hour" ampm helperText="Hours, minutes, AM/PM" />
      <TimePicker
        label="24-hour"
        ampm={false}
        format="HH:mm"
        helperText="Hours and minutes"
      />
      <TimePicker
        label="With seconds"
        views={['hours', 'minutes', 'seconds']}
        format="HH:mm:ss"
        ampm={false}
        helperText="A third column"
      />
      <TimePicker
        label="AM/PM off the clock"
        ampmInClock={false}
        helperText="ampmInClock={false}"
      />
    </Stack>
  );
}

Cycles.displayName = 'Cycles';

/** The three house statuses, on the same tokens `TextField` uses. */
function Statuses() {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
      <TimePicker
        label="Starts at"
        status="error"
        helperText="Pick a time to continue"
      />
      <TimePicker
        label="Starts at"
        status="warning"
        defaultValue={dayjs().hour(23).minute(45)}
        helperText="Outside working hours"
      />
      <TimePicker
        label="Starts at"
        status="success"
        defaultValue={dayjs().hour(10).minute(0)}
        helperText="Room is free"
      />
    </Stack>
  );
}

Statuses.displayName = 'Statuses';

/** The two locked states, which differ: one is dimmed, one is not. */
function Locked() {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
      <TimePicker
        label="Disabled"
        disabled
        defaultValue={dayjs().hour(9).minute(15)}
      />
      <TimePicker
        label="Read only"
        readOnly
        defaultValue={dayjs().hour(9).minute(15)}
      />
    </Stack>
  );
}

Locked.displayName = 'Locked';

/**
 * Validation. Every rule below is MUI X's, and each one greys the options it
 * refuses in the clock as well as refusing them in the field.
 */
function Validation() {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
      <TimePicker
        label="Working hours"
        minTime={dayjs().hour(9).startOf('hour')}
        maxTime={dayjs().hour(17).startOf('hour')}
        helperText="minTime / maxTime"
      />
      <TimePicker
        label="Quarter-hours only"
        minutesStep={15}
        timeSteps={{ minutes: 15 }}
        helperText="minutesStep + timeSteps"
      />
      <TimePicker
        label="Not over lunch"
        shouldDisableTime={(value, view) =>
          view === 'hours' && value.hour() === 13
        }
        skipDisabled
        helperText="shouldDisableTime + skipDisabled"
      />
    </Stack>
  );
}

Validation.displayName = 'Validation';

/**
 * How many options `timeSteps` produces decides which of the two digital
 * clocks the popover renders — one list once the count reaches
 * `thresholdToRenderTimeInASingleColumn`, separate columns above it.
 */
function Renderers() {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
      <TimePicker
        label="Every 5 minutes"
        helperText="The default — 288 options, so columns"
      />
      <TimePicker
        label="On the hour"
        timeSteps={{ minutes: 60 }}
        helperText="24 options, so one list"
      />
      <TimePicker
        label="Every half hour"
        timeSteps={{ minutes: 30 }}
        thresholdToRenderTimeInASingleColumn={48}
        helperText="48 options, one list once the threshold allows it"
      />
    </Stack>
  );
}

Renderers.displayName = 'Renderers';

/** `clearable`, and the field stretched to its container. */
function ClearableAndFullWidth() {
  return (
    <Stack spacing={3}>
      <TimePicker
        label="Cancelled at"
        clearable
        defaultValue={dayjs().hour(14).minute(0)}
        helperText="The clear button shows only while there is a value"
      />
      <TimePicker label="Full width" fullWidth />
    </Stack>
  );
}

ClearableAndFullWidth.displayName = 'ClearableAndFullWidth';

export function TimePickerShowcase() {
  return (
    <Stack spacing={5}>
      <PreviewCard
        title="The field"
        description="Empty, filled, and without a label. It is the same field DatePicker and TextField use, down to the 36px height and the circular 28px button — the three are meant to be stacked in a form without measuring."
      >
        <Basics />
      </PreviewCard>

      <PreviewCard
        title="Controlled"
        description="value and onChange carry a Day.js object — and, as the echoed value shows, a date along with the time. Set referenceDate when the time belongs to a known day."
      >
        <Controlled />
      </PreviewCard>

      <PreviewCard
        title="12-hour, 24-hour, and seconds"
        description="ampm follows the active locale unless you set it, and adds a third column to the popover. views adds or removes one, and format has to follow both. ampmInClock={false} takes AM/PM out of the popover and leaves it to the field."
      >
        <Cycles />
      </PreviewCard>

      <PreviewCard
        title="Validation statuses"
        description="The house error / warning / success axis, colouring the border and the label and helper text on the same tokens TextField uses. status='error' also sets MUI's boolean error underneath."
      >
        <Statuses />
      </PreviewCard>

      <PreviewCard
        title="Disabled and read-only"
        description="disabled dims the field and its button and refuses both. readOnly keeps the value at full strength and still opens the clock — it just will not accept a new time."
      >
        <Locked />
      </PreviewCard>

      <PreviewCard
        title="Times it will accept"
        description="MUI X's validation props, unchanged. timeSteps only decides what the clock offers; minutesStep is what refuses a typed value, so a form that takes quarter-hours wants both."
      >
        <Validation />
      </PreviewCard>

      <PreviewCard
        title="Which clock opens"
        description="The popover renders one list of times once the option count reaches thresholdToRenderTimeInASingleColumn (24 by default) and separate columns above it. The count is 1440 ÷ (timeSteps.hours × timeSteps.minutes), so a half-hour step gives 48 and stays on columns unless the threshold is raised. On a touch device all three open an analog face in a modal instead."
      >
        <Renderers />
      </PreviewCard>

      <PreviewCard
        title="Clearable, and full width"
        description="clearable adds a button that empties the value and fires onChange with null. fullWidth stretches the field, matching TextField."
      >
        <ClearableAndFullWidth />
      </PreviewCard>
    </Stack>
  );
}

TimePickerShowcase.displayName = 'TimePickerShowcase';
