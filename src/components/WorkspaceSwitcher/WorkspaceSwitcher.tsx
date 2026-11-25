'use client';

import * as React from 'react';
import { Box, ButtonBase, menuClasses } from '@mui/material';
import { useControlled } from '@mui/material/utils';

import {
  border,
  fontFamilies,
  fontWeights,
  icon,
  radius,
  surface,
  text,
  typography,
} from '@/src/tokens';
import { CaretUpDownIcon, CheckCircleIcon, PlusIcon } from '@/src/icons/glyphs';

import { Avatar } from '../Avatar';
import { Divider } from '../Divider';
import { ListSubheader } from '../List';
import { Menu } from '../Menu';
import { MenuItem } from '../MenuItem';
import { Tooltip } from '../Tooltip';
import { paired } from '../_shared/actionStyles';

import type {
  WorkspaceOption,
  WorkspaceSwitcherLabels,
  WorkspaceSwitcherProps,
} from './WorkspaceSwitcher.types';

/**
 * The trigger: a 40px row (8 + 24px avatar + 8) inside a 4px inline and
 * 8px block inset, which puts the avatar 12px from the rail's edge — on
 * the nav rows' glyph line — and the block at 56px, the footprint of the
 * side nav's resting footer (4564:6206).
 */
const ROW_PX = 40;
const ROW_INSET_PX = 8;
const BLOCK_INSET_INLINE_PX = 4;
const BLOCK_INSET_BLOCK_PX = 8;

/** Between the avatar, the name and the caret — the nav rows' glyph gap. */
const ROW_GAP_PX = 12;

/** The caret and the current workspace's check. */
const GLYPH_PX = 16;

/** The panel's width, and its clearance from the trigger — `Scale/200` (4564:6288). */
const PANEL_WIDTH_PX = 240;
const PANEL_OFFSET_PX = 8;

const DEFAULT_LABELS: WorkspaceSwitcherLabels = {
  heading: 'Workspaces',
  create: 'Create workspace',
};

/** The square avatar's letters, when a workspace does not name its own. */
function initialsOf(space: WorkspaceOption): string {
  if (space.initials) return space.initials;
  const words = space.name.trim().split(/\s+/).filter(Boolean);
  const letters =
    words.length > 1
      ? words.slice(0, 2).map((word) => Array.from(word)[0] ?? '')
      : Array.from(words[0] ?? '').slice(0, 2);
  return letters.join('').toUpperCase();
}

/**
 * The workspace switcher at the foot of the sidebar, and the menu it
 * opens upwards.
 *
 * The trigger is the current workspace — its square avatar, its name, and
 * an up-down caret saying a list opens from it. The menu stands 8px clear
 * of it: a `Workspaces` label, a row per workspace with the current one
 * filled and checked in the success tone, and Create workspace behind a
 * rule when `onCreate` is given.
 *
 * It is the rail's footer as well as its control: it draws the rule above
 * itself and the inset around it, so it goes last in a `Drawer`, after a
 * nav that takes the slack (`flex: 1`) and pins it to the bottom edge.
 * Folded, pass `collapsed` and the trigger is the avatar alone, with the
 * name in a tooltip.
 *
 * Controlled with `value` and `onChange`, or left to hold its own state
 * from `defaultValue` (the first workspace when that is omitted too).
 *
 * @example At the foot of the rail
 * <Drawer variant="permanent" size="sm">
 *   <List variant="nav" component="nav" sx={{ flex: 1, p: 1.5 }}>…</List>
 *   <WorkspaceSwitcher
 *     workspaces={[
 *       { id: 'finance', name: 'Finance', color: 'primary' },
 *       { id: 'procurement', name: 'Procurement', color: 'success' },
 *     ]}
 *     value={workspaceId}
 *     onChange={setWorkspaceId}
 *     onCreate={openCreateWorkspace}
 *   />
 * </Drawer>
 *
 * @see Related: Drawer, List, AccountMenu, Menu
 */
export const WorkspaceSwitcher = React.forwardRef<HTMLDivElement, WorkspaceSwitcherProps>(
  function WorkspaceSwitcher(
    {
      workspaces,
      value: valueProp,
      defaultValue,
      onChange,
      onCreate,
      collapsed = false,
      labels: labelsProp,
    },
    ref
  ) {
    const [value, setValue] = useControlled<string | undefined>({
      controlled: valueProp,
      default: defaultValue ?? workspaces[0]?.id,
      name: 'WorkspaceSwitcher',
      state: 'value',
    });
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const menuId = React.useId();
    const isOpen = Boolean(anchorEl);
    const labels = { ...DEFAULT_LABELS, ...labelsProp };
    const current = workspaces.find((space) => space.id === value) ?? workspaces[0];

    const close = (): void => setAnchorEl(null);

    const choose = (id: string): void => {
      close();
      if (id === value) return;
      setValue(id);
      onChange?.(id);
    };

    if (!current) return null;

    const trigger = (
      <ButtonBase
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        aria-label={collapsed ? current.name : undefined}
        sx={(theme) => ({
          fontFamily: fontFamilies.product.sans,
          fontSize: typography.body.b1.size,
          lineHeight: `${typography.body.b1.leading}px`,
          letterSpacing: `${typography.body.b1.letterSpacing}em`,
          fontWeight: fontWeights.medium,
          width: collapsed ? ROW_PX : '100%',
          height: ROW_PX,
          p: collapsed ? 0 : `${ROW_INSET_PX}px`,
          gap: `${ROW_GAP_PX}px`,
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderRadius: `${radius.xs}px`,
          whiteSpace: 'nowrap',
          ...paired(theme, { color: text.default.b1 }),
          '&:hover, &.Mui-focusVisible, &[aria-expanded="true"]': paired(theme, {
            backgroundColor: surface.layers.card3,
          }),
        })}
      >
        <Avatar size="sm" shape="mid" color={current.color ?? 'primary'} sx={{ flexShrink: 0 }}>
          {initialsOf(current)}
        </Avatar>
        {!collapsed && (
          <>
            <Box
              component="span"
              sx={{
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textAlign: 'left',
              }}
            >
              {current.name}
            </Box>
            <Box
              component="span"
              sx={(theme) => ({
                display: 'flex',
                flexShrink: 0,
                ...paired(theme, { color: icon.default.b3 }),
              })}
            >
              <CaretUpDownIcon size={GLYPH_PX} />
            </Box>
          </>
        )}
      </ButtonBase>
    );

    return (
      <Box
        ref={ref}
        sx={(theme) => ({
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'center',
          px: collapsed ? 0 : `${BLOCK_INSET_INLINE_PX}px`,
          py: `${BLOCK_INSET_BLOCK_PX}px`,
          borderTop: '1px solid',
          // `card 3`'s edge: a rung darker than the rail's own `card 2`
          // edge in dark mode, so the rule reads there.
          ...paired(theme, { borderColor: border.layers.card3 }),
        })}
      >
        {collapsed ? (
          <Tooltip title={current.name} placement="right">
            {trigger}
          </Tooltip>
        ) : (
          trigger
        )}

        <Menu
          id={menuId}
          anchorEl={anchorEl}
          open={isOpen}
          onClose={close}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          sx={{
            [`& .${menuClasses.paper}`]: {
              width: PANEL_WIDTH_PX,
              mt: `-${PANEL_OFFSET_PX}px`,
              ml: `${PANEL_OFFSET_PX}px`,
            },
          }}
        >
          <ListSubheader>{labels.heading}</ListSubheader>
          {workspaces.map((space) => {
            const isCurrent = space.id === current.id;
            return (
              <MenuItem key={space.id} selected={isCurrent} onClick={() => choose(space.id)}>
                <Avatar size="sm" shape="mid" color={space.color ?? 'primary'}>
                  {initialsOf(space)}
                </Avatar>
                <Box component="span" sx={{ flex: 1, minWidth: 0 }}>
                  {space.name}
                </Box>
                {isCurrent && (
                  <Box
                    component="span"
                    sx={(theme) => ({
                      display: 'flex',
                      ...paired(theme, { color: icon.success[4] }),
                    })}
                  >
                    <CheckCircleIcon size={GLYPH_PX} />
                  </Box>
                )}
              </MenuItem>
            );
          })}
          {onCreate && <Divider />}
          {onCreate && (
            <MenuItem
              onClick={() => {
                close();
                onCreate();
              }}
            >
              <PlusIcon size={GLYPH_PX} />
              {labels.create}
            </MenuItem>
          )}
        </Menu>
      </Box>
    );
  }
);

WorkspaceSwitcher.displayName = 'WorkspaceSwitcher';
