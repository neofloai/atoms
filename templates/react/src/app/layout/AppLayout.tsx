import { IconButton, Navbar, Skeleton, Stack, useSidebarToggle } from '@neofloai/atoms';
import { SidebarSimpleIcon } from '@neofloai/atoms/icons';
import { Suspense } from 'react';
import { Outlet } from 'react-router';

import { AppRail } from './AppRail';

/**
 * The shell every page renders inside: the rail full height on the left,
 * then a column of the bar and the page.
 */
export function AppLayout() {
  const sidebar = useSidebarToggle();

  return (
    <Stack direction="row" sx={{ height: '100vh' }}>
      <AppRail
        dockProps={sidebar.dockProps}
        resizeHandleProps={sidebar.resizeHandleProps}
        resizeTooltipProps={sidebar.resizeTooltipProps}
      />

      <Stack component="main" sx={{ flex: 1, minWidth: 0 }}>
        <Navbar>
          <IconButton variant="secondary" appearance="text" size="sm" {...sidebar.toggleProps}>
            <SidebarSimpleIcon />
          </IconButton>
        </Navbar>
        {/* Pages are lazy; hold their space while one loads. */}
        <Suspense fallback={<Skeleton variant="rectangular" sx={{ flex: 1, m: 3 }} />}>
          <Outlet />
        </Suspense>
      </Stack>

      <AppRail peekProps={sidebar.peekProps} onNavigate={sidebar.closePeek} />
    </Stack>
  );
}
