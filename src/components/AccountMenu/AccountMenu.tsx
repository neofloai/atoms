'use client';

import * as React from 'react';
import { menuClasses } from '@mui/material';

import { SignOutIcon } from '@/src/icons/glyphs';

import { Avatar } from '../Avatar';
import { Divider } from '../Divider';
import { IconButton } from '../IconButton';
import { Menu } from '../Menu';
import { MenuItem } from '../MenuItem';
import { AccountHeader, ThemeRow, initialsOf } from './AccountMenuParts';

import type { AccountMenuLabels, AccountMenuProps } from './AccountMenu.types';

/** The panel's width, as the account sheet draws it. */
const PANEL_WIDTH_PX = 240;

/** Space between the trigger and the panel under it — `Scale/250`. */
const PANEL_OFFSET = 1.5;

/** A row's glyph, as every menu draws it. */
const ROW_GLYPH_PX = 16;

const DEFAULT_LABELS: AccountMenuLabels = {
  trigger: 'Account',
  theme: 'Theme',
  system: 'System',
  light: 'Light',
  dark: 'Dark',
  signOut: 'Sign out',
};

/**
 * The account menu: the signed-in user's avatar at the trailing edge of
 * the app bar, and the dropdown it opens.
 *
 * The panel is the user — avatar, name, address and role — then the rows
 * you pass as `children`, the System / Light / Dark theme switch on a row
 * of its own, and Sign out last in the `error` tone, each group behind a
 * rule. It is 240px wide and opens right-aligned under the avatar, so it
 * drops into the page rather than off its edge.
 *
 * It renders its own trigger and holds its own open state, so it is one
 * element in the `Navbar`'s row. Choosing any row closes it; the rows'
 * `onClick` only does the row's own work.
 *
 * @example In the app bar
 * <Navbar>
 *   <Box sx={{ flex: 1 }} />
 *   <AccountMenu
 *     user={{ name: 'John Doe', email: 'john.doe@neo.com', role: 'Tenant Owner' }}
 *     onSignOut={signOut}
 *   >
 *     <MenuItem onClick={() => navigate('/settings')}>
 *       <GearSixIcon size={16} />
 *       Settings
 *     </MenuItem>
 *     <Divider />
 *     <MenuItem onClick={openHelp}>
 *       <QuestionIcon size={16} />
 *       Help
 *     </MenuItem>
 *   </AccountMenu>
 * </Navbar>
 *
 * @see Related: Navbar, WorkspaceSwitcher, Menu
 */
export const AccountMenu = React.forwardRef<HTMLButtonElement, AccountMenuProps>(
  function AccountMenu(
    {
      user,
      children,
      onSignOut,
      showThemeSwitch = true,
      avatarColor = 'error',
      labels: labelsProp,
    },
    ref
  ) {
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const menuId = React.useId();
    const isOpen = Boolean(anchorEl);
    const labels = { ...DEFAULT_LABELS, ...labelsProp };
    const initials = user.initials ?? initialsOf(user.name);

    const close = (): void => setAnchorEl(null);

    // A chosen row closes the panel. MUI fires no `onClose` for a choice,
    // and the rows are the caller's, so the list listens instead: a click
    // that lands in an enabled `menuitem` is a choice. Keyboard choices
    // arrive here too, because `ButtonBase` turns Enter and Space into a
    // real click. The theme switch's buttons are not menu items, so the
    // panel stays open while the scheme changes under it.
    const handleListClick = (event: React.MouseEvent<HTMLElement>): void => {
      const row = (event.target as Element).closest('[role="menuitem"]');
      if (row && row.getAttribute('aria-disabled') !== 'true') close();
    };

    const rows = React.Children.toArray(children);
    const sections: React.ReactNode[][] = [
      [<AccountHeader key="header" user={user} initials={initials} avatarColor={avatarColor} />],
    ];
    if (rows.length > 0) sections.push(rows);
    if (showThemeSwitch) sections.push([<ThemeRow key="theme" labels={labels} />]);
    if (onSignOut) {
      sections.push([
        <MenuItem key="sign-out" variant="error" onClick={onSignOut}>
          <SignOutIcon size={ROW_GLYPH_PX} />
          {labels.signOut}
        </MenuItem>,
      ]);
    }

    // A flat list rather than fragments: `Menu` reads its options as its
    // direct children, and warns on a Fragment.
    const panel = sections.flatMap((section, index) =>
      index === 0 ? section : [<Divider key={`rule-${index}`} />, ...section]
    );

    return (
      <>
        <IconButton
          ref={ref}
          variant="secondary"
          appearance="text"
          size="sm"
          aria-label={labels.trigger}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-controls={isOpen ? menuId : undefined}
          onClick={(event) => setAnchorEl(event.currentTarget)}
        >
          <Avatar size="sm" color={avatarColor} src={user.avatarSrc} alt={user.name}>
            {initials}
          </Avatar>
        </IconButton>

        <Menu
          id={menuId}
          anchorEl={anchorEl}
          open={isOpen}
          onClose={close}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          // The header is not an option, so focus starts on the list
          // rather than being handed to it.
          variant="menu"
          slotProps={{ list: { onClick: handleListClick } }}
          sx={{
            [`& .${menuClasses.paper}`]: {
              width: PANEL_WIDTH_PX,
              mt: PANEL_OFFSET,
            },
          }}
        >
          {panel}
        </Menu>
      </>
    );
  }
);

AccountMenu.displayName = 'AccountMenu';
