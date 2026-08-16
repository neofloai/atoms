'use client';

import * as React from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Checkbox } from '@/src/components/Checkbox';

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
 * Live rendering of the Checkbox states from the Figma `checkbox` set
 * (node 3205:121943): unchecked / checked / indeterminate, both sizes,
 * with and without labels, and the disabled combinations.
 */
export function CheckboxShowcase() {
  const [parentDemo, setParentDemo] = React.useState([true, false]);

  function handleParentChange() {
    const allSelected = parentDemo.every(Boolean);
    setParentDemo(parentDemo.map(() => !allSelected));
  }

  function handleChildChange(index: number) {
    setParentDemo((current) =>
      current.map((value, i) => (i === index ? !value : value))
    );
  }

  function handleFirstChildChange() {
    handleChildChange(0);
  }

  function handleSecondChildChange() {
    handleChildChange(1);
  }

  const allSelected = parentDemo.every(Boolean);
  const someSelected = parentDemo.some(Boolean);

  return (
    <Stack spacing={4}>
      <PreviewCard title="States">
        <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
          <Checkbox label="Unchecked" />
          <Checkbox label="Checked" defaultChecked />
          <Checkbox label="Indeterminate" indeterminate />
          <Checkbox label="Disabled" disabled />
          <Checkbox label="Disabled checked" disabled defaultChecked />
        </Stack>
      </PreviewCard>

      <PreviewCard title="Two sizes">
        <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              md — a 16px box
            </Typography>
            <Stack direction="row" spacing={2}>
              <Checkbox label="Unchecked" />
              <Checkbox label="Checked" defaultChecked />
              <Checkbox label="Indeterminate" indeterminate />
            </Stack>
          </Stack>
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              sm — a 12px box, in the same 32px target
            </Typography>
            <Stack direction="row" spacing={2}>
              <Checkbox size="sm" label="Unchecked" />
              <Checkbox size="sm" label="Checked" defaultChecked />
              <Checkbox size="sm" label="Indeterminate" indeterminate />
            </Stack>
          </Stack>
        </Stack>
      </PreviewCard>

      <PreviewCard title="Parent / child selection">
        <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
          <Checkbox
            label="Select all"
            checked={allSelected}
            indeterminate={someSelected && !allSelected}
            onChange={handleParentChange}
          />
          <Stack spacing={1} sx={{ pl: 4, alignItems: 'flex-start' }}>
            <Checkbox
              label="checkbox item 1"
              checked={parentDemo[0]}
              onChange={handleFirstChildChange}
            />
            <Checkbox
              label="checkbox item 2"
              checked={parentDemo[1]}
              onChange={handleSecondChildChange}
            />
          </Stack>
        </Stack>
      </PreviewCard>

      <PreviewCard title="Without a visible label">
        <Checkbox aria-label="Select row" />
      </PreviewCard>
    </Stack>
  );
}

CheckboxShowcase.displayName = 'CheckboxShowcase';
