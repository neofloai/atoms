import {
  AccountMenu,
  Box,
  Divider,
  IconButton,
  MenuItem,
  Navbar,
  Skeleton,
  Stack,
  WorkspaceSwitcher,
  useSidebarToggle,
} from '@neofloai/atoms';
import {
  BookOpenIcon,
  BugIcon,
  ChartBarIcon,
  CreditCardIcon,
  GearSixIcon,
  QuestionIcon,
  SidebarSimpleIcon,
} from '@neofloai/atoms/icons';
import { Suspense, useState } from 'react';
import { Outlet } from 'react-router';

import { CURRENT_USER, WORKSPACES } from './account';
import { AppRail } from './AppRail';

/** Rows in the account menu carry a 16px glyph. */
const MENU_GLYPH_PX = 16;

/**
 * The shell every page renders inside: the rail full height on the left,
 * then a column of the bar and the page.
 *
 * The bar leads with the sidebar toggle and ends with the account menu;
 * the rail's footer is the workspace switcher. The workspace is held here
 * because the rail renders twice — docked, and as the peek — and both
 * have to show the same one.
 */
export function AppLayout() {
  const sidebar = useSidebarToggle();
  const [workspaceId, setWorkspaceId] = useState(WORKSPACES[0]?.id ?? '');

  const workspaceSwitcher = (
    <WorkspaceSwitcher workspaces={WORKSPACES} value={workspaceId} onChange={setWorkspaceId} />
  );

  return (
    <Stack direction="row" sx={{ height: '100vh' }}>
      <AppRail
        dockProps={sidebar.dockProps}
        resizeHandleProps={sidebar.resizeHandleProps}
        resizeTooltipProps={sidebar.resizeTooltipProps}
        footer={workspaceSwitcher}
      />

      <Stack component="main" sx={{ flex: 1, minWidth: 0 }}>
        <Navbar>
          <IconButton variant="secondary" appearance="text" size="sm" {...sidebar.toggleProps}>
            <SidebarSimpleIcon />
          </IconButton>
          <Box sx={{ flex: 1 }} />
          {/* Point each row at its page as the app grows. The theme switch
              and Sign out come with the menu. */}
          <AccountMenu user={CURRENT_USER} onSignOut={() => {}}>
            <MenuItem>
              <GearSixIcon size={MENU_GLYPH_PX} />
              Settings
            </MenuItem>
            <MenuItem>
              <CreditCardIcon size={MENU_GLYPH_PX} />
              Billings
            </MenuItem>
            <MenuItem>
              <ChartBarIcon size={MENU_GLYPH_PX} />
              Reporting
            </MenuItem>
            <Divider />
            <MenuItem>
              <QuestionIcon size={MENU_GLYPH_PX} />
              Help
            </MenuItem>
            <MenuItem>
              <BookOpenIcon size={MENU_GLYPH_PX} />
              Documentation
            </MenuItem>
            <MenuItem>
              <BugIcon size={MENU_GLYPH_PX} />
              Report an issue
            </MenuItem>
          </AccountMenu>
        </Navbar>
        {/* Pages are lazy; hold their space while one loads. */}
        <Suspense fallback={<Skeleton variant="rectangular" sx={{ flex: 1, m: 3 }} />}>
          <Outlet />
        </Suspense>
      </Stack>

      <AppRail
        peekProps={sidebar.peekProps}
        onNavigate={sidebar.closePeek}
        footer={workspaceSwitcher}
      />
    </Stack>
  );
}
