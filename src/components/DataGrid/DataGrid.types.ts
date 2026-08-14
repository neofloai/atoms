import type { SxProps, Theme } from '@mui/material/styles';
import type {
  DataGridProps as MuiDataGridProps,
  GridRowClassNameParams,
  GridValidRowModel,
} from '@mui/x-data-grid';

/**
 * `sx` on the popper a column menu opens in.
 *
 * MUI X types its base slots against its own minimal prop shapes rather
 * than against Material's components, so `basePopper` has no `sx` in the
 * types even though the Material adapter forwards every unrecognised prop
 * straight to Material's `Popper`, which has one. `*PropsOverrides` is the
 * extension point MUI X provides for precisely this, and the declaration
 * is additive: one optional prop that already works at runtime.
 *
 * It is how the menu panel gets the house surface — see
 * `dataGridMenuPanelStyles`. A portal renders outside the grid, so no
 * selector rooted at the grid can reach it.
 */
declare module '@mui/x-data-grid' {
  interface BasePopperPropsOverrides {
    sx?: SxProps<Theme>;
  }
}

/**
 * Row height, matching the table's `size` exactly: `sm` 48, `md` 56,
 * `lg` 64. The header strip stays 32 in all three.
 *
 * The same three values the Figma `Size` axis lists (3215:43435), and the
 * same prop name the table uses, so moving a screen from one to the other
 * does not change how dense it looks.
 */
export type DataGridSize = 'sm' | 'md' | 'lg';

/**
 * An outcome a row's own data carries, drawn by the Figma row set as
 * `State=error` / `State=success` / `State=disabled`.
 *
 * Not the same kind of thing as hover or selection, which are about the
 * reader rather than the record — those the grid already models itself.
 */
export type DataGridRowState = 'default' | 'error' | 'success' | 'disabled';

/**
 * MUI props the wrapper owns, and why each one is gone rather than
 * renamed.
 *
 * All three are the same fact stated three ways — how tall a row is — and
 * the design states it once. `size` sets `rowHeight` and
 * `columnHeaderHeight` together, which is what keeps a 48px row under a
 * 32px header instead of under a 56px one; `density` then multiplies both
 * behind the wrapper's back, so a grid could come out at 48 × 1.3 and
 * agree with nothing else on the page.
 */
type LockedDataGridProp = 'rowHeight' | 'columnHeaderHeight' | 'density';

/**
 * Props for the Neoflo `DataGrid`.
 *
 * Everything MUI X's community grid documents survives except the three
 * above — the sorting, filtering, pagination, editing, selection and
 * export APIs are all MUI's, unchanged, because they are the reason to
 * reach for a grid at all.
 */
export interface DataGridProps<
  R extends GridValidRowModel = GridValidRowModel,
> extends Omit<MuiDataGridProps<R>, LockedDataGridProp> {
  /**
   * Row height: `sm` 48, `md` 56, `lg` 64. The header stays 32.
   * @default 'md'
   */
  size?: DataGridSize;
  /**
   * An outcome to tint a row with, read off the row's own data. Return
   * `error` for a record that failed, `success` for one that cleared,
   * `disabled` to grey it, or nothing for the ordinary case.
   *
   * A grid has no per-row markup to hang a prop on, so this is a function
   * of the row rather than a value — the same shape as
   * `getRowClassName`, which it composes with rather than replaces.
   *
   * `disabled` is ink only. Whether a greyed row can still be picked or
   * edited is `isRowSelectable` and `isCellEditable`'s to say, because a
   * row that only *looks* unavailable but still answers the keyboard is
   * worse than one that looks ordinary.
   *
   * @default undefined
   */
  rowState?: (
    params: GridRowClassNameParams<R>
  ) => DataGridRowState | undefined;
  /**
   * What the footer calls a row — "1–20 of 278 **transactions**".
   *
   * The design writes a domain noun rather than "rows" (3206:122300), and
   * a plural is all it ever shows, so this takes one string. Pass the
   * empty string for a bare count.
   *
   * @default 'rows'
   */
  rowNoun?: string;
}
