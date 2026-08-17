import type * as React from 'react';
import type { PaperProps, PopoverProps } from '@mui/material';

/**
 * One selectable row in a group's option list.
 */
export interface FilterOption {
  /**
   * Stable identity for the row. This is what lands in `FilterValue`,
   * so it should be the id the query uses, not the display text.
   */
  readonly value: string;
  /**
   * Row content beside the checkbox. Plain text, or a node — a status
   * `Chip`, an `Avatar` next to a name — when the option carries more
   * than a label.
   */
  readonly label: React.ReactNode;
  /**
   * What the search box matches against, case-insensitively.
   *
   * Defaults to `label` when `label` is a string. Supply it whenever
   * `label` is a node: a node has no text to search, so without this the
   * row vanishes as soon as anything is typed.
   */
  readonly searchText?: string;
  /**
   * Disables the row. `Select all` skips it.
   *
   * @default false
   */
  readonly disabled?: boolean;
}

/**
 * One category in the rail, plus whatever the pane shows when it is the
 * active one.
 *
 * A group is either a list of checkbox options or a pane of its own —
 * supply `options` or `content`, not both. `content` is the escape hatch
 * for a category that is not a multi-select at all: a date range, a
 * numeric bound, a pair of pickers.
 */
export interface FilterGroup {
  /** Stable identity. Keys this group's entry in `FilterValue`. */
  readonly id: string;
  /** Rail label, and the default noun in the search placeholder. */
  readonly label: string;
  /** Checkbox options. Omit when supplying `content`. */
  readonly options?: readonly FilterOption[];
  /**
   * Arbitrary pane content, replacing the search field, the option
   * list, and the bulk-action bar. Selection for a group like this is
   * the caller's to hold; report how much of it is active through
   * `count` so the rail still shows a badge.
   */
  readonly content?: React.ReactNode;
  /** Search placeholder. @default `Search ${label}` */
  readonly searchPlaceholder?: string;
  /**
   * Hides the search field. Worth setting on a short, fixed list where
   * a search box is more chrome than help.
   *
   * @default false
   */
  readonly disableSearch?: boolean;
  /**
   * Hides the `Select all` / `Clear all` bar at the foot of the pane.
   *
   * @default false
   */
  readonly disableBulkActions?: boolean;
  /**
   * Rail badge count. Defaults to the number of selected options, which
   * is what a `options` group wants; set it explicitly for a `content`
   * group, whose selection the panel cannot see.
   */
  readonly count?: number;
}

/**
 * Selected option values, keyed by group id.
 *
 * Groups with nothing selected may be absent or hold an empty array —
 * the panel treats the two the same, and `Clear all filter` produces
 * the empty object rather than a map of empty arrays.
 */
export type FilterValue = Readonly<Record<string, readonly string[]>>;

/**
 * The four strings the panel writes itself, for translation or for
 * house wording that differs from the defaults.
 */
export interface FilterLabels {
  /** Top-bar action, clearing every group. @default 'Clear all filter' */
  readonly clearAll?: string;
  /** Pane action, selecting the visible rows. @default 'Select all' */
  readonly selectAll?: string;
  /** Pane action, clearing the visible rows. @default 'Clear all' */
  readonly clearGroup?: string;
  /** Shown when a search matches nothing. @default 'No matches' */
  readonly noResults?: string;
}

/**
 * Props for the Neoflo `Filter`.
 *
 * Extends MUI's `PaperProps` minus the props the panel manages itself
 * (`variant` and `elevation`, which are the panel's own treatment;
 * `children`, since the content comes from `groups`) and three that are
 * remapped from their HTML meanings: `title` is the panel heading
 * rather than a browser tooltip, and `value` / `defaultValue` /
 * `onChange` describe the selection rather than a form control.
 */
export interface FilterProps
  extends Omit<
    PaperProps,
    | 'children'
    | 'defaultValue'
    | 'elevation'
    | 'onChange'
    | 'title'
    | 'value'
    | 'variant'
  > {
  /** Categories down the rail, in the order shown. */
  groups: readonly FilterGroup[];
  /** Selected values, keyed by group id. Makes the panel controlled. */
  value?: FilterValue;
  /** Initial selection when the panel is uncontrolled. @default {} */
  defaultValue?: FilterValue;
  /** Fires with the whole next selection, not just the group that moved. */
  onChange?: (value: FilterValue) => void;
  /** Active category. Makes the rail controlled. */
  activeGroupId?: string;
  /** Initially active category. @default the first group's id */
  defaultActiveGroupId?: string;
  /** Fires when the rail selection moves. */
  onActiveGroupChange?: (groupId: string) => void;
  /**
   * Fires after `Clear all filter`, in addition to `onChange` with the
   * empty selection. Use it to reset the state of `content` groups,
   * which the panel does not hold.
   */
  onClearAll?: () => void;
  /** Panel heading. @default 'Filter' */
  title?: string;
  /** Overrides for the strings the panel writes itself. */
  labels?: FilterLabels;
  /**
   * Anchors the panel in a popover.
   *
   * Passing this switches the panel from an in-flow surface to a
   * floating one positioned against the element — a `Filter` button in
   * a toolbar, typically. `open` and `onClose` then apply; without it
   * all three are ignored and the panel renders where it sits.
   */
  anchorEl?: PopoverProps['anchorEl'];
  /** Whether the popover is showing. Only read with `anchorEl`. */
  open?: boolean;
  /** Fires on backdrop click or Escape. Only read with `anchorEl`. */
  onClose?: PopoverProps['onClose'];
  /**
   * Which point of the anchor the panel hangs from.
   *
   * @default { vertical: 'bottom', horizontal: 'left' }
   */
  anchorOrigin?: PopoverProps['anchorOrigin'];
  /**
   * Which corner of the panel meets that point — and, because the two
   * should agree, the corner the open animation grows out of.
   *
   * Set `horizontal: 'right'` for a trigger sitting at the right end of
   * a toolbar: a left-aligned panel wide enough to leave the viewport
   * gets pushed back in, and a panel that has been pushed no longer
   * lines up with anything.
   *
   * @default { vertical: 'top', horizontal: 'left' }
   */
  transformOrigin?: PopoverProps['transformOrigin'];
}
