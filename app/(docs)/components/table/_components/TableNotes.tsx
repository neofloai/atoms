import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/**
 * The prose sections of the Table page — the six things worth knowing
 * before reading the props.
 *
 * Split out of `page.tsx` for length, and for one other reason: it keeps
 * the page a table of contents — header, notes, previews, props, examples,
 * dos and donts — rather than a wall in which the structure is hard to
 * see.
 */
export function TableNotes() {
  return (
    <>
      <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          This one, or the data grid
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This is the simple one, and it is the right default. It renders the
          markup you write, so a cell can hold anything — a <code>Chip</code>,
          an <code>Avatar</code>, a <code>Switch</code>, two lines of text — and
          it ships nothing you are not using. Reach for it for a fixed or short
          list of records: a summary on a dashboard, the lines of one invoice, a
          settings matrix.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The <code>DataGrid</code> is the one to reach for when the table is
          the screen&apos;s work rather than one of its panels: thousands of
          rows that need virtualising, sorting and filtering and pagination you
          would otherwise write by hand, inline editing, column resizing, CSV
          export, server-side data. Every one of those is a reason to switch;
          none of them is a reason to grow this component.
        </Typography>
      </Stack>

      <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          A stack of bands, not a card
        </Typography>
        <Typography variant="body2" color="text.secondary">
          There is no outer border, no radius, no shadow and no fill of its own.
          A header and six 48px rows measures 320, which is{' '}
          <code>32 + 6 × 48</code> with nothing left over — no padding around
          the set, no gap between rows. So a table takes the colour of whatever
          it is dropped onto, and the edge around it is a <code>Card</code>
          &apos;s to draw.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The one line it does draw is the hairline under each row, including
          the last, so a table ends on a rule rather than on nothing.{' '}
          <code>Accordion</code> ends its lists the same way.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Two of MUI&apos;s defaults are what make a MUI table look like one,
          and both are replaced: cells padded 16 on all four sides become 8
          either side and nothing top or bottom, and a hairline computed by
          lightening <code>palette.divider</code> 88% becomes the named{' '}
          <code>border/layers/card 1</code>. The row&apos;s own 16px inset lands
          on the first and last cell, because a <code>tr</code> cannot be
          padded.
        </Typography>
      </Stack>

      <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Density belongs to the table
        </Typography>
        <Typography variant="body2" color="text.secondary">
          One <code>size</code> — <code>sm</code> 48, <code>md</code> 56,{' '}
          <code>lg</code> 64 — reaches every row inside it, so two rows in the
          same table cannot disagree. MUI&apos;s own <code>size</code> holds two
          values where the design has three, and it is a cell padding rather
          than a row height, so it is replaced rather than mapped.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The header stays 32 in all three sizes. It is a label strip rather
          than a row of data, and the design holds it while the data breathes.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The height sits on the row and the cells carry no vertical padding at
          all, which is what lets one line and two share a row without either
          being told which it is: a 20px line over a 16px one comes to 36 and
          centres in every size, including the 48px <code>sm</code>.
        </Typography>
      </Stack>

      <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          What a cell holds is not a prop
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Of the twelve kinds of cell this table is built for, ten are content:
          a chip, a person, an amount, an attachment, a toggle, a loading
          placeholder, a button. Those are <code>Chip</code>,{' '}
          <code>Avatar</code>, <code>Switch</code> and <code>Skeleton</code> put
          in a cell, and no prop should stand between a caller and doing that.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The other two are geometry, and geometry is what drifts when every
          call site rebuilds it. <code>icon</code> holds a node 8px clear of the
          text, centred against the whole row rather than the first line — a
          glyph for a file, an <code>Avatar</code> for a person.{' '}
          <code>secondary</code> puts a muted 12/16 line hard under the first,
          with no gap, because the two leadings already hold each other apart.{' '}
          <code>NavbarTitle</code> exists for the same reason.
        </Typography>
      </Stack>

      <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          A row says two different kinds of thing
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <code>hover</code> and <code>selected</code> are about the reader:
          where the pointer is, and what they picked. <code>state</code> is
          about the data: <code>error</code> for a line that failed validation,{' '}
          <code>success</code> for one that cleared it. They combine, because a
          failed row is still selectable, and a tinted row keeps its own colour
          under the pointer instead of turning neutral.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Selection is drawn as a bracket rather than a heavier fill:{' '}
          <code>selected</code> and <code>hover</code> paint the same{' '}
          <code>card 1</code> surface, and what tells them apart is a{' '}
          <code>border/primary/2</code> hairline above and below the row. The
          lower one is the row&apos;s own. The upper one belongs to the row
          above — under collapsed borders the two share that edge, and the cell
          further up the table wins it — so the table recolours the neighbour
          rather than the selected row growing a border that would never appear.
          One consequence: a selected <em>first</em> row keeps a grey line over
          it, because <code>thead</code> and <code>tbody</code> are separate
          groups.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <code>disabled</code> greys the ink and the hairline and stops the row
          answering the pointer. It is visual only: the checkbox and the buttons
          inside keep their own <code>disabled</code>, because a row cannot
          disable a descendant it does not own.
        </Typography>
      </Stack>

      <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Sorting: the affordance ships, the mechanism does not
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <code>TableSortLabel</code> draws what the design draws — a tint
          behind the label while the pointer is on it, a two-headed{' '}
          <code>ArrowsDownUp</code> arriving with that tint for &ldquo;sortable,
          not sorted&rdquo;, and a single arrow in darker ink, visible at rest,
          for the column the table is actually sorted by. MUI rotates one arrow
          to mean both directions, which cannot distinguish a two-headed glyph
          from itself, so the glyph is picked from <code>active</code> and{' '}
          <code>direction</code> instead and <code>IconComponent</code> comes
          off the props.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The sort state and the comparator stay with the caller. Put{' '}
          <code>sortDirection</code> on the cell so the column announces its own
          order, and keep <code>onClick</code> pointed at your own data. Sorting
          that you would rather not write is the data grid&apos;s offer, not
          this component&apos;s.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          One deviation worth knowing: the tint carries 4px of padding, so a
          sortable column&apos;s label sits 12 from the cell&apos;s edge where a
          plain one sits 8. It is drawn that way in both hover variants and is
          left alone here rather than corrected quietly.
        </Typography>
      </Stack>
    </>
  );
}

TableNotes.displayName = 'TableNotes';
