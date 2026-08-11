'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Checkbox } from '@/src/components/Checkbox';

import type { CheckboxProps } from '@/src/components/Checkbox';

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

/**
 * The six cells on the Figma set's `state` axis (node 3205:121943).
 * Figma calls the indeterminate dash `unselect`; it is the same filled
 * box as `selected` with a different mark.
 */
const STATES: readonly { label: string; props: Partial<CheckboxProps> }[] = [
  { label: 'Unchecked', props: {} },
  { label: 'Checked', props: { defaultChecked: true } },
  { label: 'Indeterminate', props: { indeterminate: true } },
  { label: 'Disabled', props: { disabled: true } },
  {
    label: 'Disabled checked',
    props: { disabled: true, defaultChecked: true },
  },
  {
    label: 'Disabled indeterminate',
    props: { disabled: true, indeterminate: true },
  },
];

/**
 * Live rendering of the Checkbox states from the Figma component set,
 * at both sizes, plus the interactive parent / child pattern.
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
      <PreviewCard
        title="States"
        note="Checked and indeterminate share one filled box — only the mark differs, and it grows in on the way there. Hover an enabled box to see the subtle fill the set draws for it."
      >
        <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
          {STATES.map((state) => (
            <Checkbox key={state.label} label={state.label} {...state.props} />
          ))}
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Sizes"
        note="16px and 12px boxes. The pointer target stays 34px and 30px, so `sm` saves less room than the box suggests."
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
              <Checkbox label={`${state.label} — md`} {...state.props} />
              <Checkbox
                size="sm"
                label={`${state.label} — sm`}
                {...state.props}
              />
            </React.Fragment>
          ))}
        </Box>
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
        <Stack direction="row" spacing={2}>
          <Checkbox aria-label="Select row" />
          <Checkbox size="sm" aria-label="Select small row" />
        </Stack>
      </PreviewCard>
    </Stack>
  );
}

CheckboxShowcase.displayName = 'CheckboxShowcase';
