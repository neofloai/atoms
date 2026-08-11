'use client';

import * as React from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Slider } from '@/src/components/Slider';

/** Keeps the bars a realistic width rather than the full page. */
const TRACK_MAX_WIDTH = 360;

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

const teamSizeMarks = [
  { value: 0, label: '0' },
  { value: 25, label: '25' },
  { value: 50, label: '50' },
  { value: 75, label: '75' },
  { value: 100, label: '100' },
];

/** Live rendering of every Slider axis: size, marks, range, track, state. */
export function SliderShowcase() {
  const [priceRange, setPriceRange] = React.useState<number[]>([20, 60]);

  function handlePriceChange(event: Event, value: number | number[]) {
    setPriceRange(value as number[]);
  }

  return (
    <Stack spacing={4}>
      <PreviewCard title="Sizes">
        <Stack spacing={3} sx={{ maxWidth: TRACK_MAX_WIDTH }}>
          <Slider aria-label="Volume, medium" defaultValue={40} />
          <Slider size="sm" aria-label="Volume, small" defaultValue={40} />
        </Stack>
      </PreviewCard>

      <PreviewCard title="Stepped, with labelled ticks">
        <Stack sx={{ maxWidth: TRACK_MAX_WIDTH }}>
          <Slider
            aria-label="Team size"
            defaultValue={25}
            step={25}
            marks={teamSizeMarks}
            valueLabelDisplay="auto"
          />
        </Stack>
      </PreviewCard>

      <PreviewCard title="Range">
        <Stack spacing={1.5} sx={{ maxWidth: TRACK_MAX_WIDTH }}>
          <Typography variant="body2" color="text.secondary">
            ${priceRange[0]} – ${priceRange[1]}
          </Typography>
          <Slider
            getAriaLabel={(index) =>
              index === 0 ? 'Minimum price' : 'Maximum price'
            }
            value={priceRange}
            onChange={handlePriceChange}
            valueLabelDisplay="auto"
            disableSwap
          />
        </Stack>
      </PreviewCard>

      <PreviewCard title="Filled side">
        <Stack spacing={3} sx={{ maxWidth: TRACK_MAX_WIDTH }}>
          <Slider aria-label="Normal track" defaultValue={40} />
          <Slider
            aria-label="Inverted track"
            defaultValue={40}
            track="inverted"
          />
          <Slider aria-label="No track" defaultValue={40} track={false} />
        </Stack>
      </PreviewCard>

      <PreviewCard title="Disabled">
        <Stack sx={{ maxWidth: TRACK_MAX_WIDTH }}>
          <Slider aria-label="Volume, unavailable" defaultValue={40} disabled />
        </Stack>
      </PreviewCard>
    </Stack>
  );
}

SliderShowcase.displayName = 'SliderShowcase';
