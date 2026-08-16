import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for the toggle family — `ToggleButton` and
 * `ToggleButtonGroup`, the two components MUI documents on one page.
 * Read by `scripts/generate.ts` and served through the MCP
 * `get_component` tool and the docs site.
 */
export const data: ComponentExamplesData = {
  name: 'ToggleButton',
  category: 'Inputs',
  tagline:
    'A button that stays pressed — bold on a toolbar, the view that is currently showing, the filters that are on.',
  figmaUrl:
    'https://www.figma.com/design/iDCodnA5uZ14EdttjSMCT1/Product-Design-System?node-id=3763-4790',
  props: [
    {
      name: 'value',
      type: 'any',
      default: '— (required)',
      description:
        'Identifies the button. A group compares its own `value` against this to decide what is selected, and passes it to `onChange`.',
    },
    {
      name: 'selected',
      type: 'boolean',
      default: 'false',
      description:
        'Draws the button pressed. Only for a standalone toggle — inside a group the group owns this.',
    },
    {
      name: 'color',
      type: "'secondary' | 'primary' | 'success' | 'error' | 'warning' | 'information'",
      default: "'secondary'",
      description:
        "Colour of the *selected* state only; an unselected toggle is neutral whatever this says, which is MUI's behaviour. `secondary` is the neutral treatment and the one the design specifies.",
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      default: "'md'",
      description:
        'A 36px box with a 20px glyph, or 32px with 16px. MUI’s `large` is not exposed — Figma draws two sizes.',
    },
    {
      name: 'appearance',
      type: "'outline' | 'text'",
      default: "'outline'",
      description:
        'How much chrome at rest: the 1px neutral border, or none. `text` is for toggles inside a surface that already has an edge, like a floating toolbar.',
    },
    {
      name: 'exclusive',
      type: 'boolean',
      default: 'false',
      description:
        'ToggleButtonGroup. `true` makes `value` a single item or `null`; `false` makes it an array, possibly empty.',
    },
    {
      name: 'value (group)',
      type: 'any | any[]',
      default: '—',
      description:
        'ToggleButtonGroup. What is currently selected. Compared to each child’s `value` by reference equality, so pass the same string or object identity.',
    },
    {
      name: 'onChange',
      type: '(event, value) => void',
      default: '—',
      description:
        'ToggleButtonGroup. Fires with the *next* value. When `exclusive`, deselecting the last button hands you `null` — reject it to enforce a value set.',
    },
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'",
      description:
        'ToggleButtonGroup. Which way the buttons stack; the shared borders and squared corners follow.',
    },
    {
      name: 'fullWidth',
      type: 'boolean',
      default: 'false',
      description:
        'Stretches the group to its container, splitting the width between the buttons. Available on either component.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description:
        'On the group, disables every child. A disabled toggle that is still selected keeps a fill, so it does not read as off.',
    },
    {
      name: 'sx',
      type: 'SxProps',
      default: '—',
      description:
        'Escape hatch. Both components accept it, and it still wins over the wrapper’s own geometry.',
    },
  ],
  examples: [
    {
      title: 'One of several',
      description:
        'The common case: `exclusive`, so `value` is a single item. Selection lives in your state — nothing is selected until you say so.',
      code: [
        'const [align, setAlign] = React.useState<string | null>(null);',
        '',
        '<ToggleButtonGroup',
        '  exclusive',
        '  value={align}',
        '  onChange={(_, next) => setAlign(next)}',
        '  aria-label="Text alignment"',
        '>',
        '  <ToggleButton value="left" aria-label="Align left">',
        '    <TextAlignLeftIcon />',
        '  </ToggleButton>',
        '  <ToggleButton value="center" aria-label="Align centre">',
        '    <TextAlignCenterIcon />',
        '  </ToggleButton>',
        '  <ToggleButton value="right" aria-label="Align right">',
        '    <TextAlignRightIcon />',
        '  </ToggleButton>',
        '</ToggleButtonGroup>',
      ].join('\n'),
    },
    {
      title: 'Any number at once',
      description:
        'Drop `exclusive` and `value` becomes an array. This is the toolbar case — bold and italic are not alternatives.',
      code: [
        'const [marks, setMarks] = React.useState<string[]>([]);',
        '',
        '<ToggleButtonGroup',
        '  value={marks}',
        '  onChange={(_, next) => setMarks(next)}',
        '  aria-label="Text formatting"',
        '>',
        '  <ToggleButton value="bold" aria-label="Bold"><TextBIcon /></ToggleButton>',
        '  <ToggleButton value="italic" aria-label="Italic"><TextItalicIcon /></ToggleButton>',
        '  <ToggleButton value="underline" aria-label="Underline">',
        '    <TextUnderlineIcon />',
        '  </ToggleButton>',
        '</ToggleButtonGroup>',
      ].join('\n'),
    },
    {
      title: 'Always leave one selected',
      description:
        'An exclusive group hands you `null` when the selected button is pressed again. Refuse it and the group can never be empty.',
      code: [
        'const [view, setView] = React.useState<"list" | "grid">("list");',
        '',
        '<ToggleButtonGroup',
        '  exclusive',
        '  value={view}',
        '  onChange={(_, next) => {',
        '    // `null` means the user deselected the only selection — ignore it.',
        '    if (next !== null) setView(next);',
        '  }}',
        '  aria-label="Result layout"',
        '>',
        '  <ToggleButton value="list" aria-label="List"><ListIcon /></ToggleButton>',
        '  <ToggleButton value="grid" aria-label="Grid"><GridFourIcon /></ToggleButton>',
        '</ToggleButtonGroup>',
      ].join('\n'),
    },
    {
      title: 'On its own',
      description:
        'One toggle, no group. Then `selected` is yours to pass, and `value` is only there for `onChange` to hand back.',
      code: [
        'const [pinned, setPinned] = React.useState(false);',
        '',
        '<ToggleButton',
        '  value="pinned"',
        '  selected={pinned}',
        '  onChange={() => setPinned(!pinned)}',
        '  aria-label="Pin this thread"',
        '>',
        '  <PushPinIcon />',
        '</ToggleButton>',
      ].join('\n'),
    },
    {
      title: 'With a label',
      description:
        'Children are arbitrary, so a glyph and a word both work.',
      code: [
        '<ToggleButtonGroup exclusive value={period} onChange={(_, next) => next && setPeriod(next)} aria-label="Period">',
        '  <ToggleButton value="day">Day</ToggleButton>',
        '  <ToggleButton value="week">Week</ToggleButton>',
        '  <ToggleButton value="month">Month</ToggleButton>',
        '</ToggleButtonGroup>',
      ].join('\n'),
    },
    {
      title: 'Stacked',
      description:
        '`orientation="vertical"` for a rail beside a canvas. The shared borders and squared corners follow the axis.',
      code: [
        '<ToggleButtonGroup',
        '  orientation="vertical"',
        '  exclusive',
        '  value={tool}',
        '  onChange={(_, next) => next && setTool(next)}',
        '  aria-label="Tool"',
        '>',
        '  <ToggleButton value="select" aria-label="Select"><CursorIcon /></ToggleButton>',
        '  <ToggleButton value="draw" aria-label="Draw"><PencilSimpleIcon /></ToggleButton>',
        '  <ToggleButton value="erase" aria-label="Erase"><EraserIcon /></ToggleButton>',
        '</ToggleButtonGroup>',
      ].join('\n'),
    },
    {
      title: 'A floating toolbar',
      description:
        'The composition from the design file: `appearance="text"` on a surface that already has the edge and the shadow, with a `Divider` between the two groups. One group per decision, so alignment and formatting keep separate selections. The 1px padding is the frame\'s 2px `Scale/50` with the border taken out of it, the same subtraction the components make.',
      code: [
        "import { border, elevation, radius, spacing, surface } from '@neofloai/atoms/tokens';",
        '',
        '<Box',
        '  sx={(theme) => ({',
        "    display: 'inline-flex',",
        "    alignItems: 'center',",
        '    gap: `${spacing.component.xxs}px`,',
        "    padding: '1px',",
        '    borderRadius: `${radius.sm}px`,',
        "    border: '1px solid',",
        '    boxShadow: elevation.small,',
        '    backgroundColor: surface.layers.card1.light,',
        '    borderColor: border.layers.card1.light,',
        "    ...theme.applyStyles('dark', {",
        '      backgroundColor: surface.layers.card1.dark,',
        '      borderColor: border.layers.card1.dark,',
        '    }),',
        '  })}',
        '>',
        '  <ToggleButtonGroup',
        '    exclusive',
        '    size="sm"',
        '    appearance="text"',
        '    value={align}',
        '    onChange={(_, next) => next && setAlign(next)}',
        '    aria-label="Text alignment"',
        '  >',
        '    <ToggleButton value="left" aria-label="Align left"><TextAlignLeftIcon /></ToggleButton>',
        '    <ToggleButton value="center" aria-label="Align centre"><TextAlignCenterIcon /></ToggleButton>',
        '    <ToggleButton value="right" aria-label="Align right"><TextAlignRightIcon /></ToggleButton>',
        '  </ToggleButtonGroup>',
        '',
        '  <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />',
        '',
        '  <ToggleButtonGroup',
        '    size="sm"',
        '    appearance="text"',
        '    value={marks}',
        '    onChange={(_, next) => setMarks(next)}',
        '    aria-label="Text formatting"',
        '  >',
        '    <ToggleButton value="bold" aria-label="Bold"><TextBIcon /></ToggleButton>',
        '    <ToggleButton value="italic" aria-label="Italic"><TextItalicIcon /></ToggleButton>',
        '    <ToggleButton value="underline" aria-label="Underline"><TextUnderlineIcon /></ToggleButton>',
        '  </ToggleButtonGroup>',
        '</Box>',
      ].join('\n'),
    },
    {
      title: 'Filling its container',
      description:
        '`fullWidth` splits the width between the buttons, for a segmented control at the top of a panel.',
      code: [
        '<ToggleButtonGroup',
        '  fullWidth',
        '  exclusive',
        '  value={tab}',
        '  onChange={(_, next) => next && setTab(next)}',
        '  aria-label="Section"',
        '>',
        '  <ToggleButton value="overview">Overview</ToggleButton>',
        '  <ToggleButton value="activity">Activity</ToggleButton>',
        '</ToggleButtonGroup>',
      ].join('\n'),
    },
  ],
  dos: [
    'Use `exclusive` when the options are alternatives, and leave it off when they are independent — that choice is the whole difference between a segmented control and a toolbar',
    'Reject the `null` an exclusive group sends when the last selected button is pressed again, if the thing being chosen must always have a value',
    'Use one group per decision. Two groups side by side in one toolbar is right; one group holding both is not',
    'Pass `appearance="text"` when the toggles sit on a surface that already has a border and a shadow, so the row does not draw a second box inside the first',
    'Reach for `Checkbox` instead when the choice belongs in a form and will be submitted with it, and for `Tabs` when the choice swaps a whole panel of content',
    'Keep the glyphs in a group from one family and one weight, since they are compared against each other at 20px',
  ],
  donts: [
    "Don't use a toggle for something that happens once — a control that stays pressed is a promise that it has state. `Button` or `IconButton` is what fires an action",
    "Don't rely on `color` to make an unselected toggle look coloured; MUI applies it to the selected state only, and this wrapper mirrors that deliberately",
    "Don't use a group of one. A single toggle needs no `value` comparison, so `selected` on a standalone `ToggleButton` says the same thing with less machinery",
    "Don't put more than about five toggles in a row before considering a `Select` — a row of icons has no room for the labels that would explain them",
    "Don't mix `size` within a group; the shared borders assume the buttons are the same height",
    "Don't change what a toggle means depending on whether it is pressed. \"Mute\" that becomes \"Unmute\" is two labels for one control",
  ],
  relatedComponents: ['IconButton', 'Chip', 'Checkbox', 'Divider'],
};
