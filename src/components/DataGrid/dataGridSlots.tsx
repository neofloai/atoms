'use client';

import * as React from 'react';
import { styled } from '@mui/material/styles';

import { surface } from '@/src/tokens';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowsDownUpIcon,
  ColumnsIcon,
  DotsThreeVerticalIcon,
  EyeSlashIcon,
  FunnelIcon,
} from '@/src/icons/glyphs';

import { paired } from '../_shared/actionStyles';
import { Checkbox } from '../Checkbox';
import { TABLE_SORT_ICON_PX } from '../Table/tableTokens';
import { Tooltip } from '../Tooltip';
import { DataGridMenuItem, DataGridSortMenuItem } from './DataGridMenu';
import { DataGridPagination } from './DataGridPagination';
import {
  DATA_GRID_SKELETON_BAR_HEIGHT_PX,
  DATA_GRID_SKELETON_BAR_RADIUS_PX,
} from './dataGridTokens';

import type { Icon } from '@/src/icons/glyphs';
import type { CheckboxProps } from '../Checkbox';
import type { TooltipProps } from '../Tooltip';

/**
 * The parts of MUI X's grid this component swaps out, and the small
 * adapters that make house components fit its slots.
 *
 * A slot is a component the grid instantiates itself, which is what makes
 * it the right seam: replacing `pagination` replaces the footer wherever
 * the grid decides to render one, without the wrapper having to know
 * where that is.
 */

/**
 * A grid glyph: the design's 16px Phosphor icon, and nothing else.
 *
 * The wrapper is not decoration. MUI X hands its sort icon a
 * `sortingOrder` array and a Material `fontSize="small"`, and a Phosphor
 * icon forwards every unrecognised prop to its `<svg>` — so the array
 * would be stringified into a `sortingorder` attribute and React would
 * warn about the casing. Taking only `className` drops both, and keeps
 * the class MUI needs for its own rules.
 */
function gridGlyph(
  Glyph: Icon,
  name: string
): (props: { className?: string }) => React.JSX.Element {
  function DataGridGlyph({
    className,
  }: {
    className?: string;
  }): React.JSX.Element {
    return <Glyph className={className} size={TABLE_SORT_ICON_PX} />;
  }

  DataGridGlyph.displayName = name;
  return DataGridGlyph;
}

/**
 * The bar a cell draws while its row is loading: one shape, at the
 * design's 20 × 4 in `surface.primary.subtle`.
 *
 * Deliberately takes no props. MUI's own skeleton cell asks for a
 * *random* width between 40% and 80% of the column, and a circular
 * placeholder for boolean and action columns — a lively effect, and not
 * the one drawn. Figma's loading table (3223:61894) is six rows of
 * identical bars filling every column, including the action column, so
 * the `variant`, `width` and `height` MUI sends are dropped.
 */
const SkeletonBar = styled('div')(({ theme }) => ({
  width: '100%',
  height: DATA_GRID_SKELETON_BAR_HEIGHT_PX,
  borderRadius: DATA_GRID_SKELETON_BAR_RADIUS_PX,
  ...paired(theme, { backgroundColor: surface.primary.subtle }),
}));

function DataGridSkeletonBar(): React.JSX.Element {
  return <SkeletonBar aria-hidden />;
}

DataGridSkeletonBar.displayName = 'DataGridSkeletonBar';

/**
 * MUI X's `baseCheckbox` props, which are not MUI Material's.
 *
 * Three of them exist only inside the grid: `material` is its escape
 * hatch for Material-specific props, `density` and `fullWidth` belong to
 * the columns-management panel's own layout, and its input attributes
 * arrive under `htmlInput` where Material calls the slot `input`.
 *
 * `size` is a fourth, and a name collision rather than an extra: the
 * grid speaks MUI's `small` / `medium`, the house checkbox speaks
 * `sm` / `md`. It is declared in the grid's own words below and dropped.
 */
interface DataGridCheckboxProps
  extends Omit<CheckboxProps, 'slotProps' | 'size'> {
  slotProps?: { htmlInput?: React.InputHTMLAttributes<HTMLInputElement> };
  material?: Omit<CheckboxProps, 'slotProps' | 'size'>;
  density?: 'compact' | 'standard';
  fullWidth?: boolean;
  size?: 'small' | 'medium';
}

/**
 * The house `Checkbox` in the grid's selection column.
 *
 * `label` passes straight through, because the house checkbox takes one —
 * which is what keeps the column names in the columns-management panel
 * from disappearing. `density`, `fullWidth` and the grid's own `size`
 * are dropped: a grid draws one checkbox, the 16px `md`, whose 32px
 * target is the header strip's height exactly.
 */
const DataGridCheckbox = React.forwardRef<
  HTMLButtonElement,
  DataGridCheckboxProps
>(function DataGridCheckbox(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- drop the panel-layout props and the grid's own size axis so none reach the DOM
  { slotProps, material, density, fullWidth, size, ...rest },
  ref
) {
  return (
    <Checkbox
      {...material}
      {...rest}
      ref={ref}
      slotProps={{ input: slotProps?.htmlInput }}
    />
  );
});

DataGridCheckbox.displayName = 'DataGridCheckbox';

/**
 * MUI X's `baseTooltip` props: MUI's own, plus its `material` escape
 * hatch. Its shape is a subset of the house tooltip's, so only `material`
 * needs unpacking — left on, it would reach the trigger element as an
 * unknown DOM attribute.
 */
interface DataGridTooltipProps extends TooltipProps {
  material?: Partial<TooltipProps>;
}

/**
 * The house `Tooltip` on the grid's own tooltips — the one over a sort
 * button, and the one a truncated header label shows.
 *
 * Without this the grid keeps MUI's default bubble: a dark grey pill with
 * no tip, against the design's own surface and arrow. It is the same
 * component the rest of a page uses, so a tooltip inside a grid stops
 * being a different tooltip.
 */
function DataGridTooltip({
  material,
  ...rest
}: DataGridTooltipProps): React.JSX.Element {
  return <Tooltip {...material} {...rest} />;
}

DataGridTooltip.displayName = 'DataGridTooltip';

/**
 * Every slot the wrapper replaces.
 *
 * The sort glyphs are the design's: a two-headed `ArrowsDownUp` for
 * "sortable, not sorted", which the grid shows on hover, and a single
 * arrow for the column actually sorted, which it shows at rest. That is
 * the same pair `TableSortLabel` draws, and the same reason
 * `IconComponent` comes off its props — MUI rotates one arrow through
 * 180° to mean both directions, and a two-headed glyph rotated is still
 * two-headed.
 *
 * The remaining icons are the ones reachable without a toolbar: the
 * column menu's trigger and its three item glyphs. The filter and
 * columns panels behind `showToolbar` keep MUI's Material icons — see
 * DESIGNER_QUESTIONS.md #49.
 */
export const DATA_GRID_SLOTS = {
  pagination: DataGridPagination,
  baseCheckbox: DataGridCheckbox,
  baseTooltip: DataGridTooltip,
  baseMenuItem: DataGridMenuItem,
  baseSkeleton: DataGridSkeletonBar,
  columnUnsortedIcon: gridGlyph(ArrowsDownUpIcon, 'DataGridUnsortedIcon'),
  columnSortedAscendingIcon: gridGlyph(ArrowUpIcon, 'DataGridAscendingIcon'),
  columnSortedDescendingIcon: gridGlyph(
    ArrowDownIcon,
    'DataGridDescendingIcon'
  ),
  columnMenuIcon: gridGlyph(DotsThreeVerticalIcon, 'DataGridMenuIcon'),
  columnMenuSortAscendingIcon: gridGlyph(ArrowUpIcon, 'DataGridAscendingIcon'),
  columnMenuSortDescendingIcon: gridGlyph(
    ArrowDownIcon,
    'DataGridDescendingIcon'
  ),
  columnMenuFilterIcon: gridGlyph(FunnelIcon, 'DataGridFilterIcon'),
  columnMenuHideIcon: gridGlyph(EyeSlashIcon, 'DataGridHideIcon'),
  columnMenuManageColumnsIcon: gridGlyph(ColumnsIcon, 'DataGridColumnsIcon'),
} as const;

/**
 * The column menu's own sort block, replaced so it keeps its three rows
 * in every state. Passed through `slotProps.columnMenu` rather than
 * `slots`, because the menu's items are the menu's slots rather than the
 * grid's.
 */
export const DATA_GRID_COLUMN_MENU_SLOTS = {
  columnMenuSortItem: DataGridSortMenuItem,
} as const;
