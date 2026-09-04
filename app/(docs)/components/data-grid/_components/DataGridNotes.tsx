import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/**
 * The prose sections of the DataGrid page — the seven things worth
 * knowing before reading the props.
 *
 * Split out of `page.tsx` for length, and to keep that page a table of
 * contents rather than a wall.
 */
export function DataGridNotes() {
  return (
    <>
      <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          This one, or the table
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Reach for this when the table <em>is</em> the screen: thousands of
          rows that need virtualising, sorting and filtering and pagination you
          would otherwise write by hand, inline editing, column resizing, CSV
          export, data that lives on a server. All of that is MUI X&apos;s and
          passes through untouched — it is the entire reason to be here, so none
          of it is renamed.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Reach for <code>Table</code> when the data is short and fixed and you
          want to write the markup yourself. It ships nothing you are not using;
          this ships a grid engine. Both draw the same design, so the choice is
          about weight and control rather than looks — a summary panel of eight
          rows does not need a virtualiser.
        </Typography>
      </Stack>

      <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          The same bands, a different engine
        </Typography>
        <Typography variant="body2" color="text.secondary">
          MUI draws a 1px border with a radius around the whole grid and fills
          it with <code>background.paper</code>. This one draws what the table
          draws: no border, no radius, no fill of its own, a hairline under
          every row including the last, and a 32px strip of labels on top. So a
          grid takes the colour of whatever it is dropped onto, and the edge
          around it is a <code>Card</code>&apos;s to draw.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          One difference is worth knowing because it is where every first grid
          goes wrong: a grid needs a <em>height</em>. MUI&apos;s root is{' '}
          <code>height: 100%</code>, which resolves to nothing in a parent that
          has none of its own, and a grid that renders as a 1px line is almost
          always this. Say which of the two you mean: a sized box, and the rows
          scroll inside it, or <code>autoHeight</code>, and the rows decide how
          tall the block is.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The rules are drawn differently too, and only one consequence escapes.
          The grid puts a <code>border-top</code> on each cell and makes the
          first row&apos;s transparent, where the table puts a{' '}
          <code>border-bottom</code> on each — identical to read, except that
          the grid&apos;s last row has no line under it, so it is given one.
          Because the two lines around a selected row are now borders on
          separate elements rather than one collapsed edge, a selected{' '}
          <em>first</em> row gets its upper hairline here, which the table
          cannot do.
        </Typography>
      </Stack>

      <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Density belongs to the grid
        </Typography>
        <Typography variant="body2" color="text.secondary">
          One <code>size</code> — <code>sm</code> 48, <code>md</code> 56,{' '}
          <code>lg</code> 64 — the same three values <code>Table</code> takes,
          so a screen can move from one to the other without changing how dense
          it looks. The header stays 32 in all three: it is a label strip rather
          than a row of data.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          It replaces three MUI props rather than one. <code>rowHeight</code>{' '}
          and <code>columnHeaderHeight</code> are the same fact stated twice and
          drift the moment only one is set; <code>density</code> then multiplies
          both behind your back, so a grid can come out at 48 × 1.3 and agree
          with nothing else on the page. All three are locked out.
        </Typography>
      </Stack>

      <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          What a cell holds is a <code>renderCell</code>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The answer is the same as the table&apos;s — a cell holds whatever you
          put in it — but the seam moved. A table cell is markup you write, so{' '}
          <code>icon</code> and <code>secondary</code> can be props on it. A
          grid cell is rendered by the grid from a column definition, so the
          two-line cell and the leading glyph are written in{' '}
          <code>renderCell</code> instead. The first preview above is six
          columns built that way.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Two things to undo when you do it, both consequences of how a grid
          centres a row: the cell&apos;s <code>line-height</code> is the
          row&apos;s full height and a nested block inherits it, and the cell is
          one line by default. A column with a <code>renderCell</code> is given{' '}
          <code>display: &apos;flex&apos;</code> for you so its content centres;
          set <code>line-height</code> on your own wrapper, and pass{' '}
          <code>display: &apos;text&apos;</code> if you want the cell&apos;s
          ellipsis back instead.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Set <code>type</code> on every column while you are there. A grid
          wants to know what a value <em>is</em>, not just how it looks: the
          type picks the comparator, the filter operators, the editor, and — as
          below — the wording of the sort menu.
        </Typography>
      </Stack>

      <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          A row&apos;s outcome is a function, not a prop
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <code>hover</code> and <code>selected</code> are about the reader, and
          the grid already models both. What is left is the outcome the record
          carries, and since there is no per-row markup to hang a prop on it
          arrives as <code>rowState</code>, a function of the row:{' '}
          <code>error</code> tints it, <code>success</code> tints it,{' '}
          <code>disabled</code> greys its ink and its hairline. It composes with{' '}
          <code>getRowClassName</code> rather than replacing it.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Selection is drawn as a bracket rather than a heavier fill:{' '}
          <code>selected</code> and hover paint the same <code>card 1</code>{' '}
          surface, and what tells them apart is a{' '}
          <code>border.primary.defaultHover</code> (Figma <code>border/primary/2</code>) hairline above and below
          the row.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <code>disabled</code> is ink only, deliberately. A row that looks
          unavailable but still answers the keyboard is worse than one that
          looks ordinary, so pair it with <code>isRowSelectable</code> and{' '}
          <code>isCellEditable</code>, which are the props that actually refuse.
        </Typography>
      </Stack>

      <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Sorting: the affordance, and the menu behind it
        </Typography>
        <Typography variant="body2" color="text.secondary">
          A sortable header tints under the pointer and shows a two-headed{' '}
          <code>ArrowsDownUp</code> — sortable, not sorted. The column the grid
          is actually sorted by keeps a single arrow, visible at rest, pointing
          the way it went. That is the same pair <code>TableSortLabel</code>{' '}
          draws, and the reason the glyph is chosen rather than rotated: MUI
          turns one arrow through 180° to mean both directions, and a two-headed
          glyph rotated is still two-headed.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The menu button beside the label opens the column&apos;s menu, which
          is where sorting is offered explicitly. Its rows are worded from the
          column&apos;s <code>type</code> — &ldquo;Low to high&rdquo; for a
          number, &ldquo;A to Z&rdquo; for a string, &ldquo;Old to new&rdquo;
          for a date — and all three are always present, with{' '}
          <code>Clear sort</code> greyed when there is nothing to clear. MUI
          would drop the rows it considers unavailable and let the menu change
          height under the pointer.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          One thing to expect: the tint carries 4px of padding, so a sortable
          column&apos;s label sits 12 from the cell&apos;s edge where a plain
          one sits 8. It is the same 4 <code>TableSortLabel</code> carries, and
          it is left alone rather than corrected quietly.
        </Typography>
      </Stack>

      <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          The footer counts, in your noun
        </Typography>
        <Typography variant="body2" color="text.secondary">
          MUI&apos;s footer is <code>TablePagination</code>: a rows-per-page{' '}
          <code>Select</code>, a count, two bare arrows. This one is a count and
          three filled 32px buttons, written rather than restyled.{' '}
          <code>rowNoun</code> is what it counts in —{' '}
          <code>1–20 of 278 invoices</code>.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          What differs between its three states is which controls <em>exist</em>{' '}
          rather than which are greyed: on the first page the jump-to-start is
          absent, not disabled, and previous is present and dead. So the button
          appears once you have left page one and disappears when you come back.
          There is no jump-to-end — with a server-side count there may not be an
          end to jump to.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Two edge cases: an empty set reads <code>0 invoices</code>, and an
          unknown total — server pagination reporting <code>rowCount={-1}</code>{' '}
          — drops the total and reads <code>1–20</code>, rather than inventing
          copy for a number nobody has. And there is no rows-per-page control at
          all, so set the page size through <code>initialState</code>.
        </Typography>
      </Stack>
    </>
  );
}

DataGridNotes.displayName = 'DataGridNotes';
