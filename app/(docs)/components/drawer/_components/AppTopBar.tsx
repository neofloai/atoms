'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Avatar } from '@/src/components/Avatar';
import { Tag } from '@/src/components/Tag';
import { Divider } from '@/src/components/Divider';
import { IconButton } from '@/src/components/IconButton';
import { Menu } from '@/src/components/Menu';
import { MenuItem } from '@/src/components/MenuItem';
import { Navbar } from '@/src/components/Navbar';
import { ToggleButton, ToggleButtonGroup } from '@/src/components/ToggleButton';
import { Tooltip } from '@/src/components/Tooltip';
import { useColorScheme } from '@/src/theme/useColorScheme';
import { fontWeights, text } from '@/src/tokens';
import {
  BookOpenIcon,
  BugIcon,
  ChartBarIcon,
  CreditCardIcon,
  DesktopIcon,
  GearSixIcon,
  MoonIcon,
  QuestionIcon,
  SidebarSimpleIcon,
  SignOutIcon,
  StarFourIcon,
  SunIcon,
} from '@/src/icons';

import type { Theme } from '@mui/material/styles';
import type { ModeToken } from '@/src/tokens';
import type { SidebarToggleProps } from '@/src/components/Drawer';

/**
 * The app bar from the navigation sheet's top nav bar (4564:6086), and the
 * account menu its avatar opens (4564:6122).
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

/** Width of the account menu, as the sheet draws it. */
const ACCOUNT_MENU_WIDTH_PX = 240;

/** Space between the bar and the account menu under it — `Scale/250`. */
const ACCOUNT_MENU_OFFSET = 1.5;

const USER = {
  name: 'John Doe',
  email: 'john.doe@neo.com',
  initials: 'JD',
  role: 'Tenant Owner',
};

/** Paint one property from a token, in both schemes. */
function ink(property: string, token: ModeToken) {
  return (theme: Theme) => ({
    [property]: token.light,
    ...theme.applyStyles('dark', { [property]: token.dark }),
  });
}

/**
 * The signed-in user, heading the account menu.
 *
 * Not a menu row: there is nothing to pick. A 36px avatar beside the name
 * in `Sans/B1/Medium`, the address under it in `Sans/B2/Medium` caption
 * ink, and the role as a small grey tag — the metadata tag, which is
 * what the sheet's tag is.
 */
function AccountHeader() {
  return (
    <Box sx={{ display: 'flex', gap: 1.5, px: 1, py: 1.5 }}>
      <Avatar size="md" color="error">
        {USER.initials}
      </Avatar>
      <Stack sx={{ gap: 1, minWidth: 0, alignItems: 'flex-start' }}>
        <Stack sx={{ gap: 0.25, minWidth: 0, maxWidth: '100%' }}>
          <Typography
            variant="body1"
            noWrap
            sx={(theme) => ({
              fontWeight: fontWeights.medium,
              ...ink('color', text.default.b1)(theme),
            })}
          >
            {USER.name}
          </Typography>
          <Typography
            variant="body2"
            noWrap
            sx={(theme) => ({
              fontWeight: fontWeights.medium,
              ...ink('color', text.default.b3)(theme),
            })}
          >
            {USER.email}
          </Typography>
        </Stack>
        <Tag variant="secondary" label={USER.role} />
      </Stack>
    </Box>
  );
}

AccountHeader.displayName = 'AccountHeader';

/**
 * The theme switch — system, light, dark — on a row of its own.
 *
 * Wired to the real colour scheme, so it changes the page it is on. It is
 * the house segmented control unmodified: a grey track, 24px buttons, the
 * selected one raised on the page surface — the treatment the sheet draws.
 */
function ThemeRow() {
  const { mode, setMode } = useColorScheme();

  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 28,
        px: 1,
        typography: 'body1',
        fontWeight: fontWeights.medium,
        ...ink('color', text.default.b1)(theme),
      })}
    >
      Theme
      <ToggleButtonGroup
        appearance="segmented"
        exclusive
        aria-label="Theme"
        value={mode ?? 'system'}
        onChange={(_, next: 'system' | 'light' | 'dark' | null) => {
          if (next) setMode(next);
        }}
      >
        <ToggleButton value="system" aria-label="System">
          <DesktopIcon />
        </ToggleButton>
        <ToggleButton value="light" aria-label="Light">
          <SunIcon />
        </ToggleButton>
        <ToggleButton value="dark" aria-label="Dark">
          <MoonIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}

ThemeRow.displayName = 'ThemeRow';

/**
 * The account menu: the user, then account, help and theme in groups
 * divided by rules, and Sign out last in the `error` tone.
 */
function AccountMenu({
  anchorEl,
  onClose,
}: {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      // Right-aligned under the avatar, so it opens into the page rather
      // than off its edge.
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      // The header is not an option, so focus starts on the list rather
      // than being handed to it.
      variant="menu"
      sx={{
        '& .MuiMenu-paper': {
          width: ACCOUNT_MENU_WIDTH_PX,
          mt: ACCOUNT_MENU_OFFSET,
        },
      }}
    >
      <AccountHeader />
      <Divider />
      <MenuItem onClick={onClose}>
        <GearSixIcon size={16} />
        Settings
      </MenuItem>
      <MenuItem onClick={onClose}>
        <CreditCardIcon size={16} />
        Billings
      </MenuItem>
      <MenuItem onClick={onClose}>
        <ChartBarIcon size={16} />
        Reporting
      </MenuItem>
      <Divider />
      <MenuItem onClick={onClose}>
        <QuestionIcon size={16} />
        Help
      </MenuItem>
      <MenuItem onClick={onClose}>
        <BookOpenIcon size={16} />
        Documentation
      </MenuItem>
      <MenuItem onClick={onClose}>
        <BugIcon size={16} />
        Report an issue
      </MenuItem>
      <Divider />
      <ThemeRow />
      <Divider />
      <MenuItem variant="error" onClick={onClose}>
        <SignOutIcon size={16} />
        Sign out
      </MenuItem>
    </Menu>
  );
}

AccountMenu.displayName = 'AccountMenu';

export function AppTopBar({
  title,
  toggleProps,
}: {
  /** The page you are on, after the toggle. */
  title: string;
  /** The sidebar toggle's name, press and hover, from `useSidebarToggle`. */
  toggleProps: SidebarToggleProps;
}) {
  const [accountAnchor, setAccountAnchor] =
    React.useState<HTMLElement | null>(null);

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

        <IconButton
          variant="secondary"
          appearance="text"
          size="sm"
          aria-label="Account"
          aria-haspopup="menu"
          aria-expanded={Boolean(accountAnchor)}
          onClick={(event) => setAccountAnchor(event.currentTarget)}
        >
          <Avatar size="sm" color="error">
            {USER.initials}
          </Avatar>
        </IconButton>
      </Stack>

      <AccountMenu
        anchorEl={accountAnchor}
        onClose={() => setAccountAnchor(null)}
      />
    </Navbar>
  );
}

AppTopBar.displayName = 'AppTopBar';
