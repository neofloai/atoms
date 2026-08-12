import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `Grid`. Read by `scripts/generate.ts` and served
 * through the MCP `get_component` tool and the docs site.
 *
 * Each `examples` entry is paired with a live preview on the docs page
 * by matching `title` (see `app/(docs)/components/grid/_components/
 * demos.tsx`, which fails the build if a title has no preview). So the
 * code below must stay literally renderable — it is the same snippet
 * the page draws, not a paraphrase of it.
 *
 * No `figmaUrl`: Grid is a layout primitive with no visual design of its
 * own, so it has no counterpart in the Product Design System file.
 */
export const data: ComponentExamplesData = {
  name: 'Grid',
  category: 'Layout',
  tagline:
    'Responsive layout grid — subdivides a row into twelve columns that can be reassigned at each breakpoint.',
  props: [
    {
      name: 'container',
      type: 'boolean',
      default: 'false',
      description:
        'Gives the component flex *container* behaviour. Every Grid is an item; only a container arranges them, so items must have a container above them to do anything.',
    },
    {
      name: 'size',
      type: "number | 'auto' | 'grow' | false | responsive",
      default: '—',
      description:
        'How many of the container\'s columns this item occupies. `"auto"` sizes to the content, `"grow"` takes an equal share of what is left. Accepts a breakpoint object — `{ xs: 12, md: 6 }`.',
    },
    {
      name: 'offset',
      type: "number | 'auto' | responsive",
      default: '—',
      description:
        'Pushes an item to the right by a number of columns. `"auto"` pushes it as far right as the row allows. Accepts a breakpoint object.',
    },
    {
      name: 'spacing',
      type: 'number | string | responsive',
      default: '0',
      description:
        'Gap between items, as an index into the theme spacing scale (`spacing={2}` is 16px, not 2px). Container-only. Accepts a breakpoint object.',
    },
    {
      name: 'rowSpacing',
      type: 'number | string | responsive',
      default: '—',
      description:
        'Vertical gap only. Overrides `spacing` on that axis.',
    },
    {
      name: 'columnSpacing',
      type: 'number | string | responsive',
      default: '—',
      description:
        'Horizontal gap only. Overrides `spacing` on that axis.',
    },
    {
      name: 'columns',
      type: 'number | number[] | responsive',
      default: '12',
      description:
        'The number of columns the container divides into, which is what `size` and `offset` are measured against. Accepts a breakpoint object.',
    },
    {
      name: 'direction',
      type: "'row' | 'row-reverse' | responsive",
      default: "'row'",
      description:
        'The `flex-direction` of the container. Only the two row values exist — Grid subdivides a layout into columns, not rows. Use `Stack` for vertical layouts.',
    },
    {
      name: 'wrap',
      type: "'wrap' | 'nowrap' | 'wrap-reverse'",
      default: "'wrap'",
      description:
        'The `flex-wrap` of the container, applied at every breakpoint.',
    },
    {
      name: 'sx',
      type: 'SxProps<Theme> | ((theme) => SxProps) | Array<…>',
      default: '—',
      description:
        'Styles resolved against the Neoflo theme. Use it for the properties Grid has no prop for, such as `alignItems` and `justifyContent`.',
    },
    {
      name: 'component',
      type: 'ElementType',
      default: "'div'",
      description:
        'Element or component rendered at the root. Polymorphic — `component="ul"` also types the list props.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      default: '—',
      description:
        'The content. On a container these should be Grid items; on an item, anything.',
    },
    {
      name: 'ref',
      type: 'Ref<HTMLElement>',
      default: '—',
      description: 'Forwarded to the root element.',
    },
  ],
  examples: [
    {
      title: 'Basic grid',
      description:
        'A `container` divides its width into twelve columns and arranges its items across them; each item declares how many columns it occupies. Items that do not fit on the current row wrap to the next one, so 8 + 4 + 4 + 8 reads as two rows.',
      code: [
        '// Filler styling, reused across the examples below.',
        "const tile = { p: 2, borderRadius: 1, bgcolor: 'action.hover', textAlign: 'center' };",
        '',
        '<Grid container spacing={2}>',
        '  <Grid size={8}>',
        '    <Box sx={tile}>size=8</Box>',
        '  </Grid>',
        '  <Grid size={4}>',
        '    <Box sx={tile}>size=4</Box>',
        '  </Grid>',
        '  <Grid size={4}>',
        '    <Box sx={tile}>size=4</Box>',
        '  </Grid>',
        '  <Grid size={8}>',
        '    <Box sx={tile}>size=8</Box>',
        '  </Grid>',
        '</Grid>',
      ].join('\n'),
    },
    {
      title: 'Multiple breakpoints',
      description:
        'Give `size` a breakpoint object to change the column span as the viewport grows. A value applies from its breakpoint upwards until another overrides it, so `{ xs: 6, md: 8 }` means half-width on phones and two-thirds from 900px up.',
      code: [
        '<Grid container spacing={2}>',
        '  <Grid size={{ xs: 6, md: 8 }}>',
        '    <Box sx={tile}>xs=6 md=8</Box>',
        '  </Grid>',
        '  <Grid size={{ xs: 6, md: 4 }}>',
        '    <Box sx={tile}>xs=6 md=4</Box>',
        '  </Grid>',
        '  <Grid size={{ xs: 6, md: 4 }}>',
        '    <Box sx={tile}>xs=6 md=4</Box>',
        '  </Grid>',
        '  <Grid size={{ xs: 6, md: 8 }}>',
        '    <Box sx={tile}>xs=6 md=8</Box>',
        '  </Grid>',
        '</Grid>',
      ].join('\n'),
    },
    {
      title: 'Row and column spacing',
      description:
        '`rowSpacing` and `columnSpacing` set the two axes independently, each overriding `spacing` on its own axis — useful when a grid needs to breathe horizontally but stay tight vertically.',
      code: [
        '<Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>',
        '  <Grid size={6}>',
        '    <Box sx={tile}>1</Box>',
        '  </Grid>',
        '  <Grid size={6}>',
        '    <Box sx={tile}>2</Box>',
        '  </Grid>',
        '  <Grid size={6}>',
        '    <Box sx={tile}>3</Box>',
        '  </Grid>',
        '  <Grid size={6}>',
        '    <Box sx={tile}>4</Box>',
        '  </Grid>',
        '</Grid>',
      ].join('\n'),
    },
    {
      title: 'Responsive values',
      description:
        'The column count itself can change per breakpoint. Four columns on phones, eight from `sm`, twelve from `md` — with items spanning two, four, and four — gives one, two, then three items per row without a single media query.',
      code: [
        '<Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>',
        '  {[1, 2, 3, 4, 5, 6].map((n) => (',
        '    <Grid key={n} size={{ xs: 2, sm: 4, md: 4 }}>',
        '      <Box sx={tile}>{n}</Box>',
        '    </Grid>',
        '  ))}',
        '</Grid>',
      ].join('\n'),
    },
    {
      title: 'Auto-layout',
      description:
        '`size="grow"` divides whatever space the sized items leave over, equally. Use it instead of working out fractions by hand — the two growing items here each take a quarter, because the middle one has taken half.',
      code: [
        '<Grid container spacing={2}>',
        '  <Grid size="grow">',
        '    <Box sx={tile}>size=grow</Box>',
        '  </Grid>',
        '  <Grid size={6}>',
        '    <Box sx={tile}>size=6</Box>',
        '  </Grid>',
        '  <Grid size="grow">',
        '    <Box sx={tile}>size=grow</Box>',
        '  </Grid>',
        '</Grid>',
      ].join('\n'),
    },
    {
      title: 'Variable width content',
      description:
        '`size="auto"` sizes an item to its own content rather than to a column count — the way to keep a label or a badge exactly as wide as it needs to be while the rest of the row absorbs the remainder.',
      code: [
        '<Grid container spacing={2}>',
        '  <Grid size="auto">',
        '    <Box sx={tile}>size=auto</Box>',
        '  </Grid>',
        '  <Grid size={6}>',
        '    <Box sx={tile}>size=6</Box>',
        '  </Grid>',
        '  <Grid size="grow">',
        '    <Box sx={tile}>size=grow</Box>',
        '  </Grid>',
        '</Grid>',
      ].join('\n'),
    },
    {
      title: 'Columns',
      description:
        'Twelve is the default, not a rule. Set `columns` on the container to divide it differently — the same eight-column item is two-thirds of a twelve-column grid but half of a sixteen-column one.',
      code: [
        '<Grid container spacing={2} columns={16}>',
        '  <Grid size={8}>',
        '    <Box sx={tile}>size=8 of 16</Box>',
        '  </Grid>',
        '  <Grid size={8}>',
        '    <Box sx={tile}>size=8 of 16</Box>',
        '  </Grid>',
        '</Grid>',
      ].join('\n'),
    },
    {
      title: 'Offset',
      description:
        'Use `offset` to leave columns empty before an item rather than padding a neighbour to fake it. A number offsets by that many columns; `"auto"` pushes the item as far right as the row allows.',
      code: [
        '<Grid container spacing={2}>',
        '  <Grid size={4} offset={4}>',
        '    <Box sx={tile}>size=4 offset=4</Box>',
        '  </Grid>',
        '  <Grid size={12}>',
        '    <Box sx={tile}>size=12</Box>',
        '  </Grid>',
        '  <Grid size={3} offset="auto">',
        '    <Box sx={tile}>size=3 offset=auto</Box>',
        '  </Grid>',
        '</Grid>',
      ].join('\n'),
    },
    {
      title: 'Nested grid',
      description:
        'A container that is a *direct* child of another container inherits its `columns` and `spacing`, so a subdivision does not restate them. Put any non-Grid element in between and the inner container starts over as a new root.',
      code: [
        '<Grid container spacing={2}>',
        '  <Grid size={6}>',
        '    <Box sx={tile}>size=6</Box>',
        '  </Grid>',
        '  {/* Inherits columns={12} and spacing={2} from the container above. */}',
        '  <Grid container size={6}>',
        '    <Grid size={6}>',
        '      <Box sx={tile}>nested size=6</Box>',
        '    </Grid>',
        '    <Grid size={6}>',
        '      <Box sx={tile}>nested size=6</Box>',
        '    </Grid>',
        '  </Grid>',
        '</Grid>',
      ].join('\n'),
    },
    {
      title: 'Vertical layouts use Stack',
      description:
        '`direction="column"` is not supported — Grid exists to subdivide a layout into columns. When a column needs its own rows, put a `Stack` inside the Grid item; that also keeps the vertical gap on the token scale.',
      code: [
        '<Grid container spacing={2}>',
        '  <Grid size={4}>',
        '    <Stack spacing={2}>',
        '      <Box sx={tile}>Column 1 - Row 1</Box>',
        '      <Box sx={tile}>Column 1 - Row 2</Box>',
        '      <Box sx={tile}>Column 1 - Row 3</Box>',
        '    </Stack>',
        '  </Grid>',
        '  <Grid size={8}>',
        "    <Box sx={{ ...tile, height: '100%', boxSizing: 'border-box' }}>",
        '      Column 2',
        '    </Box>',
        '  </Grid>',
        '</Grid>',
      ].join('\n'),
    },
  ],
  dos: [
    'Wrap items in a `container` — every Grid is an item, and an item with no container above it does nothing',
    'Size items with a breakpoint object (`size={{ xs: 12, md: 6 }}`) so one declaration covers every viewport',
    'Space items with `spacing`, `rowSpacing`, or `columnSpacing` rather than margins, so the gap comes from the token scale',
    'Let `size="grow"` divide the leftover space instead of computing fractions by hand',
    'Put a `Stack` inside a Grid item when that column needs rows of its own',
  ],
  donts: [
    'Don\'t use `direction="column"` — Grid subdivides a layout into columns, not rows, and MUI does not support it; the vertical layout you want is a `Stack`',
    "Don't write `item`, `xs`, or `md` props — MUI removed them in v7, `size` replaces them, and the old props are silently ignored rather than flagged",
    "Don't expect an item to span rows or to back-fill a gap — Grid places items in order and wraps; row spanning and auto-placement need CSS Grid on a `Box`",
    "Don't nest a container inside a plain wrapper and expect it to inherit — `columns` and `spacing` only pass to a container that is a direct child",
    "Don't reach for Grid to lay out a simple row or column of siblings — that is a `Stack`, with no container and no column arithmetic",
  ],
  relatedComponents: ['Stack', 'Box', 'Container'],
};
