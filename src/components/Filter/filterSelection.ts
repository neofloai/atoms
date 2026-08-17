import type { FilterGroup, FilterOption, FilterValue } from './Filter.types';

/**
 * Pure selection arithmetic for `Filter`, kept out of the component so
 * the rules are readable on their own — in particular the one that says
 * a group with nothing selected leaves the map rather than sitting in it
 * as an empty array. Callers compare `value` against a query; an empty
 * array that means "no constraint" is a trap worth closing here once.
 */

/** Replaces one group's selection, dropping the key when it empties. */
function withGroup(
  value: FilterValue,
  groupId: string,
  next: readonly string[]
): FilterValue {
  const result: Record<string, readonly string[]> = { ...value };
  if (next.length === 0) {
    delete result[groupId];
  } else {
    result[groupId] = next;
  }
  return result;
}

/** Adds or removes one option from a group. */
export function toggleOption(
  value: FilterValue,
  groupId: string,
  optionValue: string
): FilterValue {
  const current = value[groupId] ?? [];
  const next = current.includes(optionValue)
    ? current.filter((entry) => entry !== optionValue)
    : [...current, optionValue];
  return withGroup(value, groupId, next);
}

/**
 * Adds every enabled option in `visible` to the group, keeping whatever
 * a running search has hidden. Disabled rows are skipped: `Select all`
 * must not reach a row the pointer cannot.
 */
export function selectVisible(
  value: FilterValue,
  groupId: string,
  visible: readonly FilterOption[]
): FilterValue {
  const current = value[groupId] ?? [];
  const additions = visible
    .filter((option) => !option.disabled)
    .map((option) => option.value);
  return withGroup(value, groupId, [...new Set([...current, ...additions])]);
}

/** Removes every option in `visible` from the group, keeping the rest. */
export function unselectVisible(
  value: FilterValue,
  groupId: string,
  visible: readonly FilterOption[]
): FilterValue {
  const current = value[groupId] ?? [];
  const removals = new Set(visible.map((option) => option.value));
  return withGroup(
    value,
    groupId,
    current.filter((entry) => !removals.has(entry))
  );
}

/**
 * Text the search box matches an option against.
 *
 * A `label` that is a node has no text to read, so those options must
 * declare `searchText` or they match nothing — silently dropping out of
 * the list the moment anything is typed is worse than a caller having
 * to say what their `Chip` says.
 */
function searchTextOf(option: FilterOption): string {
  if (option.searchText !== undefined) {
    return option.searchText;
  }
  return typeof option.label === 'string' ? option.label : '';
}

/** Whether an option survives the current search. */
export function matchesSearch(option: FilterOption, search: string): boolean {
  const query = search.trim().toLowerCase();
  if (query === '') {
    return true;
  }
  return searchTextOf(option).toLowerCase().includes(query);
}

/**
 * The number on a group's rail badge: whatever the group declares, or
 * how many of its options are selected. A `content` group has to declare
 * it — the panel does not hold that group's state and cannot count it.
 */
export function countFor(group: FilterGroup, value: FilterValue): number {
  return group.count ?? (value[group.id]?.length ?? 0);
}

/**
 * How many filters are active across the whole panel — the sum of every
 * rail badge.
 *
 * This is the number a trigger button carries, and reading it from the
 * same arithmetic the rail uses is the point: the badge on the button
 * and the badges inside the panel it opens cannot then disagree.
 *
 * It takes `groups` and not just `value` because a `content` group
 * declares its own `count` — the panel never held that group's state,
 * so summing `value` by hand silently misses it.
 *
 * @example
 * const activeCount = countActiveFilters(groups, selection);
 */
export function countActiveFilters(
  groups: readonly FilterGroup[],
  value: FilterValue
): number {
  return groups.reduce((total, group) => total + countFor(group, value), 0);
}
