'use client';

import * as React from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Radio, RadioGroup } from '@/src/components/Radio';

function PreviewCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        {children}
      </Paper>
    </Stack>
  );
}

PreviewCard.displayName = 'PreviewCard';

/**
 * Live rendering of the Radio states from the Figma selector set:
 * unselected / selected, grouped selection, horizontal layout, and
 * the disabled combinations.
 */
export function RadioShowcase() {
  const [plan, setPlan] = React.useState('starter');
  const [size, setSize] = React.useState('md');

  function handlePlanChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPlan(event.target.value);
  }

  function handleSizeChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSize(event.target.value);
  }

  return (
    <Stack spacing={4}>
      <PreviewCard title="States">
        <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
          <Radio label="Unselected" />
          <Radio label="Selected" defaultChecked />
          <Radio label="Disabled" disabled />
          <Radio label="Disabled selected" disabled defaultChecked />
        </Stack>
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

      <PreviewCard title="Without a visible label">
        <Radio value="row-1" aria-label="Select row" />
      </PreviewCard>
    </Stack>
  );
}

RadioShowcase.displayName = 'RadioShowcase';
