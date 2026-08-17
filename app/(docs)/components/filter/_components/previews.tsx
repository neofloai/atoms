'use client';

import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { FadersHorizontalIcon } from '@/src/icons';
import { Button } from '@/src/components/Button';
import { Chip } from '@/src/components/Chip';
import { DatePicker } from '@/src/components/DatePicker';
import { Filter, countActiveFilters } from '@/src/components/Filter';

import { groups, statusOptions, typeOptions } from './sampleData';

import type { FilterValue } from '@/src/components/Filter';

/**
 * Live previews for the Filter page. Each one holds its own selection,
 * because the point of a controlled panel is that the selection lives
 * where the query does.
 */

/** The default panel: four categories, nothing configured beyond them. */
export function FacetedPreview(): React.JSX.Element {
  const [selection, setSelection] = React.useState<FilterValue>({});

  return <Filter groups={groups} value={selection} onChange={setSelection} />;
}

FacetedPreview.displayName = 'FacetedPreview';

/**
 * Floating under a toolbar button, which is how it usually opens.
 *
 * The trigger carries the count, because once the panel closes it is
 * the only thing left saying the table is filtered at all. Select
 * something and the badge appears on the button as well as the rail.
 */
export function AnchoredPreview(): React.JSX.Element {
  const [selection, setSelection] = React.useState<FilterValue>({});
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const activeCount = countActiveFilters(groups, selection);

  return (
    <>
      <Button
        variant="secondary"
        appearance="outline"
        startIcon={<FadersHorizontalIcon />}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        Filter
        {activeCount > 0 && (
          <Chip
            size="sm"
            variant="primary"
            component="span"
            label={activeCount}
          />
        )}
      </Button>
      <Filter
        groups={groups}
        value={selection}
        onChange={setSelection}
        anchorEl={anchorEl}
        open={anchorEl !== null}
        onClose={() => setAnchorEl(null)}
      />
    </>
  );
}

AnchoredPreview.displayName = 'AnchoredPreview';

/** Rows whose label is a `Chip`, searched through `searchText`. */
export function StatusPreview(): React.JSX.Element {
  const [selection, setSelection] = React.useState<FilterValue>({
    status: ['answered'],
  });

  return (
    <Filter
      groups={[{ id: 'status', label: 'Status', options: statusOptions }]}
      value={selection}
      onChange={setSelection}
    />
  );
}

StatusPreview.displayName = 'StatusPreview';

const PRESETS = ['All Time', 'Today', 'Last 7 days'] as const;

type Preset = (typeof PRESETS)[number];

/** A pane label, matching the type the option rows use. */
function PaneLabel({ children }: { children: string }): React.JSX.Element {
  return (
    <Typography variant="body2" sx={{ fontWeight: 600 }}>
      {children}
    </Typography>
  );
}

PaneLabel.displayName = 'PaneLabel';

/** A category that is not a multi-select, supplied through `content`. */
export function DateRangePreview(): React.JSX.Element {
  const [selection, setSelection] = React.useState<FilterValue>({});
  const [preset, setPreset] = React.useState<Preset>('All Time');

  const content = (
    <Stack spacing={3} sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <PaneLabel>Filter by Date Range</PaneLabel>
        <Stack direction="row" spacing={1}>
          {PRESETS.map((option) => (
            <Chip
              key={option}
              dense
              label={option}
              appearance="outline"
              variant={option === preset ? 'primary' : 'secondary'}
              selected={option === preset}
              onClick={() => setPreset(option)}
            />
          ))}
        </Stack>
      </Stack>
      <Stack spacing={1.5}>
        <PaneLabel>Custom Date Range</PaneLabel>
        <Stack direction="row" spacing={1}>
          <DatePicker label="Start date" />
          <DatePicker label="End date" />
        </Stack>
      </Stack>
    </Stack>
  );

  return (
    <Filter
      groups={[
        {
          id: 'range',
          label: 'Date Range',
          count: preset === 'All Time' ? 0 : 1,
          content,
        },
        ...groups,
      ]}
      value={selection}
      onChange={setSelection}
      onClearAll={() => setPreset('All Time')}
    />
  );
}

DateRangePreview.displayName = 'DateRangePreview';

/** Four options: no search box, no bulk actions. */
export function CompactPreview(): React.JSX.Element {
  const [selection, setSelection] = React.useState<FilterValue>({});

  return (
    <Filter
      groups={[
        {
          id: 'type',
          label: 'Type',
          options: typeOptions,
          disableSearch: true,
          disableBulkActions: true,
        },
        ...groups,
      ]}
      value={selection}
      onChange={setSelection}
    />
  );
}

CompactPreview.displayName = 'CompactPreview';

/** The four strings the panel writes itself, replaced. */
export function LabelsPreview(): React.JSX.Element {
  const [selection, setSelection] = React.useState<FilterValue>({});

  return (
    <Filter
      groups={groups}
      value={selection}
      onChange={setSelection}
      title="Refine"
      labels={{
        clearAll: 'Reset',
        selectAll: 'Select visible',
        clearGroup: 'Clear',
        noResults: 'Nothing matches that',
      }}
    />
  );
}

LabelsPreview.displayName = 'LabelsPreview';
