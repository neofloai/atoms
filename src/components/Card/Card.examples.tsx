import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for the Card family. Read by `scripts/generate.ts` and
 * served through the MCP `get_component` tool and the docs site.
 *
 * The props table covers all five parts. Region props are prefixed with
 * the component that owns them, since the table is one flat list.
 */
export const data: ComponentExamplesData = {
  name: 'Card',
  category: 'Layout',
  tagline:
    'A bordered surface that groups related content. One locked shell — no variants — filled by composing a header, body, media, and actions.',
  figmaUrl:
    'https://www.figma.com/design/iDCodnA5uZ14EdttjSMCT1/Product-Design-System?node-id=3648-24947&m=dev',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      default: '—',
      description:
        'The regions inside the card, in the order they should stack. There is no variant prop: the eight cells in Figma differ only by what is composed here, so a card is built rather than configured.',
    },
    {
      name: 'component',
      type: 'ElementType',
      default: "'div'",
      description:
        'Element rendered at the root, fully type-checked so the swapped element’s own props are accepted. A card is usually an `article` or a `section` rather than a bare `div`.',
    },
    {
      name: 'sx',
      type: 'SxProps<Theme>',
      default: '—',
      description:
        'One-off styling. Use it for the card’s width and for the space around it; the surface, border, and radius already come from tokens. There is deliberately no `elevation`, `variant`, `raised`, or `square` — the design draws one card treatment, so those are removed from the type rather than left to be silently ignored.',
    },
    {
      name: 'CardHeader title',
      type: 'ReactNode',
      default: '—',
      description:
        'The first line of the header, at 16/24 medium. Rendered in a `<span>` by default; pass `slotProps={{ title: { component: "h2" } }}` to make it a real heading, which is usually what a card wants.',
    },
    {
      name: 'CardHeader subheader',
      type: 'ReactNode',
      default: '—',
      description:
        'The description under the title, at 13/20 regular in the caption colour. Sits flush against the title — the design specifies no gap between the two lines, so their line-heights do the spacing.',
    },
    {
      name: 'CardHeader action',
      type: 'ReactNode',
      default: '—',
      description:
        'A control pushed to the trailing edge of the header, for an overflow menu or a close button. Not the place for a badge that belongs beside the title — MUI stretches the title block to fill the row, so anything here lands at the far edge. See the metric example for that layout.',
    },
    {
      name: 'CardHeader avatar',
      type: 'ReactNode',
      default: '—',
      description:
        'An avatar or icon before the title. Unlike MUI’s default, adding one does not shrink the title: the 16/24 ramp is applied through the title’s class, so it holds either way.',
    },
    {
      name: 'CardHeader disableTypography',
      type: 'boolean',
      default: 'false',
      description:
        'Stops the header wrapping `title` and `subheader` in Typography. The two type ramps are applied by class rather than by variant, so they still land on whatever you pass — set this only when you need different elements entirely.',
    },
    {
      name: 'CardMedia component',
      type: 'ElementType',
      default: "'div'",
      description:
        'Set to `img` (with `src` and `alt`) for a real image element, which is what the design draws. The default `div` takes a CSS background through `image` instead, and has no intrinsic height — it collapses to 0px unless you give it one.',
    },
    {
      name: 'CardMedia image',
      type: 'string',
      default: '—',
      description:
        'A URL applied as a `background-image`, cover-fitted and centred. Prefer `component="img"` with `src` unless the media is genuinely decorative; a background image cannot carry alternative text.',
    },
    {
      name: 'CardActions disableSpacing',
      type: 'boolean',
      default: 'false',
      description:
        'Removes the 8px gap between the action row’s children. The gap is `Scale/200` from the design, so leave it on unless you are laying the row out yourself.',
    },
  ],
  examples: [
    {
      title: 'A card with a title, a description, and actions',
      description:
        'Figma’s `text` header over its action row. Nothing sets the 16px inset or the 16px gap between them — the regions bring their own padding, and a region that follows another padded region drops its top padding so the two share one gutter.',
      code: [
        "import { Button, Card, CardActions, CardHeader } from '@neofloai/atoms';",
        '',
        '<Card component="article" sx={{ maxWidth: 400 }}>',
        '  <CardHeader',
        '    title="Lizards"',
        '    subheader="A widespread group of squamate reptiles, with over 6,000 species."',
        '  />',
        '  <CardActions>',
        '    <Button appearance="outline" variant="secondary" size="sm">Share</Button>',
        '    <Button size="sm">Learn more</Button>',
        '  </CardActions>',
        '</Card>',
      ].join('\n'),
    },
    {
      title: 'Media running edge to edge',
      description:
        'The media region sits outside the padded box, so it reaches the card’s edges and is clipped to its corners. The height is a content dimension rather than a token — Figma uses 124px here and 132px on the metric card, so the caller sets it.',
      code: [
        "import { Card, CardHeader, CardMedia } from '@neofloai/atoms';",
        '',
        '<Card sx={{ maxWidth: 400 }}>',
        '  <CardHeader title="Lizards" subheader="Recorded in Queensland, 2026." />',
        '  <CardMedia',
        '    component="img"',
        '    src="/lizard.jpg"',
        '    alt="A saltwater crocodile resting in shallow water"',
        '    sx={{ height: 124 }}',
        '  />',
        '</Card>',
      ].join('\n'),
    },
    {
      title: 'Metric card',
      description:
        'Figma’s `info` header, built as a composition rather than a `CardHeader`. The badge sits directly beside the number, 8px away — `CardHeader`’s `action` slot would push it to the far edge of the card instead, because MUI stretches the title block to fill the row.',
      code: [
        "import { ArrowUpRightIcon } from '@neofloai/atoms/icons';",
        "import { Card, CardContent, Chip, IconButton, Stack, Typography } from '@neofloai/atoms';",
        '',
        '<Card sx={{ maxWidth: 400 }}>',
        '  <CardContent>',
        '    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>',
        '      <Typography variant="h4">420%</Typography>',
        '      <IconButton variant="success" size="sm" aria-label="Trending up">',
        '        <ArrowUpRightIcon />',
        '      </IconButton>',
        '    </Stack>',
        '    <Typography variant="body1" color="text.secondary">Increase in fat</Typography>',
        '    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", mt: 2 }}>',
        '      <Chip size="sm" variant="success" icon={<ArrowUpRightIcon />} label="5%" />',
        '      <Typography variant="body2" color="text.secondary">vs prev 30d</Typography>',
        '    </Stack>',
        '  </CardContent>',
        '</Card>',
      ].join('\n'),
    },
    {
      title: 'Body content that is not a header',
      description:
        '`CardContent` is the padded region for anything else. MUI pads its last child’s bottom to 24px; this one is symmetric at 16, so a card of pure text does not measure 8px taller than the same card with actions after it.',
      code: [
        "import { Card, CardContent, CardHeader, Typography } from '@neofloai/atoms';",
        '',
        '<Card sx={{ maxWidth: 400 }}>',
        '  <CardHeader title="Storage" />',
        '  <CardContent>',
        '    <Typography variant="body1">42.1 GB of 100 GB used</Typography>',
        '  </CardContent>',
        '</Card>',
      ].join('\n'),
    },
    {
      title: 'A list inside a card',
      description:
        'Rows go after the padded box so they reach both edges, and each row brings its own 16px inset. The rule between rows is drawn from `border.default.default` rather than the card’s own border token — `border.layers.card1` on `surface.layers.card1` is a 1.05:1 hairline, which is invisible.',
      code: [
        "import { Avatar, Card, CardHeader, Divider, Stack, Typography } from '@neofloai/atoms';",
        '',
        '<Card sx={{ maxWidth: 400 }}>',
        '  <CardHeader title="Reviewers" />',
        '  <Stack component="ul" sx={{ listStyle: "none", p: 0, m: 0 }} divider={<Divider component="li" />}>',
        '    {reviewers.map((person) => (',
        '      <Stack',
        '        key={person.id}',
        '        component="li"',
        '        direction="row"',
        '        spacing={1}',
        '        sx={{ alignItems: "center", p: 2 }}',
        '      >',
        '        <Avatar size="md">{person.initials}</Avatar>',
        '        <Stack>',
        '          <Typography variant="body1">{person.name}</Typography>',
        '          <Typography variant="body2" color="text.secondary">{person.role}</Typography>',
        '        </Stack>',
        '      </Stack>',
        '    ))}',
        '  </Stack>',
        '</Card>',
      ].join('\n'),
    },
    {
      title: 'Promoting the title to a real heading',
      description:
        'The title renders as a `<span>` by default, so a page of cards has no headings in it. Give the card a semantic root and promote the title to a real heading at the level the surrounding page uses.',
      code: [
        "import { Card, CardHeader } from '@neofloai/atoms';",
        '',
        '<Card component="section" aria-labelledby="usage-title">',
        '  <CardHeader',
        '    component="header"',
        '    title="Usage"',
        '    subheader="Billing period to date"',
        '    slotProps={{ title: { id: "usage-title", component: "h2" } }}',
        '  />',
        '</Card>',
      ].join('\n'),
    },
    {
      title: 'One action per edge',
      description:
        'The action row is right-aligned, which is what the design draws. A card that needs an action at each edge is not a case Figma covers, so there is no prop for it — reach for `sx` rather than a wrapper.',
      code: [
        "import { Button, Card, CardActions, CardHeader } from '@neofloai/atoms';",
        '',
        '<Card>',
        '  <CardHeader title="Trial ending" subheader="3 days left on the Pro plan." />',
        '  <CardActions sx={{ justifyContent: "space-between" }}>',
        '    <Button appearance="text" size="sm">Compare plans</Button>',
        '    <Button size="sm">Upgrade</Button>',
        '  </CardActions>',
        '</Card>',
      ].join('\n'),
    },
    {
      title: 'A grid of cards',
      description:
        'Cards have no width of their own — they fill what they are given. `Grid` sets the column count and the gutter, and every card in a row matches height because a grid item stretches by default.',
      code: [
        "import { Card, CardHeader, Grid } from '@neofloai/atoms';",
        '',
        '<Grid container spacing={3}>',
        '  {metrics.map((metric) => (',
        '    <Grid key={metric.id} size={{ xs: 12, sm: 6, md: 4 }}>',
        '      <Card component="article" sx={{ height: "100%" }}>',
        '        <CardHeader title={metric.value} subheader={metric.label} />',
        '      </Card>',
        '    </Grid>',
        '  ))}',
        '</Grid>',
      ].join('\n'),
    },
  ],
  dos: [
    'Compose a card from the regions — `CardHeader`, `CardContent`, `CardMedia`, `CardActions` — rather than reaching for a variant prop, because the eight cells in Figma differ only by what is inside them',
    'Let the regions bring their own padding; a region that follows another padded region already drops its top padding, so two stacked regions sit 16px apart',
    'Put `CardMedia` outside the padded regions so it runs edge to edge and is clipped to the card’s corners, which is how every `image` cell is drawn',
    'Set `component="article"` or `component="section"` on the card, and promote the header title to a real heading — a card is a group, and nothing else in the markup says so',
    'Give `CardMedia` an explicit height, since neither of the design’s two values (124px and 132px) is a token and a background-image region has no intrinsic height at all',
    'Use `component="img"` with `alt` for media that carries meaning, and the `image` prop only when the picture is genuinely decorative',
    'Set the card’s width from the layout around it — a `Grid` column, or `sx={{ maxWidth: 400 }}` — rather than expecting the card to bring one',
  ],
  donts: [
    'Don’t reach for `elevation`, `variant`, `raised`, or `square` — the design draws one card treatment, so they are removed from the type instead of quietly doing nothing',
    'Don’t pass a badge that belongs beside the title as `CardHeader`’s `action`; MUI stretches the title block to fill the row, so it lands at the far edge of the card',
    'Don’t make the whole card clickable — there is no hover, pressed, or focus cell anywhere in the Figma set, so a card-wide action area would need three invented colours. Put the action on a `Button` inside `CardActions`',
    'Don’t nest a card inside a card on the same surface; `surface.layers.card2` and `card3` exist for a nested panel, and two `card1` surfaces with matching borders read as one box',
    'Don’t separate rows inside a card with `border.layers.card1` — on `surface.layers.card1` that is a 1.05:1 hairline. Use `Divider`, which is drawn from a token that holds on every surface',
    'Don’t add a shadow to lift a card off the page; elevation in this system belongs to things that float over content, like menus and dialogs',
    'Don’t put a page-level heading level on a card title just because it looks right — match the level to where the card sits in the document outline',
  ],
  relatedComponents: [
    'Button',
    'IconButton',
    'Chip',
    'Divider',
    'Grid',
    'Avatar',
  ],
};
