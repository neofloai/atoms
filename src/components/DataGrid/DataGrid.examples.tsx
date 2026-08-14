import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `DataGrid`. Read by `scripts/generate.ts` and
 * served through the MCP `get_component` tool and the docs site.
 *
 * The props list is deliberately short. Three props are this wrapper's;
 * everything else on the list is one of MUI X's that a caller reaches for
 * on the first day — the sorting, pagination and selection switches — so
 * the table reads as "what do I turn on" rather than as a mirror of MUI's
 * 200-prop API, which is documented once, well, on their site.
 */
export const data: ComponentExamplesData = {
  name: 'DataGrid',
  category: 'Data Display',
  figmaUrl:
    'https://www.figma.com/design/iDCodnA5uZ14EdttjSMCT1/Product-Design-System?node-id=3215-52225&m=dev',
  tagline:
    'The table’s look driven by MUI X’s grid: virtualised rows, sorting, filtering, pagination, inline editing and CSV export, in the same 48/56/64 rows and 32px header strip. Reach for Table instead when the data is short and fixed.',
  props: [
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      default: "'md'",
      description:
        'Row height: `sm` 48, `md` 56, `lg` 64, with the header strip at 32 in all three. The same values `Table` takes, so a screen can move between the two without changing how dense it looks. Replaces MUI’s `rowHeight`, `columnHeaderHeight` and `density` — the same fact stated three ways, which disagree as soon as two of them are set.',
    },
    {
      name: 'rowState',
      type: "(params) => 'error' | 'success' | 'disabled' | undefined",
      default: '—',
      description:
        'An outcome to tint a row with, read off the row’s own data: `error` tints `surface/error/subtle`, `success` tints `surface/success/subtle`, `disabled` greys the ink and the hairline. A function rather than a prop because a grid has no per-row markup to hang one on; it composes with `getRowClassName` rather than replacing it. `disabled` is ink only — whether the row can still be picked or edited is `isRowSelectable` and `isCellEditable`’s to say.',
    },
    {
      name: 'rowNoun',
      type: 'string',
      default: "'rows'",
      description:
        'What the footer counts in — “1–20 of 278 **transactions**”. A domain noun reads better than “rows”, and only the plural is ever shown, so this takes one string. Pass `""` for a bare count.',
    },
    {
      name: 'pagination',
      type: 'boolean',
      default: 'false',
      description:
        'Page the rows, and bring up the footer: a count, a previous and a next, and a jump-to-start that appears only once you have left the first page. There is no rows-per-page control, so set the size with `initialState.pagination.paginationModel.pageSize`. Off by default, which is MUI’s split: a grid virtualises 10,000 rows without paging them.',
    },
    {
      name: 'checkboxSelection',
      type: 'boolean',
      default: 'false',
      description:
        'Add the selection column, using the house `Checkbox`. A selected row is bracketed between two `border/primary/2` hairlines rather than filled more heavily, because selection and hover paint the same surface — the lines are what tell them apart.',
    },
    {
      name: 'loading',
      type: 'boolean',
      default: 'false',
      description:
        'Swap the rows for a 20px bar in `surface/primary/subtle`, filling every cell in every column at the row height already set. Both of MUI’s cases — loading over existing rows and loading with none yet — use the same skeleton, so a grid never flips between a bar and a spinner.',
    },
    {
      name: 'autoHeight',
      type: 'boolean',
      default: 'false',
      description:
        'Grow with the rows instead of filling the parent. Worth knowing because MUI’s grid is `height: 100%`, so one in a parent with no height of its own would otherwise collapse; there is a 320px floor to keep that from happening silently, but a grid should still be told which of the two it is.',
    },
    {
      name: 'sortingOrder',
      type: "('asc' | 'desc' | null)[]",
      default: "['asc', 'desc', null]",
      description:
        'Which directions a header cycles through on click. The column menu offers both directions and a clear regardless, and words them from the column’s type: “Low to high” for a number, “A to Z” for a string, “Old to new” for a date. Override that wording with `localeText.columnMenuSortAsc`, which takes a function of the column.',
    },
    {
      name: 'columns',
      type: 'GridColDef[]',
      default: '—',
      description:
        "The column definitions, MUI X’s own. `type` is worth setting on every one: it picks the comparator, the filter operators, the editor, and the wording of the sort menu. `renderCell` is where a `Chip`, an `Avatar` or a `Button` goes — the same content the table puts in a cell, one level of indirection further out. A column that defines one is given `display: 'flex'` so what it renders centres in the row; pass `display: 'text'` to keep the cell’s own ellipsis instead.",
    },
  ],
  examples: [
    {
      title: 'A grid of records',
      description:
        'The grid needs a height: MUI’s root is `height: 100%`, so give it a sized box or pass `autoHeight`.',
      code: `import { DataGrid } from '@neoflo/atoms';
import Box from '@mui/material/Box';

const columns = [
  { field: 'reference', headerName: 'Invoice', width: 160 },
  { field: 'vendor', headerName: 'Vendor', flex: 1 },
  { field: 'amount', headerName: 'Amount', type: 'number', width: 140 },
];

<Box sx={{ height: 420 }}>
  <DataGrid rows={invoices} columns={columns} size="sm" rowNoun="invoices" />
</Box>`,
    },
    {
      title: 'Paginated, selectable, sorted on arrival',
      description:
        'The footer appears with `pagination`. Page size is set through `initialState`, since the footer has no rows-per-page control.',
      code: `<DataGrid
  rows={invoices}
  columns={columns}
  pagination
  checkboxSelection
  rowNoun="invoices"
  initialState={{
    pagination: { paginationModel: { pageSize: 10 } },
    sorting: { sortModel: [{ field: 'amount', sort: 'desc' }] },
  }}
/>`,
    },
    {
      title: 'Tinting rows from their own data',
      description:
        'Returns nothing for the ordinary case. Combines with hover and selection — a failed row is still selectable, and keeps its own colour under the pointer.',
      code: `<DataGrid
  rows={invoices}
  columns={columns}
  rowState={({ row }) => {
    if (row.status === 'failed') return 'error';
    if (row.status === 'paid') return 'success';
    return undefined;
  }}
/>`,
    },
    {
      title: 'A cell that holds a component',
      description:
        'Same answer as the table’s, one level further out: the cell renders whatever you return.',
      code: `const columns = [
  { field: 'reference', headerName: 'Invoice', width: 160 },
  {
    field: 'status',
    headerName: 'Status',
    width: 140,
    sortable: false,
    renderCell: ({ row }) => (
      <Chip size="sm" variant={row.statusVariant} label={row.status} />
    ),
  },
  {
    field: 'actions',
    headerName: 'Action',
    width: 120,
    align: 'right',
    headerAlign: 'right',
    sortable: false,
    renderCell: ({ row }) => (
      <Button appearance="outline" variant="secondary" size="sm">
        Review
      </Button>
    ),
  },
];`,
    },
    {
      title: 'Loading',
      description:
        'Bars at the row height already set, in every column. Keep the columns mounted while data is in flight so the grid holds its shape.',
      code: `<DataGrid rows={rows} columns={columns} loading={isFetching} />`,
    },
    {
      title: 'Server-side rows',
      description:
        'The footer reads the total from `rowCount`. Pass `-1` for a total nobody has yet and it drops the “of” rather than inventing a number.',
      code: `<DataGrid
  rows={page.rows}
  columns={columns}
  pagination
  paginationMode="server"
  sortingMode="server"
  rowCount={page.total ?? -1}
  loading={isFetching}
  paginationModel={{ page, pageSize: 20 }}
  onPaginationModelChange={setPagination}
  onSortModelChange={setSort}
/>`,
    },
    {
      title: 'Editing a cell in place',
      description:
        'MUI X’s, untouched. `processRowUpdate` is where the write goes; return the updated row to commit it.',
      code: `<DataGrid
  rows={rows}
  columns={columns.map((column) => ({ ...column, editable: true }))}
  processRowUpdate={async (next) => {
    await save(next);
    return next;
  }}
/>`,
    },
  ],
  dos: [
    'Give the grid a height — a sized parent, or `autoHeight` to grow with its rows.',
    'Set `type` on every column: it decides the comparator, the filter operators, the editor, and how the sort menu words itself.',
    'Use `Table` when the data is short and fixed. A grid engine behind eight rows is weight for nothing.',
    'Set `rowNoun` so the footer counts in the thing on screen — invoices, transactions, members.',
    'Reach for `rowState` for an outcome the record carries, and leave hover and selection to the grid.',
    'Set the page size through `initialState.pagination.paginationModel`, since the footer offers no control for it.',
    'Put a grid on a card. It draws no edge of its own, exactly like the table.',
    'Keep `columns` stable across renders — a new array each render costs the grid its measurements.',
    'Move `paginationMode`, `sortingMode` and `filterMode` to `"server"` together once the data is paged remotely.',
  ],
  donts: [
    'Don’t pass `rowHeight`, `columnHeaderHeight` or `density` — `size` owns all three, and they are locked out of the props.',
    'Don’t reach for a grid to lay out a form or a summary panel; that is `Table`, or `Stack`.',
    'Don’t wrap it in a `Card` that also draws its own padding around the rows — the grid’s first column already insets 24.',
    'Don’t set a fixed `width` on every column and a `flex` on none; a grid that cannot use its slack scrolls when it did not need to.',
    'Don’t use `rowState="disabled"` to stop a row being picked — it is ink only. `isRowSelectable` is what refuses.',
    'Don’t render a grid inside a scrolling container without a height: two nested scroll areas fight over the wheel.',
    'Don’t re-implement sorting or filtering above the grid when `sortModel` and `filterModel` are already there.',
  ],
  relatedComponents: [
    'Table',
    'Card',
    'Checkbox',
    'Chip',
    'IconButton',
    'MenuItem',
  ],
};
