'use client';

import * as React from 'react';
import { styled } from '@mui/material/styles';

import { MagnifyingGlassIcon } from '@/src/icons/glyphs';
import { radius, surface, text } from '@/src/tokens';

import { Checkbox } from '../Checkbox';
import { TextField } from '../TextField';
import { paired } from '../_shared/actionStyles';
import { selectorInsetPx } from '../_shared/selectorStyles';

import {
  FILTER_GAP_PX,
  FILTER_INSET_PX,
  filterLabelType,
} from './filterTokens';

import type { FilterOption } from './Filter.types';

/**
 * How far the option list is pulled in from the pane's own inset.
 *
 * A `Checkbox` carries its 32px hover target as padding around a 16px
 * box, so a list padded to the panel's inset would sit the *target* at
 * 16 and the visible box at 24 — out of line with the search field's
 * border directly above it. Subtracting the control's own inset puts
 * the box on the panel's edge and lets the target overhang it, which is
 * what the design draws.
 */
const OPTION_LIST_INSET_PX = FILTER_INSET_PX - selectorInsetPx('md');

const PaneBody = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: FILTER_GAP_PX,
  // Without this a flex child refuses to shrink below its content, and
  // the list grows the panel instead of scrolling inside it.
  minHeight: 0,
  paddingBlock: FILTER_INSET_PX,
});

PaneBody.displayName = 'PaneBody';

const SearchRow = styled('div')({
  paddingInline: FILTER_INSET_PX,
});

SearchRow.displayName = 'SearchRow';

const OptionList = styled('ul')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: 0,
  minHeight: 0,
  margin: 0,
  paddingBlock: 0,
  paddingInline: OPTION_LIST_INSET_PX,
  listStyle: 'none',
  overflowY: 'auto',
});

OptionList.displayName = 'OptionList';

const OptionRow = styled('li')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  borderRadius: radius.xs,
  '&:hover': paired(theme, {
    backgroundColor: surface.default.defaultHover,
  }),
  // The label is the row: clicking anywhere along it should toggle, not
  // just the words themselves.
  '& .MuiFormControlLabel-root': { flex: 1, minWidth: 0 },
  '& .MuiFormControlLabel-label': { flex: 1, minWidth: 0 },
}));

OptionRow.displayName = 'OptionRow';

const EmptyMessage = styled('p')(({ theme }) => ({
  margin: 0,
  paddingInline: FILTER_INSET_PX,
  fontSize: filterLabelType.size,
  lineHeight: `${filterLabelType.leading}px`,
  letterSpacing: `${filterLabelType.letterSpacing}em`,
  ...paired(theme, { color: text.default.placeholder }),
}));

EmptyMessage.displayName = 'EmptyMessage';

/**
 * Props for the option pane. Internal to `Filter`.
 *
 * `options` arrives already narrowed to what the search matches — the
 * panel does the filtering, because `Select all` and `Clear all` act on
 * the same narrowed set and the two must not disagree about it.
 */
export interface FilterOptionPaneProps {
  /** Rows to draw, already filtered by the current search. */
  options: readonly FilterOption[];
  /** Selected values within this group. */
  selected: readonly string[];
  /** Fires with the value of the row that was toggled. */
  onToggle: (value: string) => void;
  /** Current search text. */
  search: string;
  /** Fires as the search text changes. */
  onSearchChange: (search: string) => void;
  /** Search placeholder. */
  searchPlaceholder: string;
  /** Whether to draw the search field at all. */
  showSearch: boolean;
  /** Shown in place of the list when `options` is empty. */
  noResultsLabel: string;
}

/**
 * The right-hand pane of a `Filter`: a search field over a scrolling
 * list of checkboxes.
 *
 * Rows are the house `Checkbox`, so a filter list and a form use the
 * same control. A row's `label` can be any node — a status `Chip`, a
 * name beside an `Avatar` — which is why searching matches against
 * `searchText` rather than trying to read text out of the tree.
 */
export function FilterOptionPane({
  options,
  selected,
  onToggle,
  search,
  onSearchChange,
  searchPlaceholder,
  showSearch,
  noResultsLabel,
}: FilterOptionPaneProps): React.JSX.Element {
  return (
    <PaneBody>
      {showSearch && (
        <SearchRow>
          <TextField
            fullWidth
            value={search}
            placeholder={searchPlaceholder}
            onChange={(event) => onSearchChange(event.target.value)}
            startAdornment={<MagnifyingGlassIcon />}
          />
        </SearchRow>
      )}
      {options.length === 0 ? (
        <EmptyMessage>{noResultsLabel}</EmptyMessage>
      ) : (
        <OptionList>
          {options.map((option) => (
            <OptionRow key={option.value}>
              <Checkbox
                label={option.label}
                checked={selected.includes(option.value)}
                disabled={option.disabled}
                onChange={() => onToggle(option.value)}
              />
            </OptionRow>
          ))}
        </OptionList>
      )}
    </PaneBody>
  );
}

FilterOptionPane.displayName = 'FilterOptionPane';
