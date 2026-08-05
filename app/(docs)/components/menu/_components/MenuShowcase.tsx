'use client';

import * as React from 'react';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Button } from '@/src/components/Button';
import { Menu } from '@/src/components/Menu';
import { MenuItem } from '@/src/components/MenuItem';
import {
  ArrowSquareOut,
  Copy,
  FolderPlus,
  PencilSimple,
  ShareNetwork,
  Trash,
} from '@/src/icons';

import type { MenuProps } from '@/src/components/Menu';

/**
 * Live previews for the Menu page.
 *
 * Every preview is a real, openable menu. Nothing here re-draws the
 * panel or an item out of tokens: a static swatch sheet would mean
 * duplicating the component's own styling, which is exactly how a docs
 * page drifts from the thing it documents. The trade-off is that the
 * hover and keyboard-focus tints only appear when you interact — which
 * is also the only honest way to show a state that has no prop.
 *
 * Previews import from `@/src/components/*`, so the page exercises the
 * same export path a consumer of `@neoflo/atoms` would take.
 */

function PreviewCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      {hint && (
        <Typography variant="body2" color="text.secondary">
          {hint}
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
 * A trigger button paired with a menu, wired the way the docs tell you
 * to wire one: the anchor element is the single piece of state, `open`
 * is derived from it, and the trigger carries the ARIA that tells a
 * screen reader it opens a menu.
 */
function MenuDemo({
  trigger,
  menuProps,
  children,
}: {
  trigger: string;
  menuProps?: Partial<MenuProps>;
  children: (close: () => void) => React.ReactNode;
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const close = () => setAnchorEl(null);
  const id = React.useId();

  return (
    <>
      <Button
        variant="secondary"
        appearance="outline"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
      >
        {trigger}
      </Button>
      <Menu
        id={id}
        anchorEl={anchorEl}
        open={open}
        onClose={close}
        {...menuProps}
      >
        {children(close)}
      </Menu>
    </>
  );
}

MenuDemo.displayName = 'MenuDemo';

const SORT_OPTIONS = ['Name', 'Date modified', 'Size'];

const LINE_HEIGHTS = ['Single', '1.15', 'Double', 'Custom: 1.2'];

const TIMEZONES = [
  'Pacific/Auckland',
  'Asia/Tokyo',
  'Asia/Kolkata',
  'Europe/Berlin',
  'Europe/London',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
];

export function MenuShowcase() {
  const [sort, setSort] = React.useState('Name');

  return (
    <Stack spacing={4}>
      <PreviewCard
        title="Tones and states"
        hint="Every variant from the Figma sheet in one panel. Hover a row, or open the menu and use the arrow keys — hover and keyboard focus share one tint."
      >
        <MenuDemo trigger="Open menu">
          {(close) => [
            <MenuItem key="rename" onClick={close}>
              Rename
            </MenuItem>,
            <MenuItem key="current" selected onClick={close}>
              Selected row
            </MenuItem>,
            <MenuItem key="meta" variant="secondary" onClick={close}>
              Secondary row
            </MenuItem>,
            <MenuItem key="disabled" disabled>
              Disabled row
            </MenuItem>,
            <MenuItem key="new" variant="action" onClick={close}>
              Action row
            </MenuItem>,
          ]}
        </MenuDemo>
      </PreviewCard>

      <PreviewCard
        title="Icons"
        hint="Glyphs are 16px and take the row's own colour, so the action row tints its icon and label together."
      >
        <MenuDemo trigger="Document">
          {(close) => [
            <MenuItem key="rename" onClick={close}>
              <PencilSimple size={16} />
              Rename
            </MenuItem>,
            <MenuItem key="duplicate" onClick={close}>
              <Copy size={16} />
              Duplicate
            </MenuItem>,
            <MenuItem key="share" onClick={close}>
              <ShareNetwork size={16} />
              Share
            </MenuItem>,
            <MenuItem key="new" variant="action" onClick={close}>
              <FolderPlus size={16} />
              New folder
            </MenuItem>,
          ]}
        </MenuDemo>
      </PreviewCard>

      <PreviewCard
        title="Selected item"
        hint={`Marks the current choice and takes initial focus on open. Sorting by: ${sort}.`}
      >
        <MenuDemo trigger={`Sort: ${sort}`}>
          {(close) =>
            SORT_OPTIONS.map((option) => (
              <MenuItem
                key={option}
                selected={option === sort}
                onClick={() => {
                  setSort(option);
                  close();
                }}
              >
                {option}
              </MenuItem>
            ))
          }
        </MenuDemo>
      </PreviewCard>

      <PreviewCard
        title="Sections, dividers, and MUI list composition"
        hint="A Divider takes the panel's own border token. ListItemIcon and ListItemText work unchanged — the 36px column MUI reserves is collapsed to the design's 4px gap."
      >
        <MenuDemo trigger="More actions">
          {(close) => [
            <MenuItem key="duplicate" onClick={close}>
              <ListItemIcon>
                <Copy size={16} />
              </ListItemIcon>
              <ListItemText>Duplicate</ListItemText>
              <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                ⌘D
              </Typography>
            </MenuItem>,
            <MenuItem key="open" component="a" href="/tokens">
              <ListItemIcon>
                <ArrowSquareOut size={16} />
              </ListItemIcon>
              <ListItemText>Open tokens page</ListItemText>
            </MenuItem>,
            <Divider key="rule" />,
            <MenuItem key="meta" variant="secondary" disabled>
              Edited 2 days ago
            </MenuItem>,
            <MenuItem key="delete" onClick={close}>
              <ListItemIcon>
                <Trash size={16} />
              </ListItemIcon>
              <ListItemText>Move to trash</ListItemText>
            </MenuItem>,
          ]}
        </MenuDemo>
      </PreviewCard>

      <PreviewCard
        title="Positioning"
        hint="Inherited from Popover. Pairing anchorOrigin with transformOrigin right-aligns the panel under its trigger — the usual fix near the right edge of a toolbar."
      >
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
          <MenuDemo
            trigger="Right-aligned"
            menuProps={{
              anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
              transformOrigin: { vertical: 'top', horizontal: 'right' },
            }}
          >
            {(close) => [
              <MenuItem key="profile" onClick={close}>
                Profile
              </MenuItem>,
              <MenuItem key="settings" onClick={close}>
                Settings
              </MenuItem>,
              <MenuItem key="signout" variant="secondary" onClick={close}>
                Sign out
              </MenuItem>,
            ]}
          </MenuDemo>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Dense list"
        hint="MUI's density knob, not a Neoflo variant — the design specifies one density, so this changes the type only: B2 labels on 32px rows, holding the 8px inset. Set once on the list rather than on every item."
      >
        <MenuDemo trigger="Line spacing" menuProps={{ slotProps: { list: { dense: true } } }}>
          {(close) =>
            LINE_HEIGHTS.map((value) => (
              <MenuItem key={value} onClick={close}>
                {value}
              </MenuItem>
            ))
          }
        </MenuDemo>
      </PreviewCard>

      <PreviewCard
        title="Scrolling and width"
        hint="A panel taller than its cap scrolls internally. Both the cap and a width go on the panel, through a descendant selector."
      >
        <MenuDemo
          trigger="Timezone"
          menuProps={{
            sx: { '& .MuiMenu-paper': { maxHeight: 200, minWidth: 220 } },
          }}
        >
          {(close) =>
            TIMEZONES.map((zone) => (
              <MenuItem key={zone} onClick={close}>
                {zone}
              </MenuItem>
            ))
          }
        </MenuDemo>
      </PreviewCard>

      <PreviewCard
        title="Long labels wrap"
        hint="The design gives the label word-break: break-word over a zero min-width, so a long label wraps inside the panel instead of widening it. MUI's default is nowrap."
      >
        <MenuDemo
          trigger="Move to"
          menuProps={{ sx: { '& .MuiMenu-paper': { maxWidth: 220 } } }}
        >
          {(close) => [
            <MenuItem key="share" onClick={close}>
              Share
            </MenuItem>,
            <MenuItem key="move" onClick={close}>
              Move to a different workspace folder
            </MenuItem>,
          ]}
        </MenuDemo>
      </PreviewCard>
    </Stack>
  );
}

MenuShowcase.displayName = 'MenuShowcase';
