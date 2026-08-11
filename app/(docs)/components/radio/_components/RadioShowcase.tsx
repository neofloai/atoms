'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Radio, RadioGroup } from '@/src/components/Radio';

import type { RadioProps } from '@/src/components/Radio';

function PreviewCard({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={1.5}>
      <Stack spacing={0.5}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {note && (
          <Typography variant="body2" color="text.secondary">
            {note}
          </Typography>
        )}
      </Stack>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        {children}
      </Paper>
    </Stack>
  );
}

PreviewCard.displayName = 'PreviewCard';

/** The four resting cells on the Figma set's `state` axis (node 3653:28080). */
const STATES: readonly { label: string; props: Partial<RadioProps> }[] = [
  { label: 'Unselected', props: {} },
  { label: 'Selected', props: { defaultChecked: true } },
  { label: 'Disabled', props: { disabled: true } },
  {
    label: 'Disabled selected',
    props: { disabled: true, defaultChecked: true },
  },
];

/**
 * Live rendering of the Radio states from the Figma component set, at
 * both sizes, plus grouped selection and horizontal layout.
 */
export function RadioShowcase() {
  const [plan, setPlan] = React.useState('starter');
  const [size, setSize] = React.useState('md');
  const [density, setDensity] = React.useState('compact');

  function handlePlanChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPlan(event.target.value);
  }

  function handleSizeChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSize(event.target.value);
  }

  function handleDensityChange(event: React.ChangeEvent<HTMLInputElement>) {
    setDensity(event.target.value);
  }

  return (
    <Stack spacing={4}>
      <PreviewCard
        title="States"
        note="Click an unselected radio to see MUI's own animation: the dot grows from nothing. Hover one first — the set gives hover and selected the same border, so the dot is what actually marks selection."
      >
        <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
          {STATES.map((state) => (
            <Radio key={state.label} label={state.label} {...state.props} />
          ))}
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Sizes"
        note="16px and 12px circles, with 10px and 6px dots. The pointer target stays 34px and 30px."
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto auto',
            columnGap: 4,
            rowGap: 1,
            justifyContent: 'start',
            alignItems: 'center',
          }}
        >
          {STATES.map((state) => (
            <React.Fragment key={state.label}>
              <Radio label={`${state.label} — md`} {...state.props} />
              <Radio size="sm" label={`${state.label} — sm`} {...state.props} />
            </React.Fragment>
          ))}
        </Box>
      </PreviewCard>

      <PreviewCard title="Radio group">
        <RadioGroup value={plan} onChange={handlePlanChange}>
          <Radio value="starter" label="Starter" />
          <Radio value="pro" label="Pro" />
          <Radio value="enterprise" label="Enterprise" />
        </RadioGroup>
      </PreviewCard>

      <PreviewCard title="Horizontal group">
        <RadioGroup row value={size} onChange={handleSizeChange}>
          <Radio value="sm" label="Small" />
          <Radio value="md" label="Medium" />
          <Radio value="lg" label="Large" />
        </RadioGroup>
      </PreviewCard>

      <PreviewCard
        title="Small radios in a group"
        note="`RadioGroup` has no size axis, so each radio carries its own."
      >
        <RadioGroup value={density} onChange={handleDensityChange}>
          <Radio size="sm" value="compact" label="Compact" />
          <Radio size="sm" value="cosy" label="Cosy" />
        </RadioGroup>
      </PreviewCard>

      <PreviewCard title="Without a visible label">
        <Stack direction="row" spacing={2}>
          <Radio value="row-1" aria-label="Select row" />
          <Radio size="sm" value="row-2" aria-label="Select small row" />
        </Stack>
      </PreviewCard>
    </Stack>
  );
}

RadioShowcase.displayName = 'RadioShowcase';
