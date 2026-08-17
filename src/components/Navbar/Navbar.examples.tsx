import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `Navbar`. Read by `scripts/generate.ts` and served
 * through the MCP `get_component` tool and the docs site.
 *
 * No `figmaUrl`: the Product Design System file has no app-bar cell. The
 * surface is the shared panel treatment and the 48px height is measured
 * from the Vendor Query shell — see the constants in `Navbar.tsx`.
 */
export const data: ComponentExamplesData = {
  name: 'Navbar',
  category: 'Navigation',
  tagline:
    'The bar across the top of an app, in two heights — a 48px app bar or a 72px page header. On the `card 2` chrome surface a Drawer shares, closed by a single rule along the bottom. Wraps MUI’s AppBar with its Toolbar folded in, so children are the row.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      default: '—',
      description:
        'The contents of the row. It is a flex container with no gap of its own, so space children with `Box sx={{ flex: 1 }}` between groups or `sx={{ ml: "auto" }}` on the first trailing item.',
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      default: "'sm'",
      description:
        'How tall the bar is, and therefore what kind of bar it is. `sm` is the 48px app bar — one row of controls belonging to the whole screen. `md` is the 72px page header, tall enough for a `NavbarTitle` with a line of context under it plus the actions that apply to the record on screen. Only the height differs; surface, rule, gutter and row are identical.',
    },
    {
      name: 'position',
      type: "'static' | 'sticky' | 'fixed' | 'absolute' | 'relative'",
      default: "'static'",
      description:
        'How the bar sits on the page. `static` keeps it in flow above the content — the app-shell case, and the reason this is the default rather than MUI’s `fixed`. Use `sticky` for a bar that should stay put as the page scrolls; `fixed` and `absolute` take the bar out of flow, so the page needs its own spacer underneath — `NAVBAR_HEIGHT_PX` is exported for exactly that.',
    },
    {
      name: 'disableGutters',
      type: 'boolean',
      default: 'false',
      description:
        'Drop the 24px inline gutter so the first and last children sit flush with the page edge. Reach for it when the bar’s own children already carry the inset — a full-bleed `Tabs`, for instance.',
    },
    {
      name: 'component',
      type: 'ElementType',
      default: "'header'",
      description:
        'Root element. Already a `header`, which is usually right; swap it when the bar is nested inside one that exists.',
    },
    {
      name: 'slotProps',
      type: '{ toolbar }',
      default: '{}',
      description:
        'Props for the row inside the bar. `toolbar: { component: "nav" }` is the usual one, for a bar that is genuinely the page’s navigation rather than a title strip.',
    },
    {
      name: 'sx',
      type: 'SxProps',
      default: '—',
      description:
        'The bar is drawn flat because its bottom rule does the separating. `sx={{ boxShadow: 2 }}` is the seam if a `sticky` bar needs to lift off content scrolling under it.',
    },
    {
      name: 'NavbarTitle children',
      type: 'ReactNode',
      default: '—',
      description:
        'The page title, at the `h5` ramp in medium weight and heading ink. Rendered as a real `h1` inside the block, and truncated with an ellipsis rather than wrapped — the bar’s height is fixed, so a second line would be clipped instead.',
    },
    {
      name: 'NavbarTitle meta',
      type: '{ icon?, label }[]',
      default: '—',
      description:
        'The line under the title — a reference, a name, a date. Each item is an optional 16px glyph and a label at the `b2` ramp in muted ink, and the block draws a vertical rule between each pair. Omit it for a bar with nothing but a title.',
    },
  ],
  examples: [
    {
      title: 'An app bar with a title and trailing actions',
      description:
        'The shape almost every bar takes: what the screen is on the left, what you can do to it on the right, and a flexible gap doing the separating. The gap is composition rather than a prop, so a tight cluster of icon buttons chooses its own spacing.',
      code: [
        '<Navbar>',
        '  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>',
        '    Query log',
        '  </Typography>',
        '  <Box sx={{ flex: 1 }} />',
        '  <IconButton variant="secondary" appearance="text" size="sm" aria-label="Search">',
        '    <MagnifyingGlassIcon />',
        '  </IconButton>',
        '  <IconButton variant="secondary" appearance="text" size="sm" aria-label="Notifications">',
        '    <BellIcon />',
        '  </IconButton>',
        '  <Avatar size="sm">AV</Avatar>',
        '</Navbar>',
      ].join('\n'),
    },
    {
      title: 'The shell: a full-height rail, the bar beside it',
      description:
        'Navbar and Drawer are painted from the same surface and the same edge token, so they meet at the corner without a seam. The arrangement is the part to get right, and it is easy to get backwards: the rail runs the full height of the app and the bar starts where the rail ends, so the outer box is a **row** — rail, then a column — not a bar with a row under it. Two things follow. The brand mark is the top-left corner of the screen, and the bar cannot hold anything that has to line up with the rail, which is why the collapse toggle sits at its leading edge: it is the one control whose position does not move when the rail folds. The toggle drives the rail through `size`, so the panel and the space it reserves fold together. This is the shell of the Dashboard pattern, which is where to start for a whole screen rather than assembling one from here.',
      code: [
        '<Stack direction="row" sx={{ height: "100vh" }}>',
        '  <Drawer variant="permanent" size={collapsed ? 64 : "sm"}>',
        '    <NavOfYourOwn collapsed={collapsed} />',
        '  </Drawer>',
        '',
        '  <Stack sx={{ flex: 1, minWidth: 0 }}>',
        '    <Navbar>',
        '      <IconButton',
        '        variant="secondary"',
        '        appearance="text"',
        '        size="sm"',
        '        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}',
        '        onClick={() => setCollapsed((previous) => !previous)}',
        '      >',
        '        <SidebarSimpleIcon />',
        '      </IconButton>',
        '    </Navbar>',
        '',
        '    <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: 3 }}>',
        '      {children}',
        '    </Box>',
        '  </Stack>',
        '</Stack>',
      ].join('\n'),
    },
    {
      title: 'A page header, with the record and its actions',
      description:
        'The `md` bar. A `NavbarTitle` carries the page name and the line of context under it; the actions after the spacer are ordinary `Button`s, so their roles say what they do — `error` outline for the destructive one, contained primary for the one that moves the record forward. The bar itself is the same surface and rule as the app bar above it, only taller.',
      code: [
        '<Navbar size="md">',
        '  <IconButton',
        '    variant="secondary"',
        '    appearance="text"',
        '    size="sm"',
        '    aria-label="Open navigation"',
        '  >',
        '    <ListIcon />',
        '  </IconButton>',
        '',
        '  <NavbarTitle',
        '    meta={[',
        '      { icon: <TicketIcon size={NAVBAR_META_ICON_PX} />, label: "#345" },',
        '      { icon: <UserIcon size={NAVBAR_META_ICON_PX} />, label: "Nike Sales" },',
        '      { icon: <CalendarBlankIcon size={NAVBAR_META_ICON_PX} />, label: "05 Jun 2025" },',
        '    ]}',
        '    sx={{ ml: 3 }}',
        '  >',
        '    Matching',
        '  </NavbarTitle>',
        '',
        '  <Box sx={{ flex: 1 }} />',
        '',
        '  <Stack direction="row" sx={{ gap: 1.5 }}>',
        '    <Button appearance="outline" size="sm" startIcon={<StarFourIcon size={16} />}>',
        '      Ask Neo',
        '    </Button>',
        '    <Button variant="error" appearance="outline" size="sm">',
        '      Reject',
        '    </Button>',
        '    <Button size="sm" endIcon={<ArrowRightIcon size={16} />}>',
        '      Validate',
        '    </Button>',
        '  </Stack>',
        '</Navbar>',
      ].join('\n'),
    },
    {
      title: 'A page header with nothing but a title',
      description:
        'Drop `meta` and the block is one line, still vertically centred in the 72px bar. Worth reaching for when the page has no record behind it — a settings screen, a list — and the extra height is holding actions rather than context.',
      code: [
        '<Navbar size="md">',
        '  <NavbarTitle>Vendor details</NavbarTitle>',
        '  <Box sx={{ flex: 1 }} />',
        '  <Button size="sm">Add vendor</Button>',
        '</Navbar>',
      ].join('\n'),
    },
    {
      title: 'Staying put as the page scrolls',
      description:
        '`sticky` keeps the bar in flow — so no spacer is needed — while pinning it to the top once the page moves under it. That is the one case a flat bar reads badly, which is why the shadow is reachable rather than locked away.',
      code: [
        '<Navbar position="sticky" sx={{ boxShadow: 2 }}>',
        '  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Vendors</Typography>',
        '</Navbar>',
      ].join('\n'),
    },
    {
      title: 'A real nav landmark, flush to the page edge',
      description:
        'The root is a `header`, which is right for a title strip and not for a bar whose whole job is navigation. Name the row `nav` and drop the gutter when the children — a `Tabs` here — already carry their own inset.',
      code: [
        '<Navbar disableGutters slotProps={{ toolbar: { component: "nav" } }}>',
        '  <Tabs value={tab} onChange={(_, next) => setTab(next)}>',
        '    <Tab label="All" />',
        '    <Tab label="Open" count={12} />',
        '    <Tab label="Resolved" />',
        '  </Tabs>',
        '</Navbar>',
      ].join('\n'),
    },
  ],
  dos: [
    'Leave `position` at `static` for an app shell, and use `sticky` when the bar should follow the page',
    'Use `size="md"` with a `NavbarTitle` when the bar names a page or a record, and `size="sm"` when it only carries controls',
    'Put the record’s facts in `meta` rather than in the title — a title that reads "Matching #345 · Nike Sales" cannot truncate gracefully',
    'Put one `Box sx={{ flex: 1 }}` between the leading group and the trailing one, so the bar has a single split point',
    'Use `appearance="text"` icon buttons in the bar — the bar is already a surface, so contained buttons read as a second layer on it',
    'Pair it with a `permanent` Drawer for the standard shell — the rail runs the full height and the bar starts where the rail ends, so the outer box is a row (rail, then a column) and the two share their surface and edge tokens',
    'Name the row with `slotProps={{ toolbar: { component: "nav" } }}` when the bar carries the page’s navigation',
  ],
  donts: [
    "Don't use `position=\"fixed\"` without a spacer under it — the first thing on the page will start behind the bar. `<Box sx={{ height: NAVBAR_HEIGHT_PX }} />` is the spacer",
    "Don't recolour the bar; there is one surface for every container in the system, and `color` is removed from the type rather than left to do nothing",
    "Don't add a shadow to a `static` bar — the bottom rule is the separation, and a shadow on a bar that cannot scroll under anything is decoration",
    "Don't stack rows inside a `sm` bar to fit a title and its context — that is what `size=\"md\"` and `NavbarTitle` are, and a third row belongs in a `Tabs` bar beneath the header",
    "Don't put a page's actions inside `NavbarTitle` — it owns the title and its context, and the roles of the buttons beside it are decisions about the page",
    "Don't put more than one primary action in the bar — it is the screen's chrome, not its call to action",
    "Don't run the bar across the top of the whole window with the rail underneath it — at `sm` the rail owns the full height and the bar spans the content column only, so the brand mark is the app's top-left corner. `size=\"md\"` is the one place the bar spans the top, and that is a different screen rather than a second band on this one",
  ],
  relatedComponents: ['Drawer', 'Tabs', 'IconButton', 'Avatar', 'Menu'],
};
