'use client';

import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import { useColorScheme } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';

type Mode = 'system' | 'light' | 'dark';

interface ModeOption {
  readonly value: Mode;
  readonly label: string;
  readonly Icon: React.ComponentType<{ fontSize?: 'inherit' | 'small' | 'medium' | 'large' }>;
}

const modeOptions: readonly ModeOption[] = [
  { value: 'system', label: 'System', Icon: SettingsBrightnessIcon },
  { value: 'light', label: 'Light', Icon: LightModeIcon },
  { value: 'dark', label: 'Dark', Icon: DarkModeIcon },
];

/**
 * Color-scheme selector for the docs top bar.
 *
 * Uses MUI's `useColorScheme` to read/write the active mode (persisted
 * to `localStorage` by the theme provider). The hook returns `mode` as
 * `undefined` on the first server render — we render a placeholder
 * button in that case to keep the markup identical to the eventual
 * client-rendered output and avoid hydration mismatches.
 *
 * The chevron icon reflects the currently active mode (sun / moon /
 * monitor); clicking opens a small menu to pick `system`, `light`, or
 * `dark`.
 */
export function ColorModeToggle() {
  const { mode, setMode } = useColorScheme();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const isOpen = Boolean(anchorEl);

  function handleOpen(event: React.MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  function handleSelect(next: Mode) {
    setMode(next);
    setAnchorEl(null);
  }

  if (!mode) {
    return (
      <IconButton
        aria-label="Toggle color scheme"
        size="small"
        disabled
        sx={{ visibility: 'hidden' }}
      >
        <SettingsBrightnessIcon fontSize="small" />
      </IconButton>
    );
  }

  const CurrentIcon =
    modeOptions.find((option) => option.value === mode)?.Icon ??
    SettingsBrightnessIcon;

  return (
    <>
      <Tooltip title="Color scheme">
        <IconButton
          aria-label="Toggle color scheme"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          size="small"
          onClick={handleOpen}
        >
          <CurrentIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            elevation: 4,
            sx: { mt: 0.75, minWidth: 160 },
          },
        }}
      >
        {modeOptions.map(({ value, label, Icon }) => {
          const selected = mode === value;
          return (
            <MenuItem
              key={value}
              onClick={() => handleSelect(value)}
              selected={selected}
              dense
            >
              <ListItemIcon>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={label} />
              {selected && <CheckIcon fontSize="small" sx={{ ml: 1, opacity: 0.7 }} />}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}

ColorModeToggle.displayName = 'ColorModeToggle';
