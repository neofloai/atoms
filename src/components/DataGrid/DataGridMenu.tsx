'use client';

import * as React from 'react';
import {
  gridSortModelSelector,
  useGridApiContext,
  useGridRootProps,
  useGridSelector,
} from '@mui/x-data-grid';

import { ArrowDownIcon, ArrowUpIcon, XIcon } from '@/src/icons/glyphs';

import { MenuItem } from '../MenuItem';
import { TABLE_SORT_ICON_PX } from '../Table/tableTokens';

import type {
  GridColumnMenuItemProps,
  GridSortDirection,
} from '@mui/x-data-grid';

/**
 * The props MUI X's own menu items are written against, which the house
 * `MenuItem` does not have: a leading and trailing slot, and `inert` for
 * a row that is a label rather than a command.
 */
interface BaseMenuItemProps extends React.ComponentProps<typeof MenuItem> {
  iconStart?: React.ReactNode;
  iconEnd?: React.ReactNode;
  inert?: boolean;
}

/**
 * The grid's `baseMenuItem`, mapped onto the house one.
 *
 * MUI X's own version wraps its label in a `ListItemText` and its icons
 * in a `ListItemIcon`, which brings MUI's 36px icon column and 6px
 * paddings with it. The house `MenuItem` already handles a bare glyph
 * child and a `ListItemIcon` identically — both land on the same 4px gap
 * — so the icons are passed straight through as children and the design's
 * `menu-item` (3204:121756) is what renders.
 *
 * Only the props MUI X actually sends are translated. `inert` becomes
 * `disableRipple`, which is what it means there.
 */
export function DataGridMenuItem({
  iconStart,
  iconEnd,
  inert,
  children,
  ...rest
}: BaseMenuItemProps): React.JSX.Element {
  return (
    <MenuItem {...rest} disableRipple={inert || rest.disableRipple}>
      {iconStart}
      {children}
      {iconEnd}
    </MenuItem>
  );
}

DataGridMenuItem.displayName = 'DataGridMenuItem';

/**
 * The sort block of a column's menu: both directions and a clear, always
 * all three.
 *
 * MUI X's own sort item shows only the moves that are *available* — the
 * ascending row disappears once a column is sorted ascending, and the
 * clear row does not exist until there is something to clear — so the
 * menu is two items tall, then three, then two. Figma draws it three
 * tall in every state, with `Clear sort` greyed rather than gone
 * (`table-sort/num`, `/name`, `/date`), and a menu that keeps its height
 * is a menu whose rows stay where the pointer left them.
 *
 * The wording comes from `localeText`, keyed to the column's own type, so
 * a number column offers "Low to high" and a date column "Old to new" —
 * see `DataGrid.tsx`. Clicking the direction a column is already sorted
 * by is a no-op rather than a toggle: this is an explicit menu, and a row
 * labelled "A to Z" should not un-sort the column.
 *
 * The active direction is marked `selected`, which the design does not
 * draw — all three of its menus are captured unsorted, so there was
 * nothing to copy. See DESIGNER_QUESTIONS.md #49.
 */
export function DataGridSortMenuItem(
  props: GridColumnMenuItemProps
): React.JSX.Element | null {
  const { colDef, onClick } = props;
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();
  const sortModel = useGridSelector(apiRef, gridSortModelSelector);

  const sortBy = React.useCallback(
    (next: GridSortDirection, event: React.MouseEvent<HTMLLIElement>) => {
      onClick(event);
      apiRef.current.sortColumn(colDef.field, next);
    },
    [apiRef, colDef.field, onClick]
  );

  const direction =
    sortModel.find((item) => item.field === colDef.field)?.sort ?? null;

  if (!colDef.sortable) {
    return null;
  }

  // Read from the grid's merged `localeText` rather than through
  // `getLocaleText`, which lives behind the api ref: the wording is needed
  // while rendering, and a ref is not a render-time source of truth.
  // `columnMenuSortAsc` and `columnMenuSortDesc` may be a function of the
  // column, which is how one label reads differently per column type.
  const label = (
    key: 'columnMenuSortAsc' | 'columnMenuSortDesc' | 'columnMenuUnsort'
  ): React.ReactNode => {
    const value = rootProps.localeText[key];
    return typeof value === 'function' ? value(colDef) : value;
  };

  return (
    <React.Fragment>
      <MenuItem
        selected={direction === 'asc'}
        onClick={(event) => sortBy('asc', event)}
      >
        <ArrowUpIcon size={TABLE_SORT_ICON_PX} />
        {label('columnMenuSortAsc')}
      </MenuItem>
      <MenuItem
        selected={direction === 'desc'}
        onClick={(event) => sortBy('desc', event)}
      >
        <ArrowDownIcon size={TABLE_SORT_ICON_PX} />
        {label('columnMenuSortDesc')}
      </MenuItem>
      <MenuItem
        disabled={direction === null}
        onClick={(event) => sortBy(null, event)}
      >
        <XIcon size={TABLE_SORT_ICON_PX} />
        {label('columnMenuUnsort')}
      </MenuItem>
    </React.Fragment>
  );
}

DataGridSortMenuItem.displayName = 'DataGridSortMenuItem';
