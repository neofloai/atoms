'use client';

import * as React from 'react';
import dayjs from 'dayjs';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { DatePicker } from '@/src/components/DatePicker';

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
      <DatePicker label="Departure" />
      <DatePicker label="Return" defaultValue={dayjs('2026-09-14')} />
      <DatePicker label="No label above" />
    </Stack>
  );
}

Basics.displayName = 'Basics';

/** Controlled, echoing the Day.js value back so the type is visible. */
function Controlled() {
  const [date, setDate] = React.useState<Dayjs | null>(dayjs('2026-08-20'));

  return (
    <Stack spacing={2}>
      <DatePicker
        label="Invoice date"
        value={date}
        onChange={setDate}
        helperText="Typed into the field or picked from the calendar"
      />
      <Typography variant="caption" color="text.secondary">
        value: {date === null ? 'null' : date.format('YYYY-MM-DD')}
      </Typography>
    </Stack>
  );
}

Controlled.displayName = 'Controlled';

/** The three house statuses, on the same tokens `TextField` uses. */
function Statuses() {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
      <DatePicker
        label="Departure"
        status="error"
        helperText="Pick a date to continue"
      />
      <DatePicker
        label="Departure"
        status="warning"
        defaultValue={dayjs('2026-12-24')}
        helperText="Falls on a public holiday"
      />
      <DatePicker
        label="Departure"
        status="success"
        defaultValue={dayjs('2026-09-01')}
        helperText="Seats available"
      />
    </Stack>
  );
}

Statuses.displayName = 'Statuses';

/** The two locked states, which differ: one is dimmed, one is not. */
function Locked() {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
      <DatePicker label="Disabled" disabled defaultValue={dayjs('2026-08-20')} />
      <DatePicker
        label="Read only"
        readOnly
        defaultValue={dayjs('2026-08-20')}
      />
    </Stack>
  );
}

Locked.displayName = 'Locked';

/**
 * Validation. Every rule below is MUI X's, and each one greys the days it
 * refuses in the calendar as well as refusing them in the field.
 */
function Validation() {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
      <DatePicker
        label="Within the year"
        minDate={dayjs('2026-08-01')}
        maxDate={dayjs('2026-12-31')}
        helperText="minDate / maxDate"
      />
      <DatePicker
        label="Not in the past"
        disablePast
        helperText="disablePast"
      />
      <DatePicker
        label="Weekdays only"
        shouldDisableDate={(date) => [0, 6].includes(date.day())}
        helperText="shouldDisableDate"
      />
    </Stack>
  );
}

Validation.displayName = 'Validation';

/** `views` drops the day grid entirely, and `format` follows it. */
function Views() {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
      <DatePicker
        label="Card expires"
        views={['year', 'month']}
        format="MM/YYYY"
        helperText="Month and year"
      />
      <DatePicker
        label="Financial year"
        views={['year']}
        format="YYYY"
        helperText="Year only"
      />
      <DatePicker
        label="Opens on the year"
        openTo="year"
        helperText="All three views, opening at the top"
      />
    </Stack>
  );
}

Views.displayName = 'Views';

/** `clearable`, and the field stretched to its container. */
function ClearableAndFullWidth() {
  return (
    <Stack spacing={3}>
      <DatePicker
        label="Cancelled on"
        clearable
        defaultValue={dayjs('2026-08-20')}
        helperText="The clear button shows only while there is a value"
      />
      <DatePicker label="Full width" fullWidth />
    </Stack>
  );
}

ClearableAndFullWidth.displayName = 'ClearableAndFullWidth';

export function DatePickerShowcase() {
  return (
    <Stack spacing={5}>
      <PreviewCard
        title="The field"
        description="Empty, filled, and without a label. The label sits above the field rather than floating into the border, which is the house field's treatment — so a picker with no label is just the box."
      >
        <Basics />
      </PreviewCard>

      <PreviewCard
        title="Controlled"
        description="value and onChange carry a Day.js object. onChange fires on every edit, from the field as well as the calendar; onAccept fires only when a date is committed."
      >
        <Controlled />
      </PreviewCard>

      <PreviewCard
        title="Validation statuses"
        description="The house error / warning / success axis, colouring the border and the label and helper text on the same tokens TextField uses. status='error' also sets MUI's boolean error underneath."
      >
        <Statuses />
      </PreviewCard>

      <PreviewCard
        title="Disabled and read-only"
        description="disabled dims the field and its button and refuses both. readOnly keeps the value at full strength and still opens the calendar — it just will not accept a new date."
      >
        <Locked />
      </PreviewCard>

      <PreviewCard
        title="Dates it will accept"
        description="MUI X's validation props, unchanged. A refused day is greyed in the grid and rejected in the field, and onError reports which rule was broken."
      >
        <Validation />
      </PreviewCard>

      <PreviewCard
        title="Fewer views"
        description="views chooses which of year / month / day the calendar offers, and format should follow it so the field asks for the same thing the calendar gives."
      >
        <Views />
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

DatePickerShowcase.displayName = 'DatePickerShowcase';
