import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for the `Table` family. Read by `scripts/generate.ts`
 * and served through the MCP `get_component` tool and the docs site.
 *
 * The props list covers all four components a caller writes props on —
 * `Table`, `TableRow`, `TableCell`, `TableSortLabel` — prefixed by owner,
 * the way `Navbar`'s covers `NavbarTitle`. `TableContainer`, `TableHead`
 * and `TableBody` take MUI's props unchanged and add none.
 */
export const data: ComponentExamplesData = {
  name: 'Table',
  category: 'Data Display',
  figmaUrl:
    'https://www.figma.com/design/iDCodnA5uZ14EdttjSMCT1/Product-Design-System?node-id=3215-52225&m=dev',
  tagline:
    'A table of records: a 32px strip of column labels over rows of 48, 56 or 64, separated by hairlines. Wraps MUI’s Table with the design’s paddings, inks and row states. Reach for the data grid instead when the table needs virtualising, filtering or inline editing.',
  props: [
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      default: "'md'",
      description:
        'Row height: `sm` 48, `md` 56, `lg` 64. Passed down to every row, so it is set once on the table rather than per row. The header stays 32 in all three — it is a label strip rather than a row of data, and the design holds it while the data breathes.',
    },
    {
      name: 'stickyHeader',
      type: 'boolean',
      default: 'false',
      description:
        'Pin the header while the body scrolls. Needs a scrolling ancestor to pin against, so pair it with `<TableContainer sx={{ maxHeight }}>`. The pinned row is filled with `card 1` so rows cannot show through it; a table on some other surface should say so with `sx`.',
    },
    {
      name: 'TableRow hover',
      type: 'boolean',
      default: 'false',
      description:
        'Tint the row under the pointer. Opt-in, and worth leaving off: a table that is only being read should not light up as the pointer crosses it. Turn it on when rows are clickable or selectable.',
    },
    {
      name: 'TableRow selected',
      type: 'boolean',
      default: 'false',
      description:
        'Mark the row as chosen. It is bracketed between two `border/primary/2` hairlines rather than deepening its fill, because selection and hover share the same surface. The upper line belongs to the row above, so a selected first row keeps a grey line over it.',
    },
    {
      name: 'TableRow state',
      type: "'default' | 'error' | 'success'",
      default: "'default'",
      description:
        'An outcome the row’s data carries: `error` tints it `surface/error/subtle`, `success` tints it `surface/success/subtle`. Combines with `hover` and `selected` — a failed row is still selectable, and it keeps its own colour under the pointer.',
    },
    {
      name: 'TableRow disabled',
      type: 'boolean',
      default: 'false',
      description:
        'Grey the row’s ink and its hairline, and stop it answering the pointer. Visual only: controls inside the row keep their own `disabled`, because a row cannot disable a descendant it does not own.',
    },
    {
      name: 'TableCell align',
      type: "'left' | 'center' | 'right'",
      default: "'left'",
      description:
        'Which edge the content reads from. `right` for amounts and counts, so digits line up on their units. A cell’s `icon` follows the alignment, landing on the outside of a right-aligned column.',
    },
    {
      name: 'TableCell icon',
      type: 'ReactNode',
      default: '—',
      description:
        'A node 8px clear of the text, vertically centred against the whole row rather than the first line. Takes a 16px glyph for an attachment or an upload, and an `Avatar` for a person.',
    },
    {
      name: 'TableCell secondary',
      type: 'ReactNode',
      default: '—',
      description:
        'A muted second line, hard under the first with no gap — 12/16 in `text/default/b3` against the cell’s 13/20. The pair comes to 36, so a two-line cell fits every row height including the 48px `sm`.',
    },
    {
      name: 'TableCell padding',
      type: "'normal' | 'checkbox' | 'none'",
      default: "'normal'",
      description:
        '`checkbox` narrows the cell to the design’s 32px selection column; `none` strips the padding for a cell whose own child carries it. Set it per cell — MUI’s table-level `padding` is removed, because it cascades through a context this wrapper cannot read.',
    },
    {
      name: 'TableCell sortDirection',
      type: "'asc' | 'desc' | false",
      default: 'false',
      description:
        'The order this column is sorted in, announced by the cell itself. Set it alongside the `TableSortLabel` inside, so the column says what the glyph shows.',
    },
    {
      name: 'TableSortLabel active',
      type: 'boolean',
      default: 'false',
      description:
        'Whether this is the column the table is sorted by. The active one shows a single arrow pointing the way it is sorted, visible at rest, and takes the darker body ink; an inactive column shows a two-headed `ArrowsDownUp` only while the pointer is on it, which is where the design draws it.',
    },
    {
      name: 'TableSortLabel direction',
      type: "'asc' | 'desc'",
      default: "'asc'",
      description:
        'Which way the active column is sorted, and therefore which arrow it shows. Holds the sort state nowhere — pair it with `onClick` and your own state, because the sorting itself is the caller’s data.',
    },
  ],
  examples: [
    {
      title: 'A table of records',
      description:
        'The whole family in the order it nests. Every cell is markup you control, which is the reason to use this rather than a grid: an amount is a right-aligned cell, a status is a `Chip`, and neither needs a column definition.',
      code: [
        '<Table size="sm">',
        '  <TableHead>',
        '    <TableRow>',
        '      <TableCell>Invoice</TableCell>',
        '      <TableCell>Vendor</TableCell>',
        '      <TableCell>Status</TableCell>',
        '      <TableCell align="right">Amount</TableCell>',
        '    </TableRow>',
        '  </TableHead>',
        '  <TableBody>',
        '    {invoices.map((invoice) => (',
        '      <TableRow key={invoice.id} hover>',
        '        <TableCell>{invoice.number}</TableCell>',
        '        <TableCell>{invoice.vendor}</TableCell>',
        '        <TableCell>',
        '          <Chip variant="success" size="sm" label={invoice.status} />',
        '        </TableCell>',
        '        <TableCell align="right">{invoice.total}</TableCell>',
        '      </TableRow>',
        '    ))}',
        '  </TableBody>',
        '</Table>',
      ].join('\n'),
    },
    {
      title: 'Two lines in one row, and a leading glyph',
      description:
        'The richest cells are still cells. `secondary` puts a muted line under the first with no gap between them, and `icon` holds a node 8px clear of the text — a glyph for a file, an `Avatar` for a person. Both stay centred against the row, so the row keeps one height.',
      code: [
        '<TableRow>',
        '  <TableCell icon={<UploadSimpleIcon size={16} />} secondary="14 Feb 2026 · 21:38">',
        '    #1008',
        '  </TableCell>',
        '  <TableCell icon={<Avatar size="sm">OP</Avatar>} secondary="administrator">',
        '    Kaustav',
        '  </TableCell>',
        '  <TableCell icon={<PaperclipIcon size={16} />}>inv-so90-9333.pdf</TableCell>',
        '  <TableCell align="right" secondary="$ 14,509.32">',
        '    Total',
        '  </TableCell>',
        '</TableRow>',
      ].join('\n'),
    },
    {
      title: 'Selectable rows',
      description:
        'A checkbox column plus `selected` on the row. `padding="checkbox"` narrows the cell to the design’s 32px, and `hover` goes on because the rows are now interactive. Selection is bracketed by two primary hairlines rather than a heavier fill.',
      code: [
        'const [picked, setPicked] = React.useState<string[]>([]);',
        '',
        '<TableBody>',
        '  {rows.map((row) => {',
        '    const isPicked = picked.includes(row.id);',
        '',
        '    return (',
        '      <TableRow key={row.id} hover selected={isPicked}>',
        '        <TableCell padding="checkbox">',
        '          <Checkbox',
        '            checked={isPicked}',
        '            onChange={() => setPicked(toggle(picked, row.id))}',
        '          />',
        '        </TableCell>',
        '        <TableCell>{row.number}</TableCell>',
        '      </TableRow>',
        '    );',
        '  })}',
        '</TableBody>',
      ].join('\n'),
    },
    {
      title: 'Rows that carry an outcome',
      description:
        'What `state` is for: the row’s colour comes from its data rather than from the pointer. Use it for a result the reader has to notice — a line that failed validation, one that cleared it — and leave every other row plain so the tinted ones stand out.',
      code: [
        '<TableBody>',
        '  <TableRow state="error">',
        '    <TableCell>inv-mds1204</TableCell>',
        '    <TableCell>Vendor not on file</TableCell>',
        '  </TableRow>',
        '  <TableRow state="success">',
        '    <TableCell>inv-mds1203</TableCell>',
        '    <TableCell>Matched</TableCell>',
        '  </TableRow>',
        '  <TableRow disabled>',
        '    <TableCell>inv-mds1202</TableCell>',
        '    <TableCell>Withdrawn</TableCell>',
        '  </TableRow>',
        '</TableBody>',
      ].join('\n'),
    },
    {
      title: 'A sortable column',
      description:
        'The affordance is a component; the sorting is yours. `sortDirection` on the cell announces the order, `active` and `direction` on the label draw it, and `onClick` is where your own comparator goes.',
      code: [
        'const [orderBy, setOrderBy] = React.useState("vendor");',
        'const [order, setOrder] = React.useState<"asc" | "desc">("asc");',
        '',
        '<TableHead>',
        '  <TableRow>',
        '    {columns.map((column) => (',
        '      <TableCell',
        '        key={column.id}',
        '        sortDirection={orderBy === column.id ? order : false}',
        '      >',
        '        <TableSortLabel',
        '          active={orderBy === column.id}',
        '          direction={orderBy === column.id ? order : "asc"}',
        '          onClick={() => sortBy(column.id)}',
        '        >',
        '          {column.label}',
        '        </TableSortLabel>',
        '      </TableCell>',
        '    ))}',
        '  </TableRow>',
        '</TableHead>',
      ].join('\n'),
    },
    {
      title: 'A tall table with a pinned header',
      description:
        'The container is what scrolls, so it is what `stickyHeader` pins against — a `maxHeight` on the table itself would do nothing. Inside a `Card` the pair reads as one panel, which is the surface the pinned row is filled to match.',
      code: [
        '<Card>',
        '  <TableContainer sx={{ maxHeight: 320 }}>',
        '    <Table stickyHeader size="sm">',
        '      <TableHead>',
        '        <TableRow>',
        '          <TableCell>Invoice</TableCell>',
        '          <TableCell align="right">Amount</TableCell>',
        '        </TableRow>',
        '      </TableHead>',
        '      <TableBody>{rows}</TableBody>',
        '    </Table>',
        '  </TableContainer>',
        '</Card>',
      ].join('\n'),
    },
  ],
  dos: [
    'Set `size` once on the table — every row reads it, and a table with two densities is two tables',
    'Use `align="right"` for amounts, counts and dates so digits line up on their units',
    'Put a `Chip`, an `Avatar` or a `Switch` straight into a cell — the design’s cell variants are content, not props',
    'Use `secondary` for the fact that qualifies the cell — a timestamp under a reference, a role under a name — rather than a second column',
    'Turn on `hover` when rows are clickable or selectable, and leave it off when the table is only being read',
    'Use `state` for an outcome in the data and `selected` for a choice the reader made; they are different colours because they answer different questions',
    'Wrap wide tables in a `TableContainer` so the table scrolls instead of stretching the page',
    'Give the column that should absorb spare width `sx={{ width: "100%" }}` — a cell’s `width` is only a preference, so slack is otherwise shared out across every column including the checkbox one',
    'Reach for the data grid when the table needs virtualising, filtering, pagination or inline editing',
  ],
  donts: [
    "Don't set `size` on a row or a cell — density belongs to the table, and MUI's cell `size` is removed rather than left to fight it",
    "Don't put vertical padding on cells to make a row taller; the row owns its height, and padding would push the hairline away from the content",
    "Don't wrap the table in a bordered box of your own — it draws no edge because the `Card` around it does",
    "Don't tint whole rows with `sx` to mean something; `state` exists so error and success are one colour across every table",
    'Don\'t use `state="error"` for a row the reader disabled — `disabled` greys it, and an error is something the data did',
    "Don't build sorting, filtering or pagination on top of this by hand once there are more than a few hundred rows — that is the data grid's work",
    "Don't reach for `stickyHeader` without a scrolling ancestor; sticky pins to `TableContainer`, and without one it does nothing",
  ],
  relatedComponents: ['Card', 'Chip', 'Checkbox', 'Avatar', 'Skeleton'],
};
