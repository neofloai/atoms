'use client';

import * as React from 'react';
import { Box, Stack, Typography } from '@mui/material';

import { fontWeights, text } from '@/src/tokens';
import { useColorScheme } from '@/src/theme/useColorScheme';
import { DesktopIcon, MoonIcon, SunIcon } from '@/src/icons/glyphs';

import { Avatar } from '../Avatar';
import { Tag } from '../Tag';
import { ToggleButton, ToggleButtonGroup } from '../ToggleButton';
import { paired } from '../_shared/actionStyles';

import type { AvatarColor } from '../Avatar';
import type { AccountMenuLabels, AccountMenuUser } from './AccountMenu.types';

/** The scheme the switch can pick. `system` follows the operating system. */
type SchemeChoice = 'system' | 'light' | 'dark';

/**
 * The signed-in user, heading the panel.
 *
 * Not a menu row: there is nothing to pick, so it is a plain block rather
 * than a `MenuItem` and the list's arrow keys pass over it. A 36px avatar
 * beside the name in `Sans/B1/Medium`, the address under it in
 * `Sans/B2/Medium` caption ink (`text/default/b3`), and the role as the
 * grey metadata `Tag` — the account sheet's header, 8px in and 12px down
 * so the name lines up with the row labels below it (4564:6122).
 */
export function AccountHeader({
  user,
  initials,
  avatarColor,
}: {
  user: AccountMenuUser;
  initials: string;
  avatarColor: AvatarColor;
}): React.ReactElement {
  return (
    <Box sx={{ display: 'flex', gap: 1.5, px: 1, py: 1.5 }}>
      <Avatar size="md" color={avatarColor} src={user.avatarSrc} alt={user.name}>
        {initials}
      </Avatar>
      <Stack sx={{ gap: 1, minWidth: 0, alignItems: 'flex-start' }}>
        <Stack sx={{ gap: 0.25, minWidth: 0, maxWidth: '100%' }}>
          <Typography
            variant="body1"
            noWrap
            sx={(theme) => ({
              fontWeight: fontWeights.medium,
              ...paired(theme, { color: text.default.b1 }),
            })}
          >
            {user.name}
          </Typography>
          {user.email && (
            <Typography
              variant="body2"
              noWrap
              sx={(theme) => ({
                fontWeight: fontWeights.medium,
                ...paired(theme, { color: text.default.b3 }),
              })}
            >
              {user.email}
            </Typography>
          )}
        </Stack>
        {user.role && <Tag variant="secondary" label={user.role} />}
      </Stack>
    </Box>
  );
}

AccountHeader.displayName = 'AccountHeader';

/**
 * The theme switch — system, light, dark — on a row of its own.
 *
 * Wired to the provider's colour scheme, so it changes the app it sits
 * in and needs no prop. It is the house segmented control unmodified: a
 * grey track, 24px buttons, the selected one raised on the page surface.
 * The buttons are not menu rows, so pressing one leaves the menu open and
 * the change can be seen happen.
 *
 * `mode` is `undefined` on the first render, before the provider has read
 * the stored scheme; the switch shows `system` until it knows.
 */
export function ThemeRow({
  labels,
}: {
  labels: AccountMenuLabels;
}): React.ReactElement {
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
        ...paired(theme, { color: text.default.b1 }),
      })}
    >
      {labels.theme}
      <ToggleButtonGroup
        appearance="segmented"
        exclusive
        aria-label={labels.theme}
        value={mode ?? 'system'}
        onChange={(_, next: SchemeChoice | null) => {
          if (next) setMode(next);
        }}
      >
        <ToggleButton value="system" aria-label={labels.system}>
          <DesktopIcon />
        </ToggleButton>
        <ToggleButton value="light" aria-label={labels.light}>
          <SunIcon />
        </ToggleButton>
        <ToggleButton value="dark" aria-label={labels.dark}>
          <MoonIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}

ThemeRow.displayName = 'ThemeRow';

/**
 * Two letters for an avatar: the first letter of the first and last words.
 * A one-word name gives one letter.
 */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  const first = Array.from(words[0])[0] ?? '';
  const last = words.length > 1 ? (Array.from(words[words.length - 1])[0] ?? '') : '';
  return `${first}${last}`.toUpperCase();
}
