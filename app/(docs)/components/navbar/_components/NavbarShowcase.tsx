'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// The shell, the rail and the page-header bar all live with the Drawer page's
// demos, so the arrangement shown here is the one shown there rather than a
// second sketch of it.
import { AppShell } from '../../drawer/_components/AppShell';
import { PageHeaderBar } from '../../drawer/_components/PageHeaderBar';

/** How tall the shell previews are, so all four rail blocks are visible. */
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

/** A box that stands in for a viewport, for the bar shown on its own. */
function ViewportFrame({ children }: { children: React.ReactNode }) {
  return (
    <Stack
      sx={{
        overflow: 'hidden',
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {children}
    </Stack>
  );
}

ViewportFrame.displayName = 'ViewportFrame';

/**
 * Three previews: the app bar in its shell, the page header on its own, and
 * the page header back in that shell.
 *
 * The last one is the pairing worth seeing — the two rungs are not one bar at
 * two heights, and a 72px header changes what the rail beside it looks like
 * proportionally.
 *
 * `sticky`, `disableGutters` and a `nav` row are documented in code under
 * Examples rather than rendered as bars of their own. A bar on its own says
 * almost nothing; everything interesting about one is what it sits against.
 */
export function NavbarShowcase() {
  return (
    <Stack spacing={4}>
      <PreviewCard
        title="sm — the app bar, in the shell it belongs to"
        description="The bar is not full width. The rail runs the whole height of the app and the bar starts at its right edge, spanning the content column only — so the brand mark is the top-left corner of the screen rather than something tucked under a bar. Both are painted from the same card 2 fill behind the same card 2 edge, so they meet at the corner with no seam. The bar carries the sidebar toggle and nothing else: the design leaves the rest of the row empty, and that space is where per-page actions land."
      >
        <AppShell height={SHELL_PREVIEW_HEIGHT_PX} />
      </PreviewCard>

      <PreviewCard
        title="md — the page header, naming a record"
        description="The taller rung, for a bar that says what the page is rather than what the app is. NavbarTitle carries the title and the line of context under it; the actions after the spacer are ordinary Buttons, so their roles say what they do. Same surface, same rule, same gutter — only the height changes."
      >
        <ViewportFrame>
          <PageHeaderBar />
          <Box sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Page content. The header is 72px rather than 48 because it holds
              two lines — a 28px title over a 16px row of context, with 4px
              between them and 12px of inset above and below.
            </Typography>
          </Box>
        </ViewportFrame>
      </PreviewCard>

      <PreviewCard
        title="md — inside a workflow, with the main menu one press away"
        description="Not the app bar at a different height: a different screen. Picking an item in the main shell replaces the whole view with this one — the header naming the record, and the rail reduced to a strip that stays half closed and never widens in place. The hamburger floats the main menu back in from outside, over the record rather than pushing it, and closes as soon as a destination is picked. That is the way back out of a workflow."
      >
        <AppShell height={SHELL_PREVIEW_HEIGHT_PX} size="md" />
      </PreviewCard>
    </Stack>
  );
}

NavbarShowcase.displayName = 'NavbarShowcase';
