'use client';

import { styled } from '@mui/material/styles';

import { Avatar } from '@/src/components/Avatar';
import { Chip } from '@/src/components/Chip';
import { text, typography } from '@/src/tokens';

import {
  ASSIGNEES,
  ENTITIES,
  STATUSES,
  TYPES,
  VENDORS,
  groups,
  optionKey,
  statusMeta,
} from './sampleData';

import type { FilterValue } from '@/src/components/Filter';
import type { GridColDef } from '@mui/x-data-grid';

/**
 * The table the filter panel is filtering: a query log, with one column
 * per facet in `groups` so every selection has something to act on.
 *
 * Rows carry labels rather than keys — `optionKey` derives the value the
 * selection uses — so a row reads like the cell it renders and there is
 * only one place a vendor is spelled.
 */
export interface QueryRecord {
  readonly id: string;
  readonly reference: string;
  readonly received: string;
  readonly vendor: string;
  readonly vendorEmail: string;
  readonly types: readonly string[];
  readonly status: string;
  readonly entity: string;
  readonly assignee: string | null;
}

/**
 * A row before it is expanded: indices into the facet lists, so a row
 * cannot name a vendor or a status the filter panel has never heard of.
 */
type Seed = readonly [
  reference: string,
  received: string,
  vendor: number,
  vendorEmail: string,
  types: readonly number[],
  status: number,
  entity: number,
  assignee: number | null,
];

/**
 * Twelve rows, spread across the facets so every category has something
 * to filter and no single selection empties the grid.
 *
 * Written out rather than generated: the point of the preview is that a
 * reader can pick `Auth failed` and see exactly the rows it leaves.
 */
const SEEDS: readonly Seed[] = [
  ['849', '14/03/2026 | 11:15', 0, 'reply@cloudfield.com', [0], 0, 0, 0],
  ['748', '14/07/2026 | 11:33', 1, 'ap@globallogistics.com', [1, 0], 0, 1, 1],
  ['614', '15/07/2026 | 16:21', 2, 'invoices@summit.com', [1, 2], 1, 1, null],
  ['692', '10/07/2026 | 10:12', 3, 'finance@bluestar.com', [1, 3], 2, 2, 3],
  ['529', '15/07/2026 | 14:48', 4, 'billing@apexsolutions.io', [1], 3, 3, 2],
  ['467', '11/07/2026 | 15:28', 5, 'accounts@meridian.net', [0], 0, 0, 1],
  ['482', '16/07/2026 | 09:32', 6, 'support@cascadenet.io', [3], 1, 1, null],
  ['203', '14/07/2026 | 08:57', 7, 'billing@prismanalytics.co', [2, 1], 1, 2, 0],
  ['835', '12/07/2026 | 09:45', 0, 'ap@vertextech.com', [2], 1, 3, null],
  ['371', '16/07/2026 | 10:05', 1, 'hello@novacreative.design', [0], 0, 0, 3],
  ['156', '13/07/2026 | 13:10', 2, 'reply@globallogistics.com', [0, 1], 0, 1, 3],
  ['118', '09/07/2026 | 17:40', 3, 'ar@umbrellajp.co.jp', [3, 2], 2, 2, 2],
];

export const QUERY_ROWS: readonly QueryRecord[] = SEEDS.map(
  ([
    reference,
    received,
    vendor,
    vendorEmail,
    types,
    status,
    entity,
    assignee,
  ]) => ({
    id: reference,
    reference: `#${reference}`,
    received,
    vendor: VENDORS[vendor],
    vendorEmail,
    types: types.map((index) => TYPES[index]),
    status: STATUSES[status].value,
    entity: ENTITIES[entity],
    assignee: assignee === null ? null : ASSIGNEES[assignee],
  })
);

/** Vertically centred, because a grid cell centres one line with `line-height`. */
const Row = styled('span')({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  minWidth: 0,
  lineHeight: 'normal',
});

const Lines = styled('span')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  minWidth: 0,
  lineHeight: `${typography.body.b1.leading}px`,
});

const Secondary = styled('span')(({ theme }) => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontSize: typography.body.b2.size,
  lineHeight: `${typography.body.b2.leading}px`,
  color: text.default.placeholder.light,
  ...theme.applyStyles('dark', { color: text.default.placeholder.dark }),
}));

function TwoLine({
  primary,
  secondary,
}: {
  primary: string;
  secondary: string;
}) {
  return (
    <Lines>
      <span>{primary}</span>
      <Secondary>{secondary}</Secondary>
    </Lines>
  );
}

TwoLine.displayName = 'TwoLine';

/** Initials for an assignee avatar. */
function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);
}

const TypeRow = styled('span')({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  width: '100%',
  minWidth: 0,
  lineHeight: 'normal',
});

/**
 * The first type as a tag, and the rest as a count.
 *
 * A row can carry several; spelling them all out makes the column the
 * widest thing on the page for the sake of two records. The named tag
 * truncates and the count never does — losing the end of a word a reader
 * can still guess beats hiding the fact that there are three more.
 */
function TypeCell({ types }: { types: readonly string[] }) {
  return (
    <TypeRow>
      <Chip
        size="sm"
        variant="secondary"
        label={types[0]}
        sx={{
          minWidth: 0,
          '& .MuiChip-label': {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        }}
      />
      {types.length > 1 && (
        <Chip
          size="sm"
          variant="secondary"
          label={`+${types.length - 1}`}
          sx={{ flexShrink: 0 }}
        />
      )}
    </TypeRow>
  );
}

TypeCell.displayName = 'TypeCell';

/**
 * Six columns, one per facet plus the two-line identity cells.
 *
 * The widths are trimmed against the Figma screen, which had a 1440px
 * page to spend. This one lives inside a docs column, so `Vendor` takes
 * the slack and the rest are sized to what they actually hold — a grid
 * that scrolls sideways in a preview reads as a broken layout rather
 * than as a wide table.
 */
export const QUERY_COLUMNS: GridColDef<QueryRecord>[] = [
  {
    field: 'reference',
    headerName: 'Source ID / Time',
    width: 148,
    renderCell: ({ row }) => (
      <TwoLine primary={row.reference} secondary={row.received} />
    ),
  },
  {
    field: 'vendor',
    headerName: 'Vendor',
    flex: 1,
    minWidth: 150,
    renderCell: ({ row }) => (
      <TwoLine primary={row.vendor} secondary={row.vendorEmail} />
    ),
  },
  {
    field: 'types',
    headerName: 'Type',
    width: 164,
    sortable: false,
    renderCell: ({ row }) => <TypeCell types={row.types} />,
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 144,
    sortable: false,
    renderCell: ({ row }) => {
      const meta = statusMeta(row.status);
      return <Chip size="sm" variant={meta.variant} label={meta.label} />;
    },
  },
  {
    field: 'entity',
    headerName: 'Entity',
    width: 112,
  },
  {
    field: 'assignee',
    headerName: 'Assignee',
    width: 152,
    renderCell: ({ row }) =>
      row.assignee === null ? (
        '—'
      ) : (
        <Row>
          <Avatar size="sm">{initials(row.assignee)}</Avatar>
          <span>{row.assignee}</span>
        </Row>
      ),
  },
];

/** The facet each column filters on, as the selection spells it. */
function rowFacetValue(row: QueryRecord, groupId: string): string | null {
  switch (groupId) {
    case 'status':
      return row.status;
    case 'entity':
      return optionKey(row.entity);
    case 'assignee':
      return row.assignee === null ? null : optionKey(row.assignee);
    case 'vendor':
      return optionKey(row.vendor);
    default:
      return null;
  }
}

/** Everything the toolbar's search box reads on a row. */
function rowSearchText(row: QueryRecord): string {
  return [
    row.reference,
    row.vendor,
    row.vendorEmail,
    row.entity,
    row.assignee ?? '',
    ...row.types,
    statusMeta(row.status).label,
  ]
    .join(' ')
    .toLowerCase();
}

/**
 * A group with nothing selected constrains nothing. A row that has no
 * value for the facet at all — an unassigned query against an
 * `Assignee` selection — is excluded rather than kept, which is what a
 * reader picking two names expects to see.
 */
function matchesFacet(
  row: QueryRecord,
  groupId: string,
  selected: readonly string[]
): boolean {
  if (selected.length === 0) {
    return true;
  }
  const value = rowFacetValue(row, groupId);
  return value !== null && selected.includes(value);
}

/**
 * The rows a search box and a filter panel leave between them.
 *
 * One function rather than one per screen, because this is the whole
 * claim the pattern makes — the box asks "does this row mention it", the
 * panel asks "is this row one of these", and a row survives only if it
 * answers both. Two screens showing the same table from two copies of
 * this would eventually disagree about what "filtered" means.
 */
export function filterQueryRows(
  search: string,
  selection: FilterValue
): QueryRecord[] {
  const query = search.trim().toLowerCase();
  return QUERY_ROWS.filter(
    (row) =>
      (query === '' || rowSearchText(row).includes(query)) &&
      groups.every((group) =>
        matchesFacet(row, group.id, selection[group.id] ?? [])
      )
  );
}
