'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Button } from '@/src/components/Button';
import { IconButton } from '@/src/components/IconButton';
import { Tooltip } from '@/src/components/Tooltip';
import { ArchiveIcon, InfoIcon, TrashIcon } from '@/src/icons';

/** The sheet's own sample copy, so the wrapped column can be compared to it. */
const LONG_COPY =
  'Tool tip content will help people understand things which are hidden, which are deep, which require the user to slow down & think for a second about what this all really means?';

/**
 * The six variants on the Figma sheet, in MUI's `placement` vocabulary.
 * Laid out `top-*` above `bottom-*` so every open bubble points away
 * from the other row instead of covering it.
 */
const SHEET_PLACEMENTS = [
  'top-start',
  'top',
  'top-end',
  'bottom-start',
  'bottom',
  'bottom-end',
] as const;

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

/** Live rendering of every Tooltip axis: trigger, placement, copy, tip, state. */
export function TooltipShowcase() {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return undefined;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <Stack spacing={4}>
      <PreviewCard
        title="Triggers"
        description="Hover or tab to any of these. On touch, press and hold."
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Tooltip title="Archive">
            <IconButton aria-label="Archive">
              <ArchiveIcon />
            </IconButton>
          </Tooltip>
          {/*
            The trigger's own `aria-label` wins over the one MUI derives
            from `title`, so the two have to say the same thing.
          */}
          <Tooltip title="Delete for everyone">
            <IconButton variant="error" aria-label="Delete for everyone">
              <TrashIcon />
            </IconButton>
          </Tooltip>
          <Tooltip
            title="Sends a copy to everyone on the thread"
            describeChild
            placement="top"
          >
            <Button>Reply all</Button>
          </Tooltip>
          <Tooltip title="Only owners can delete a workspace">
            <span>
              <Button disabled>Delete</Button>
            </span>
          </Tooltip>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Placement"
        description="The six variants on the sheet, held open. Popper still flips any of them when the trigger runs out of room near an edge."
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 3,
            rowGap: 8,
            py: 6,
            justifyItems: 'center',
          }}
        >
          {SHEET_PLACEMENTS.map((placement) => (
            <Tooltip key={placement} title={placement} placement={placement} open>
              <Button appearance="outline">{placement}</Button>
            </Tooltip>
          ))}
        </Box>
      </PreviewCard>

      <PreviewCard
        title="Longer copy"
        description="The bubble wraps at a 300px text column inside 12px of side padding — 324px overall, straight off the sheet."
      >
        {/* Centred so the 324px bubble stays inside the card. */}
        <Stack sx={{ alignItems: 'center', pb: 12 }}>
          <Tooltip title={LONG_COPY} open>
            <Button appearance="outline">What is this?</Button>
          </Tooltip>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="With and without the tip"
        description="`arrow` is on by default here. Turn it off for a bubble that floats free of its trigger."
      >
        <Stack direction="row" spacing={6} sx={{ alignItems: 'center', pb: 8 }}>
          <Tooltip title="With a tip" open>
            <Button appearance="outline">arrow</Button>
          </Tooltip>
          <Tooltip title="Without a tip" arrow={false} open>
            <Button appearance="outline">no tip</Button>
          </Tooltip>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Controlled"
        description="Opened by a click rather than a hover, and closed on a timer."
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Tooltip
            title="Copied to clipboard"
            placement="top"
            open={copied}
            disableHoverListener
            disableFocusListener
            disableTouchListener
          >
            <Button appearance="outline" onClick={() => setCopied(true)}>
              Copy link
            </Button>
          </Tooltip>
          <Tooltip title="About copying">
            <IconButton variant="secondary" aria-label="About copying">
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </PreviewCard>
    </Stack>
  );
}

TooltipShowcase.displayName = 'TooltipShowcase';
