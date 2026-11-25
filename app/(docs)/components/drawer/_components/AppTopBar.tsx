'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { AccountMenu } from '@/src/components/AccountMenu';
import { Divider } from '@/src/components/Divider';
import { IconButton } from '@/src/components/IconButton';
import { MenuItem } from '@/src/components/MenuItem';
import { Navbar } from '@/src/components/Navbar';
import { Tooltip } from '@/src/components/Tooltip';
import { text } from '@/src/tokens';
import {
  BookOpenIcon,
  BugIcon,
  ChartBarIcon,
  CreditCardIcon,
  GearSixIcon,
  QuestionIcon,
  SidebarSimpleIcon,
  StarFourIcon,
} from '@/src/icons';

import type { Theme } from '@mui/material/styles';
import type { ModeToken } from '@/src/tokens';
import type { SidebarToggleProps } from '@/src/components/Drawer';

/**
 * The app bar from the navigation sheet's top nav bar (4564:6086), ending
 * in the library's `AccountMenu` (4564:6122).
 *
 * The row is the sidebar toggle, the page you are on, a flexible gap, then
 * Ask Neo and the signed-in user's avatar — every child 16px from the
 * next. The bar does not impose that gap; it is a `Stack` here, because
 * spacing between children is composition.
 *
 * ## Two controls are larger than drawn
 *
 * The sheet draws the toggle and Ask Neo as 24px squares. `IconButton`'s
 * smallest size is 32, and the controls here use it unmodified rather
 * than being shrunk with `sx` — a 24px rung is a gap in the component, not
 * something one call site should paper over. The bar is 48 tall, so 32
 * still sits inside it with room. See DESIGNER_QUESTIONS.md #71.
 */

/** Gap between the bar's children — `Scale/300`. */
const BAR_GAP = 2;

const USER = {
  name: 'John Doe',
  email: 'john.doe@neo.com',
  role: 'Tenant Owner',
};

/** Paint one property from a token, in both schemes. */
function ink(property: string, token: ModeToken) {
  return (theme: Theme) => ({
    [property]: token.light,
    ...theme.applyStyles('dark', { [property]: token.dark }),
  });
}

export function AppTopBar({
  title,
  toggleProps,
}: {
  /** The page you are on, after the toggle. */
  title: string;
  /** The sidebar toggle's name, press and hover, from `useSidebarToggle`. */
  toggleProps: SidebarToggleProps;
}) {
  return (
    <Navbar>
      <Stack
        direction="row"
        sx={{ flex: 1, minWidth: 0, alignItems: 'center', gap: BAR_GAP }}
      >
        <IconButton
          variant="secondary"
          appearance="text"
          size="sm"
          {...toggleProps}
        >
          <SidebarSimpleIcon />
        </IconButton>

        {/* `Sans/B1/Regular` in `text/default/b2` — a breadcrumb's weight,
            not a title's: the page names itself below the bar. */}
        <Typography
          variant="body1"
          noWrap
          sx={(theme) => ({
            minWidth: 0,
            ...ink('color', text.default.b2)(theme),
          })}
        >
          {title}
        </Typography>

        <Box sx={{ flex: 1 }} />

        <Tooltip title="Ask Neo">
          <IconButton
            variant="primary"
            appearance="outline"
            size="sm"
            aria-label="Ask Neo"
          >
            <StarFourIcon />
          </IconButton>
        </Tooltip>

        {/* The account menu: the avatar, and the panel it opens. The
            theme switch and Sign out come with it; the rows are the app's. */}
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
      </Stack>
    </Navbar>
  );
}

AppTopBar.displayName = 'AppTopBar';
