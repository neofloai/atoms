'use client';

import * as React from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Switch } from '@/src/components/Switch';

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
 * Live rendering of the Switch states from the Figma switch set:
 * off / on and the disabled combinations.
 */
export function SwitchShowcase() {
  const [enabled, setEnabled] = React.useState(true);

  function handleEnabledChange(event: React.ChangeEvent<HTMLInputElement>) {
    setEnabled(event.target.checked);
  }

  return (
    <Stack spacing={4}>
      <PreviewCard title="States">
        <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
          <Switch label="Off" />
          <Switch label="On" defaultChecked />
          <Switch label="Disabled" disabled />
          <Switch label="Disabled on" disabled defaultChecked />
        </Stack>
      </PreviewCard>

      <PreviewCard title="Controlled">
        <Switch
          label={enabled ? 'Notifications on' : 'Notifications off'}
          checked={enabled}
          onChange={handleEnabledChange}
        />
      </PreviewCard>

      <PreviewCard title="Without a visible label">
        <Switch aria-label="Enable notifications" />
      </PreviewCard>
    </Stack>
  );
}

SwitchShowcase.displayName = 'SwitchShowcase';
