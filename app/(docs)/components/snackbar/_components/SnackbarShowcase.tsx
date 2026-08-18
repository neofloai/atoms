'use client';

import * as React from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Button } from '@/src/components/Button';
import {
  Snackbar,
  SnackbarProvider,
  useSnackbar,
} from '@/src/components/Snackbar';

import type { AlertSeverity } from '@/src/components/Alert';

const severities: readonly AlertSeverity[] = [
  'success',
  'error',
  'warning',
  'info',
];

const messageFor: Record<AlertSeverity, string> = {
  success: 'Your edits are live for everyone on the team.',
  error: 'Nothing was lost — try again in a moment.',
  warning: 'Two rows were skipped because their dates would not parse.',
  info: 'The export is ready to download.',
};

function PreviewCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        {children}
      </Paper>
    </Stack>
  );
}

PreviewCard.displayName = 'PreviewCard';

/**
 * The hook side of the demo. Has to sit below the provider, which is
 * also the one rule about mounting it.
 */
function HookDemos() {
  const { notify, success, error, warning, info, dismiss } = useSnackbar();

  const fire = React.useMemo(
    () => ({ success, error, warning, info }),
    [error, info, success, warning]
  );

  function handleQueue() {
    success('First — saved.');
    warning('Second — two rows skipped.');
    info('Third — export ready.');
  }

  function handleTitled() {
    notify({
      severity: 'error',
      title: 'Upload failed',
      message: 'The file was larger than the 25 MB limit.',
      autoHideDuration: null,
    });
  }

  function handleAction() {
    notify({
      severity: 'info',
      message: 'Item moved to trash.',
      action: (
        <Button variant="secondary" size="sm" onClick={dismiss}>
          Undo
        </Button>
      ),
    });
  }

  return (
    <Stack spacing={4}>
      <PreviewCard
        title="The four severities"
        description="One line each, fired from an event handler. Top right, in from the right edge, gone after five seconds."
      >
        <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {severities.map((severity) => (
            <Button
              key={severity}
              variant="secondary"
              size="sm"
              onClick={() => fire[severity](messageFor[severity])}
            >
              {severity}
            </Button>
          ))}
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Titles, actions, and one that waits"
        description="The error carries a recovery step, so it stays until it is dismissed rather than expiring while it is being read. The Undo button replaces the close affordance."
      >
        <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <Button variant="secondary" size="sm" onClick={handleTitled}>
            Error with a title
          </Button>
          <Button variant="secondary" size="sm" onClick={handleAction}>
            With an Undo action
          </Button>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="The queue"
        description="Three messages fired in the same handler. They arrive one after another in the order they were sent — the alternative is a column in the corner where the second covers the first."
      >
        <Button variant="secondary" size="sm" onClick={handleQueue}>
          Fire three at once
        </Button>
      </PreviewCard>
    </Stack>
  );
}

HookDemos.displayName = 'HookDemos';

/**
 * The controlled primitive, anchored bottom left to show the slide
 * following the anchor rather than staying pinned to one edge.
 */
function ControlledDemo() {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleClose = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <PreviewCard
      title="Controlled, and anchored elsewhere"
      description="Owning open yourself, with anchorOrigin moved to the bottom left. The transition follows it — this one enters from the left edge, not the right."
    >
      <Button variant="secondary" size="sm" onClick={() => setIsOpen(true)}>
        Show bottom-left toast
      </Button>
      <Snackbar
        open={isOpen}
        severity="success"
        message="Anchored bottom left, entering from that edge."
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        onClose={handleClose}
      />
    </PreviewCard>
  );
}

ControlledDemo.displayName = 'ControlledDemo';

/**
 * Live Snackbar demo: the four severities through `useSnackbar`, the
 * cases that need `notify`, the queue, and the controlled form.
 */
export function SnackbarShowcase() {
  return (
    <SnackbarProvider>
      <Stack spacing={4}>
        <HookDemos />
        <ControlledDemo />
      </Stack>
    </SnackbarProvider>
  );
}

SnackbarShowcase.displayName = 'SnackbarShowcase';
