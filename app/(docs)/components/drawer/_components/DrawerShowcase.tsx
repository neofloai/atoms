'use client';

import * as React from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { AppShell } from './AppShell';

/** How tall the shell preview is, so all four rail blocks are visible. */
const SHELL_PREVIEW_HEIGHT_PX = 720;

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

/**
 * One preview, and it is the app rail in the shell it belongs to.
 *
 * The other two variants and both vertical anchors are documented in code
 * under Examples rather than rendered here. A rail is the case that cannot
 * be read off a snippet — it is the panel *and* the space it reserves, and
 * both have to be on screen at once for the difference between a docked
 * drawer and one that floats to mean anything.
 */
export function DrawerShowcase() {
  return (
    <PreviewCard
      title="An app rail, composed"
      description="A permanent drawer at the 220px sm width, running the full height of the app with the bar starting where it ends. Three blocks: the brand, the nav, and the workspace switcher behind a rule at the foot — the nav taking the slack, which is what holds the switcher on the bottom edge. Each workflow carries a second level: the children indent behind a branch rule, and a parent takes the selected row's weight but never its fill. The toggle in the bar hides the rail outright and the page takes the full width; with it hidden, hover the toggle and the same rail floats in under the bar as a temporary drawer with no backdrop, leaving again when the pointer does."
    >
      <AppShell height={SHELL_PREVIEW_HEIGHT_PX} />
    </PreviewCard>
  );
}

DrawerShowcase.displayName = 'DrawerShowcase';
