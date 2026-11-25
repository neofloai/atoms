'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Drawer } from '@/src/components/Drawer';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@/src/components/List';
import { WorkspaceSwitcher } from '@/src/components/WorkspaceSwitcher';
import { FileTextIcon, HouseIcon } from '@/src/icons';

import type { WorkspaceOption } from '@/src/components/WorkspaceSwitcher';

// The full shell is the one the Drawer and Navbar pages show, so the
// switcher is seen where it lives rather than in a third sketch of the app.
import { AppShell } from '../../drawer/_components/AppShell';

/** How tall the shell preview is, so all four rail blocks are visible. */
const SHELL_PREVIEW_HEIGHT_PX = 640;

/** How tall the standalone rails are: the nav, then the footer under it. */
const RAIL_PREVIEW_HEIGHT_PX = 320;

/** The folded rail's width. */
const RAIL_COLLAPSED_PX = 64;

const WORKSPACES: readonly WorkspaceOption[] = [
  { id: 'finance', name: 'Finance', color: 'primary' },
  { id: 'procurement', name: 'Procurement', color: 'success' },
  { id: 'accounts-payable', name: 'Accounts Payable', color: 'purple' },
];

const NAV = [
  { key: 'home', label: 'Home', Icon: HouseIcon },
  { key: 'invoices', label: 'Invoices', Icon: FileTextIcon },
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

/**
 * A rail on its own: the nav taking the slack and the switcher under it.
 * The paper is made relative so the drawer sits in the preview rather
 * than pinning itself to the window's edge.
 */
function Rail({ collapsed }: { collapsed: boolean }) {
  const [active, setActive] = React.useState<string>('home');
  const [workspaceId, setWorkspaceId] = React.useState('finance');

  return (
    <Box sx={{ height: RAIL_PREVIEW_HEIGHT_PX, display: 'flex' }}>
      <Drawer
        variant="permanent"
        size={collapsed ? RAIL_COLLAPSED_PX : 'sm'}
        slotProps={{ paper: { sx: { position: 'relative' } } }}
      >
        <List
          variant="nav"
          component="nav"
          sx={{ flex: 1, p: 1.5, ...(collapsed && { alignItems: 'center' }) }}
        >
          {NAV.map(({ key, label, Icon }) => (
            <ListItemButton
              key={key}
              selected={active === key}
              aria-label={collapsed ? label : undefined}
              onClick={() => setActive(key)}
            >
              <ListItemIcon>
                <Icon size={16} />
              </ListItemIcon>
              {!collapsed && <ListItemText primary={label} />}
            </ListItemButton>
          ))}
        </List>
        <WorkspaceSwitcher
          workspaces={WORKSPACES}
          value={workspaceId}
          onChange={setWorkspaceId}
          onCreate={() => undefined}
          collapsed={collapsed}
        />
      </Drawer>
    </Box>
  );
}

Rail.displayName = 'Rail';

/**
 * Two previews: the switcher at the foot of the full shell, and a rail on
 * its own, open and folded side by side. Press the trigger to open either.
 */
export function WorkspaceSwitcherShowcase() {
  return (
    <Stack spacing={4}>
      <PreviewCard
        title="In the shell"
        description="The last block of the sidebar. The nav above it takes the slack, which holds the switcher on the bottom edge behind its rule. Press it and the list opens upwards: the current workspace filled and checked, the others under it, and Create workspace behind a rule."
      >
        <AppShell height={SHELL_PREVIEW_HEIGHT_PX} />
      </PreviewCard>

      <PreviewCard
        title="Open and folded"
        description="Folded to the 64px strip, the trigger is the square avatar alone, on the same axis as the nav glyphs above it, and the name moves into a tooltip. The list it opens is the same."
      >
        <Stack direction="row" spacing={3} sx={{ alignItems: 'flex-start' }}>
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}>
            <Rail collapsed={false} />
          </Box>
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}>
            <Rail collapsed />
          </Box>
        </Stack>
      </PreviewCard>
    </Stack>
  );
}

WorkspaceSwitcherShowcase.displayName = 'WorkspaceSwitcherShowcase';
