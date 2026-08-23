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
      description="A permanent drawer at the 220px sm width, running the full height of the app with the bar starting where it ends. Four blocks, separated by space rather than rules: brand and workspace switcher, the main nav, a second nav group, and the signed-in user — the main nav taking the slack, which is what holds the last two on the bottom edge. Fold it with the toggle in the bar; 64px is the same size prop with a raw number, since a folded rail is the same panel narrowed rather than a fourth rung on the scale. Configuration carries a second level: open it to see the children indent behind a branch rule, note that the parent takes the selected row's weight but never its fill, then fold the rail and open it again — with no width to indent into, the same level arrives in a flyout beside the glyph."
    >
      <AppShell height={SHELL_PREVIEW_HEIGHT_PX} />
    </PreviewCard>
  );
}

DrawerShowcase.displayName = 'DrawerShowcase';
