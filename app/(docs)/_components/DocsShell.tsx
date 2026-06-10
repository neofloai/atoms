'use client';

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import GitHubIcon from '@mui/icons-material/GitHub';
import { ColorModeToggle } from './ColorModeToggle';
import { APP_BAR_HEIGHT, DRAWER_WIDTH } from './navigation';
import { DocsSidebar } from './DocsSidebar';

interface DocsShellProps {
  children: React.ReactNode;
}

/**
 * Persistent docs layout: a slim top app bar plus a left navigation
 * drawer that becomes a temporary overlay below the `md` breakpoint.
 *
 * Children render inside the main content slot. The top bar's brand
 * area is intentionally minimal on desktop (the sidebar already shows
 * the brand) and shows the brand on mobile, where the sidebar is
 * collapsed.
 */
export function DocsShell({ children }: DocsShellProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  function handleDrawerToggle() {
    setMobileOpen((open) => !open);
  }

  function handleSidebarItemClick() {
    setMobileOpen(false);
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        color="inherit"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Toolbar sx={{ minHeight: APP_BAR_HEIGHT, gap: 1 }}>
          <IconButton
            aria-label="Open navigation"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Stack
            direction="row"
            spacing={1.25}
            sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}
          >
            <Box
              sx={{
                width: 18,
                height: 18,
                borderRadius: 0.75,
                bgcolor: 'primary.main',
              }}
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Neoflo Atoms
            </Typography>
          </Stack>
          <Box sx={{ flex: 1 }} />
          <ColorModeToggle />
          <IconButton
            aria-label="GitHub"
            size="small"
            component="a"
            href="https://github.com/neofloai/atoms"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitHubIcon fontSize="small" />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          <DocsSidebar onItemClick={handleSidebarItemClick} />
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            },
          }}
        >
          <DocsSidebar />
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
        }}
      >
        <Toolbar sx={{ minHeight: APP_BAR_HEIGHT }} />
        <Box sx={{ px: { xs: 3, md: 5 }, py: { xs: 3, md: 5 } }}>{children}</Box>
      </Box>
    </Box>
  );
}

DocsShell.displayName = 'DocsShell';
