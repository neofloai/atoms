'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Button } from '@/src/components/Button';
import { IconButton } from '@/src/components/IconButton';
import {
  CircularProgress,
  LinearProgress,
} from '@/src/components/Progress';
import { Slider } from '@/src/components/Slider';
import {
  ArrowsClockwiseIcon,
  CloudArrowUpIcon,
  FloppyDiskIcon,
} from '@/src/icons';

import type { ProgressColor } from '@/src/components/Progress';

/** Every colour role, in the order the props table lists them. */
const COLORS: readonly ProgressColor[] = [
  'primary',
  'secondary',
  'success',
  'error',
  'warning',
  'information',
];

/** The sizes the spinner is actually used at, plus the default. */
const SIZES: readonly number[] = [16, 20, 24, 40, 56];

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

/** One labelled cell, so a row of samples reads without a legend. */
function Sample({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={1} sx={{ alignItems: 'center', minWidth: 72 }}>
      {children}
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}

Sample.displayName = 'Sample';

/**
 * A determinate ring with its percentage in the middle — MUI's own
 * recipe, reproduced here rather than added to the component as a
 * `label` prop. The ring is a mark; text inside it is a layout.
 */
function RingWithLabel({ value }: { value: number }) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        value={value}
        enableTrackSlot
        size={56}
        aria-label="Upload progress"
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {`${Math.round(value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

RingWithLabel.displayName = 'RingWithLabel';

/** Live rendering of every Progress axis: shape, colour, variant, size. */
export function ProgressShowcase() {
  const [value, setValue] = React.useState(64);

  return (
    <Stack spacing={4}>
      <PreviewCard
        title="Two shapes, one wait"
        description="A spinner belongs to a control, a bar belongs to a region. Both are indeterminate by default: they animate for as long as they are mounted and promise nothing about when they will stop."
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={4}
          sx={{ alignItems: { sm: 'center' } }}
        >
          <CircularProgress aria-label="Loading results" />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <LinearProgress aria-label="Loading results" />
          </Box>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Colour roles"
        description="The moving part takes the role's accent ink — the same rung a Badge dot uses, because a 4px bar has no room to carry a pale fill. The track is neutral in every role, and one shade darker in dark mode than the Slider rail, so the fill keeps its separation as the accents lift."
      >
        <Stack spacing={3}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ flexWrap: 'wrap', rowGap: 3, alignItems: 'flex-start' }}
          >
            {COLORS.map((color) => (
              <Sample key={color} label={color}>
                <CircularProgress
                  variant="determinate"
                  value={70}
                  enableTrackSlot
                  color={color}
                  size={32}
                  aria-label={`Example, ${color}`}
                />
              </Sample>
            ))}
          </Stack>
          <Stack spacing={2}>
            {COLORS.map((color) => (
              <LinearProgress
                key={color}
                variant="determinate"
                value={70}
                color={color}
                aria-label={`Example, ${color}`}
              />
            ))}
          </Stack>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Determinate"
        description="Drag the value. A bar tweens over 0.4s and a ring animates its stroke, so a value arriving in steps still moves smoothly."
      >
        <Stack spacing={3}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={4}
            sx={{ alignItems: { sm: 'center' } }}
          >
            <RingWithLabel value={value} />
            <Sample label="no track slot">
              <CircularProgress
                variant="determinate"
                value={value}
                size={56}
                aria-label="Upload progress"
              />
            </Sample>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <LinearProgress
                variant="determinate"
                value={value}
                aria-label="Upload progress"
              />
            </Box>
          </Stack>
          <Box sx={{ maxWidth: 320 }}>
            <Slider
              value={value}
              onChange={(_, next) => setValue(next as number)}
              aria-label="Progress value"
              valueLabelDisplay="auto"
            />
          </Box>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Size and thickness"
        description="`size` is a raw dimension rather than a step on a ladder, and `thickness` is measured in a 44-unit viewBox — so the stroke keeps its proportion as the spinner shrinks."
      >
        <Stack spacing={3}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ flexWrap: 'wrap', rowGap: 3, alignItems: 'flex-end' }}
          >
            {SIZES.map((size) => (
              <Sample key={size} label={`${size}px`}>
                <CircularProgress size={size} aria-label={`Loading, ${size}px`} />
              </Sample>
            ))}
          </Stack>
          <Stack
            direction="row"
            spacing={2}
            sx={{ flexWrap: 'wrap', rowGap: 3, alignItems: 'flex-end' }}
          >
            <Sample label="thickness 2">
              <CircularProgress thickness={2} aria-label="Loading, thin" />
            </Sample>
            <Sample label="3.6 (default)">
              <CircularProgress aria-label="Loading" />
            </Sample>
            <Sample label="thickness 6">
              <CircularProgress thickness={6} aria-label="Loading, thick" />
            </Sample>
            <Sample label="disableShrink">
              <CircularProgress
                disableShrink
                aria-label="Loading, constant arc"
              />
            </Sample>
            <Sample label="height 8">
              <Box sx={{ width: 120 }}>
                <LinearProgress
                  variant="determinate"
                  value={40}
                  sx={{ height: 8 }}
                  aria-label="Example, tall bar"
                />
              </Box>
            </Sample>
          </Stack>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Buffer and query"
        description="Two MUI variants kept as they are. `buffer` draws a second value behind the first — fetched but not yet played — with dots for what has not arrived. `query` is the indeterminate bar reversed, for a request whose result will arrive from the other direction."
      >
        <Stack spacing={3}>
          <Stack spacing={1}>
            <LinearProgress
              variant="buffer"
              value={48}
              valueBuffer={64}
              aria-label="Buffering"
            />
            <Typography variant="caption" color="text.secondary">
              buffer — value 48, valueBuffer 64
            </Typography>
          </Stack>
          <Stack spacing={1}>
            <LinearProgress variant="query" aria-label="Querying" />
            <Typography variant="caption" color="text.secondary">
              query
            </Typography>
          </Stack>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Inside a control"
        description={
          'Both action components already render a spinner for their `loading` state — MUI\'s own, at `color="inherit"` and `size={16}`, so it takes the control\'s label colour and needs nothing from here. On a button with a label, pass `loadingPosition="start"` so the spinner takes the icon\'s place; the default `center` position leaves the label showing underneath in this theme (DESIGNER_QUESTIONS.md #36). Use `color="inherit"` directly for anything hand-composed.'
        }
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ flexWrap: 'wrap', rowGap: 2, alignItems: 'center' }}
        >
          <Button
            variant="primary"
            loading
            loadingPosition="start"
            startIcon={<FloppyDiskIcon />}
          >
            Saving
          </Button>
          <Button
            variant="secondary"
            appearance="outline"
            loading
            loadingPosition="start"
            startIcon={<ArrowsClockwiseIcon />}
          >
            Refreshing
          </Button>
          <Button
            variant="error"
            loading
            loadingPosition="start"
            startIcon={<CloudArrowUpIcon />}
          >
            Uploading
          </Button>
          <IconButton loading aria-label="Refreshing">
            <ArrowsClockwiseIcon />
          </IconButton>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: 'text.secondary',
            }}
          >
            <CircularProgress color="inherit" size={16} aria-label="Saving" />
            <Typography variant="body2" color="inherit">
              Saving draft
            </Typography>
          </Box>
        </Stack>
      </PreviewCard>
    </Stack>
  );
}

ProgressShowcase.displayName = 'ProgressShowcase';
