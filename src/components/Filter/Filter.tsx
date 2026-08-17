'use client';

import * as React from 'react';
import { Popover } from '@mui/material';

import { radius } from '@/src/tokens';

import { Button } from '../Button';

import { FilterOptionPane } from './FilterOptionPane';
import { FilterTab } from './FilterTab';
import {
  FilterBody,
  FilterBottomBar,
  FilterPane,
  FilterPanel,
  FilterRail,
  FilterTitle,
  FilterTopBar,
} from './filterSurfaces';
import {
  countFor,
  matchesSearch,
  selectVisible,
  toggleOption,
  unselectVisible,
} from './filterSelection';

import type { PopoverOrigin } from '@mui/material';
import type { FilterGroup, FilterProps, FilterValue } from './Filter.types';

const DEFAULT_VALUE: FilterValue = {};

const DEFAULT_LABELS = {
  clearAll: 'Clear all filter',
  selectAll: 'Select all',
  clearGroup: 'Clear all',
  noResults: 'No matches',
} as const;

const DEFAULT_ANCHOR_ORIGIN: PopoverOrigin = {
  vertical: 'bottom',
  horizontal: 'left',
};

const DEFAULT_TRANSFORM_ORIGIN: PopoverOrigin = {
  vertical: 'top',
  horizontal: 'left',
};

/** A `PopoverOrigin` as a CSS `transform-origin`, horizontal first. */
function originToCss(origin: PopoverOrigin): string {
  const axis = (value: number | string): string =>
    typeof value === 'number' ? `${value}px` : value;
  return `${axis(origin.horizontal)} ${axis(origin.vertical)}`;
}

/**
 * State that the caller may or may not be holding. Returns the value in
 * force plus a setter that is a no-op while the prop is supplied, so the
 * component never fights a controlled parent.
 */
function useControllable<T>(
  controlled: T | undefined,
  initial: T
): [T, (next: T) => void] {
  const [internal, setInternal] = React.useState<T>(initial);
  const isControlled = controlled !== undefined;
  const set = React.useCallback(
    (next: T) => {
      if (!isControlled) {
        setInternal(next);
      }
    },
    [isControlled]
  );
  return [isControlled ? controlled : internal, set];
}

/**
 * The two-column filter panel: a rail of categories, and the options for
 * whichever one is active.
 *
 * The panel is described rather than composed — `groups` carries the
 * rail and the panes together, because the two are one thing and
 * splitting them across children invites a rail row with no pane behind
 * it. Every part it draws is a component from this library: the rail
 * badges are `Chip size="sm"`, the option rows are `Checkbox`, the
 * search field is `TextField`, and the three actions are text `Button`s.
 *
 * ## Selection
 *
 * `value` is a map of group id to selected option values, and `onChange`
 * fires with the whole next map rather than a delta, so it drops
 * straight into a query. Groups with nothing selected are absent from
 * the map instead of holding an empty array. Leave `value` off and the
 * panel holds its own.
 *
 * ## A group is a list, or a pane of its own
 *
 * Most categories are a searchable list of checkboxes and need only
 * `options`. A category that is not a multi-select at all — a date
 * range, a numeric bound — supplies `content` instead and owns its own
 * state; tell the rail how much of it is active through `count`, and
 * reset it from `onClearAll`.
 *
 * ## Bulk actions act on what you can see
 *
 * `Select all` and `Clear all` at the foot of the pane both operate on
 * the rows the current search leaves visible, not the whole group. With
 * an empty search that is everything, and with a search running it is
 * the only reading where the two actions agree with each other.
 * `Clear all filter` in the title bar is the unscoped one.
 *
 * ## Anchoring
 *
 * `anchorEl` floats the panel under a trigger. It hangs from the
 * anchor's bottom-left by default and grows out of its own top-left
 * corner, which is right for a trigger on the left of a toolbar. Move
 * both to `right` for one on the right: at 594px wide, a left-aligned
 * panel there leaves the viewport and gets pushed back in, and a pushed
 * panel lines up with nothing.
 *
 * @example A controlled panel
 * <Filter
 *   groups={groups}
 *   value={selection}
 *   onChange={setSelection}
 * />
 *
 * @example Anchored under a toolbar button
 * <Filter
 *   groups={groups}
 *   value={selection}
 *   onChange={setSelection}
 *   anchorEl={anchorEl}
 *   open={isOpen}
 *   onClose={handleClose}
 * />
 *
 * @see Related: Chip, Checkbox, TextField, Button, Drawer
 */
export const Filter = React.forwardRef<HTMLDivElement, FilterProps>(
  (
    {
      groups,
      value: valueProp,
      defaultValue = DEFAULT_VALUE,
      onChange,
      activeGroupId: activeGroupIdProp,
      defaultActiveGroupId,
      onActiveGroupChange,
      onClearAll,
      title = 'Filter',
      labels,
      anchorEl,
      open,
      onClose,
      anchorOrigin = DEFAULT_ANCHOR_ORIGIN,
      transformOrigin = DEFAULT_TRANSFORM_ORIGIN,
      ...rest
    },
    ref
  ) => {
    const strings = { ...DEFAULT_LABELS, ...labels };
    const firstGroupId = groups[0]?.id ?? '';

    const [value, setValue] = useControllable(valueProp, defaultValue);
    const [activeGroupId, setActiveGroupId] = useControllable(
      activeGroupIdProp,
      defaultActiveGroupId ?? firstGroupId
    );

    /*
     * Keyed by the group it was typed into rather than cleared by an
     * effect, so a category switch resets the box whether it came from
     * the rail or from a controlled `activeGroupId` moving underneath.
     */
    const [searchState, setSearchState] = React.useState({
      groupId: activeGroupId,
      text: '',
    });
    const search = searchState.groupId === activeGroupId ? searchState.text : '';

    const activeGroup: FilterGroup | undefined =
      groups.find((group) => group.id === activeGroupId) ?? groups[0];

    const options = activeGroup?.options ?? [];
    const visible = options.filter((option) => matchesSearch(option, search));
    const selected = activeGroup ? (value[activeGroup.id] ?? []) : [];
    const hasSelection = groups.some((group) => countFor(group, value) > 0);

    function commit(next: FilterValue): void {
      setValue(next);
      onChange?.(next);
    }

    function handleActiveGroupChange(groupId: string): void {
      setActiveGroupId(groupId);
      onActiveGroupChange?.(groupId);
    }

    function handleClearAll(): void {
      commit(DEFAULT_VALUE);
      onClearAll?.();
    }

    const showBulkActions =
      activeGroup !== undefined &&
      activeGroup.content === undefined &&
      !activeGroup.disableBulkActions;

    const panel = (
      <FilterPanel ref={ref} elevation={0} {...rest}>
        <FilterTopBar>
          <FilterTitle>{title}</FilterTitle>
          <Button
            size="sm"
            variant="secondary"
            appearance="text"
            disabled={!hasSelection}
            onClick={handleClearAll}
          >
            {strings.clearAll}
          </Button>
        </FilterTopBar>

        <FilterBody>
          <FilterRail role="tablist" aria-orientation="vertical">
            {groups.map((group) => (
              <FilterTab
                key={group.id}
                label={group.label}
                count={countFor(group, value)}
                selected={group.id === activeGroup?.id}
                onSelect={() => handleActiveGroupChange(group.id)}
              />
            ))}
          </FilterRail>

          <FilterPane role="tabpanel" aria-label={activeGroup?.label}>
            {activeGroup?.content ?? (
              <FilterOptionPane
                options={visible}
                selected={selected}
                onToggle={(optionValue) => {
                  if (activeGroup) {
                    commit(toggleOption(value, activeGroup.id, optionValue));
                  }
                }}
                search={search}
                onSearchChange={(text) =>
                  setSearchState({ groupId: activeGroupId, text })
                }
                searchPlaceholder={
                  activeGroup?.searchPlaceholder ??
                  `Search ${activeGroup?.label ?? ''}`.trim()
                }
                showSearch={
                  activeGroup !== undefined && !activeGroup.disableSearch
                }
                noResultsLabel={strings.noResults}
              />
            )}

            {showBulkActions && (
              <FilterBottomBar>
                <Button
                  size="sm"
                  variant="secondary"
                  appearance="text"
                  disabled={visible.length === 0}
                  onClick={() =>
                    commit(selectVisible(value, activeGroup.id, visible))
                  }
                >
                  {strings.selectAll}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  appearance="text"
                  disabled={selected.length === 0}
                  onClick={() =>
                    commit(unselectVisible(value, activeGroup.id, visible))
                  }
                >
                  {strings.clearGroup}
                </Button>
              </FilterBottomBar>
            )}
          </FilterPane>
        </FilterBody>
      </FilterPanel>
    );

    if (anchorEl === undefined) {
      return panel;
    }

    return (
      <Popover
        open={open ?? false}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              // The panel is the surface. MUI's own paper would
              // otherwise draw a second one behind it — its own fill,
              // its own elevation shadow, and square corners poking out
              // past our 16px ones.
              backgroundColor: 'transparent',
              backgroundImage: 'none',
              boxShadow: 'none',
              borderRadius: `${radius.lg}px`,
              overflow: 'visible',
              /*
               * The corner the panel grows from, pinned.
               *
               * MUI writes `transform-origin` inline from
               * `transformOrigin`, then *moves* it whenever it nudges a
               * panel back inside the viewport, so the growth keeps
               * pointing at the anchor. For a 594px panel near the right
               * edge that shift is a few hundred pixels, which lands the
               * origin near the middle and reads as the panel inflating
               * out of nowhere. Pinning it keeps the animation starting
               * at the corner that was asked for. `!important` because
               * MUI's value is an inline style, which `sx` cannot
               * otherwise outrank.
               */
              transformOrigin: `${originToCss(transformOrigin)} !important`,
            },
          },
        }}
      >
        {panel}
      </Popover>
    );
  }
);

Filter.displayName = 'Filter';
