'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { AccountMenu } from '@/src/components/AccountMenu';
import { Divider } from '@/src/components/Divider';
import { MenuItem } from '@/src/components/MenuItem';
import { Navbar } from '@/src/components/Navbar';
import {
  BookOpenIcon,
  BugIcon,
  ChartBarIcon,
  CreditCardIcon,
  GearSixIcon,
  QuestionIcon,
} from '@/src/icons';

// The full shell is the one the Drawer and Navbar pages show, so the menu
// is seen where it lives rather than in a third sketch of the app.
import { AppShell } from '../../drawer/_components/AppShell';

/** How tall the shell preview is, so the whole panel opens inside it. */
const SHELL_PREVIEW_HEIGHT_PX = 640;

const USER = {
  name: 'John Doe',
  email: 'john.doe@neo.com',
  role: 'Tenant Owner',
};

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

/** A box standing in for a viewport, for the bar shown on its own. */
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
 * Two previews: the menu at the end of the app bar in the full shell, and
 * the smallest menu — the user, the theme switch and Sign out — on a bar
 * of its own. Press the avatar to open either.
 */
export function AccountMenuShowcase() {
  return (
    <Stack spacing={4}>
      <PreviewCard
        title="In the shell"
        description="Press the avatar at the trailing edge of the app bar. The header is the signed-in user; the two groups under it are the app's own rows, passed as children; the theme switch and Sign out come with the component. The switch changes this page's scheme and leaves the menu open, and choosing any row closes it."
      >
        <AppShell height={SHELL_PREVIEW_HEIGHT_PX} />
      </PreviewCard>

      <PreviewCard
        title="The rows are yours"
        description="Every row between the header and the theme switch is a MenuItem you pass, with a Divider between groups. Leave them out and the panel is the user, the theme switch and Sign out."
      >
        <Stack spacing={3}>
          <ViewportFrame>
            <Navbar>
              <Box sx={{ flex: 1 }} />
              <AccountMenu user={USER} onSignOut={() => undefined}>
                <MenuItem>
                  <GearSixIcon size={16} />
                  Settings
                </MenuItem>
                <MenuItem>
                  <CreditCardIcon size={16} />
                  Billings
                </MenuItem>
                <MenuItem>
                  <ChartBarIcon size={16} />
                  Reporting
                </MenuItem>
                <Divider />
                <MenuItem>
                  <QuestionIcon size={16} />
                  Help
                </MenuItem>
                <MenuItem>
                  <BookOpenIcon size={16} />
                  Documentation
                </MenuItem>
                <MenuItem>
                  <BugIcon size={16} />
                  Report an issue
                </MenuItem>
              </AccountMenu>
            </Navbar>
          </ViewportFrame>
          <ViewportFrame>
            <Navbar>
              <Box sx={{ flex: 1 }} />
              <AccountMenu
                user={{ name: 'Priya Raman', email: 'priya@neo.com' }}
                avatarColor="information"
                onSignOut={() => undefined}
              />
            </Navbar>
          </ViewportFrame>
        </Stack>
      </PreviewCard>
    </Stack>
  );
}

AccountMenuShowcase.displayName = 'AccountMenuShowcase';
