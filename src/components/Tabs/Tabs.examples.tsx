import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for the tab family. Read by `scripts/generate.ts` and
 * served through the MCP `get_component` tool and the docs site.
 *
 * The props table covers both parts, `Tabs` first, and prefixes each row
 * with the component that owns it since the table is one flat list.
 */
export const data: ComponentExamplesData = {
  name: 'Tabs',
  category: 'Navigation',
  tagline:
    'One row of labels that switches which panel is showing. A hairline along the bottom, and one coloured segment of it under the tab you are on.',
  figmaUrl:
    'https://www.figma.com/design/iDCodnA5uZ14EdttjSMCT1/Product-Design-System?node-id=3463-12374&m=dev',
  props: [
    {
      name: 'Tabs value',
      type: 'any',
      default: '—',
      description:
        'The `value` of the tab that is currently selected. Pass `false` for none. This is a controlled component — MUI has no uncontrolled mode for it — so hold the value in state and update it from `onChange`.',
    },
    {
      name: 'Tabs onChange',
      type: '(event: SyntheticEvent, value: any) => void',
      default: '—',
      description:
        'Fired when a different tab is activated, with that tab’s `value` as the second argument. Not fired for the tab that is already selected.',
    },
    {
      name: 'Tabs disabled',
      type: 'boolean',
      default: 'false',
      description:
        'Disables every tab in the bar and dims the indicator with it — the Figma `enabled` axis, which is drawn on the whole row rather than one tab. Inherited by each `Tab` and not undoable from there: a tab can add its own `disabled` on top, but cannot opt back in.',
    },
    {
      name: 'Tabs variant',
      type: "'standard' | 'scrollable' | 'fullWidth'",
      default: "'standard'",
      description:
        'MUI’s overflow behaviour, not the house “colour role” meaning `variant` has on `Button` and `Chip` — this component has no colour axis for it to collide with. `scrollable` lets the row scroll and adds overflow buttons; `fullWidth` stretches the tabs to fill the bar, which suits a narrow viewport.',
    },
    {
      name: 'Tabs orientation',
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'",
      description:
        'Runs the bar down the side instead of across the top, with the rule on its inline edge and the labels left-aligned. Not drawn in Figma — the treatment mirrors the horizontal one axis for axis rather than inventing new values.',
    },
    {
      name: 'Tabs centered',
      type: 'boolean',
      default: 'false',
      description:
        'Centres the row in the bar. For wide views only, and never with `variant="scrollable"`, which MUI documents as incompatible.',
    },
    {
      name: 'Tabs scrollButtons',
      type: "'auto' | true | false",
      default: "'auto'",
      description:
        'Whether `scrollable` shows its overflow buttons — `auto` only when the tabs do not all fit. Hidden on mobile unless `allowScrollButtonsMobile`, since a touch row is swiped rather than clicked. The carets are the house Phosphor pair, not MUI’s Material chevrons.',
    },
    {
      name: 'Tabs selectionFollowsFocus',
      type: 'boolean',
      default: 'false',
      description:
        'Selects a tab as soon as the arrow keys reach it, instead of waiting for Enter or Space. Right when switching tabs is instant and cheap; wrong when it fetches — a keyboard user passing over four tabs would fire four requests.',
    },
    {
      name: 'Tab label',
      type: 'ReactNode',
      default: '—',
      description:
        'The tab’s text. Keep it short — the row is one line and its rhythm is 24px between labels, so a sentence here turns the bar into a scroller.',
    },
    {
      name: 'Tab value',
      type: 'any',
      default: 'child index',
      description:
        'What `Tabs value` is matched against. Falls back to the child’s position, which is fine for a fixed row and fragile for one built from data — give it a stable id instead.',
    },
    {
      name: 'Tab count',
      type: 'ReactNode',
      default: '—',
      description:
        'A count after the label: how many rows, matches, or unread items sit behind this tab. This is the Figma `tag` axis, and it renders the same `Chip size="sm"` that Figma nests here — `primary` normally, `secondary` when the tab is disabled.',
    },
    {
      name: 'Tab disabled',
      type: 'boolean',
      default: 'false',
      description:
        'Dims this one tab and takes it out of the arrow-key order. Prefer hiding a tab that will never be available over disabling it — a disabled tab still occupies the rhythm and says nothing about why.',
    },
    {
      name: 'Tab icon / iconPosition',
      type: "ReactNode / 'top' | 'bottom' | 'start' | 'end'",
      default: "— / 'top'",
      description:
        'A glyph beside the label. Figma draws no icon in a tab, so this is MUI’s behaviour unchanged; `iconPosition="start"` keeps the 32px row, while `top` and `bottom` stack and make the bar taller.',
    },
    {
      name: 'Tab wrapped',
      type: 'boolean',
      default: 'false',
      description:
        'Lets a long label use a second line. Tabs are `nowrap` by default so the row keeps its 32px box and scrolls instead; this is the way back out when a label genuinely needs two lines.',
    },
    {
      name: 'sx / classes',
      type: 'SxProps<Theme> / Partial<TabsClasses | TabClasses>',
      default: '—',
      description:
        'One-off styling and MUI’s class hooks, both intact. `.MuiTabs-indicator`, `.MuiTabs-list`, `.Mui-selected` and the rest are exactly as MUI documents them, because neither wrapper adds a class of its own.',
    },
  ],
  examples: [
    {
      title: 'A bar and its panels',
      description:
        'The whole pattern. `Tabs` is the tab list only — MUI’s material package ships no `TabPanel`, so the panel is a plain element you render beside the bar and swap on `onChange`.',
      code: `const [tab, setTab] = React.useState('overview');

<>
  <Tabs value={tab} onChange={(_, next) => setTab(next)} aria-label="Account sections">
    <Tab label="Overview" value="overview" id="tab-overview" aria-controls="panel-overview" />
    <Tab label="Members" value="members" id="tab-members" aria-controls="panel-members" />
    <Tab label="Billing" value="billing" id="tab-billing" aria-controls="panel-billing" />
  </Tabs>

  <div role="tabpanel" id="panel-overview" aria-labelledby="tab-overview" hidden={tab !== 'overview'}>
    ...
  </div>
</>`,
    },
    {
      title: 'With counts',
      description:
        'The Figma `tag` axis — a count beside the label, in the design’s small chip.',
      code: `<Tabs value={status} onChange={(_, next) => setStatus(next)} aria-label="Invoice status">
  <Tab label="All" value="all" count={48} />
  <Tab label="Open" value="open" count={12} aria-label="Open, 12 invoices" />
  <Tab label="Paid" value="paid" count={36} />
</Tabs>`,
    },
    {
      title: 'Too many to fit',
      description:
        'Lets the row scroll rather than wrap. Overflow buttons appear only when they are needed.',
      code: `<Tabs
  value={region}
  onChange={(_, next) => setRegion(next)}
  variant="scrollable"
  aria-label="Regions"
>
  {regions.map((r) => (
    <Tab key={r.id} label={r.name} value={r.id} />
  ))}
</Tabs>`,
    },
    {
      title: 'Filling a narrow bar',
      description:
        'Three tabs sharing the width equally, which reads better than three short labels bunched at one end on a phone.',
      code: `<Tabs value={tab} onChange={handleChange} variant="fullWidth" aria-label="Report period">
  <Tab label="Day" value="day" />
  <Tab label="Week" value="week" />
  <Tab label="Month" value="month" />
</Tabs>`,
    },
    {
      title: 'Down the side',
      description:
        'Not a Figma cell — the rule moves to the inline edge and the labels left-align. Give the bar a width, since a vertical row has none of its own.',
      code: `<Tabs
  orientation="vertical"
  value={section}
  onChange={handleChange}
  aria-label="Settings sections"
  sx={{ width: 200 }}
>
  <Tab label="Profile" value="profile" />
  <Tab label="Notifications" value="notifications" count={3} />
  <Tab label="Security" value="security" />
</Tabs>`,
    },
    {
      title: 'One tab unavailable',
      code: `<Tabs value={tab} onChange={handleChange} aria-label="Deployment">
  <Tab label="Build" value="build" />
  <Tab label="Tests" value="tests" />
  <Tab label="Release" value="release" disabled />
</Tabs>`,
    },
    {
      title: 'The whole bar off, while it loads',
      description:
        'The Figma `enabled` axis. `disabled` on the bar reaches every tab and dims the indicator with them.',
      code: `<Tabs value={tab} onChange={handleChange} disabled={isLoading} aria-label="Invoice status">
  <Tab label="All" value="all" />
  <Tab label="Open" value="open" count={12} />
</Tabs>`,
    },
    {
      title: 'Tabs that are really links',
      description:
        'When each tab is its own URL, render anchors and let the router say which is current. `Tabs` keeps the look; it is the `component` that changes.',
      code: `import NextLink from 'next/link';

<Tabs value={pathname} aria-label="Project sections">
  <Tab label="Overview" value="/p/1" component={NextLink} href="/p/1" />
  <Tab label="Activity" value="/p/1/activity" component={NextLink} href="/p/1/activity" />
</Tabs>`,
    },
    {
      title: 'Selecting on focus',
      description:
        'Only where switching is instant. If a tab fetches, leave this off or a keyboard user crossing the row fires a request per tab.',
      code: `<Tabs value={tab} onChange={handleChange} selectionFollowsFocus aria-label="View">
  <Tab label="Table" value="table" />
  <Tab label="Board" value="board" />
</Tabs>`,
    },
  ],
  dos: [
    'Give every `Tab` a stable `value` when the row is built from data, rather than relying on child order',
    'Use `variant="scrollable"` for a row that can outgrow its container, and `fullWidth` for three or four tabs on a phone',
    'Use `count` for the number behind a tab instead of writing it into the label — it gets the house pill and the right ink',
    'Keep labels to one or two words; the bar is a single 32px row',
    'Reach for `ToggleButtonGroup` when the choice filters what is on screen rather than switching between whole views',
  ],
  donts: [
    'Don’t use tabs for a sequence — a wizard needs an order and a “next”, which a tab bar does not have',
    'Don’t use `selectionFollowsFocus` when a tab loads data; arrowing across the row would fire a request per tab',
    'Don’t combine `centered` with `variant="scrollable"` — MUI documents the two as incompatible',
    'Don’t disable a tab that will never become available — leave it out instead',
    'Don’t nest a tab bar inside another one; two rows of tabs on one screen leaves no way to tell which owns the panel',
    'Don’t put more than a handful of tabs in a `standard` bar — past that it wants `scrollable`, or a `Select`',
  ],
  relatedComponents: ['Tab', 'ToggleButtonGroup', 'Divider', 'Card', 'Chip'],
};
