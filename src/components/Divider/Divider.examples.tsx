import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `Divider`. Read by `scripts/generate.ts` and
 * served through the MCP `get_component` tool and the docs site.
 *
 * No `figmaUrl`: the Product Design System library has no divider,
 * separator, or rule component to link to — searching returns only the
 * arithmetic icon sets. See DESIGNER_QUESTIONS.md #26. The field is
 * left off rather than pointed at an approximate node, so the docs page
 * does not imply a design exists.
 */
export const data: ComponentExamplesData = {
  name: 'Divider',
  category: 'Layout',
  tagline:
    'A hairline rule that separates content — between sections, between items in a row, or with a label naming what comes next.',
  props: [
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'",
      description:
        'Axis the rule runs along. A vertical divider almost always needs `flexItem` too, and switches the root from `<hr>` to a `<div>` with `role="separator"`.',
    },
    {
      name: 'flexItem',
      type: 'boolean',
      default: 'false',
      description:
        'Stretches a vertical divider to the height of its flex row. Without it a vertical divider computes to `0px` tall inside a flex container and renders nothing — this is the single most common reason a vertical divider appears to be missing.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      default: '—',
      description:
        'A label placed in the rule, which splits into two segments around it. Use it to name the group that follows, not to caption the one above.',
    },
    {
      name: 'textAlign',
      type: "'center' | 'left' | 'right'",
      default: "'center'",
      description:
        'Where the label sits along the rule. Only applies when `children` are present, and is ignored on a vertical divider, which always centres.',
    },
    {
      name: 'variant',
      type: "'fullWidth' | 'inset' | 'middle'",
      default: "'fullWidth'",
      description:
        'How far the rule is inset from its container. `inset` and `middle` carry Material’s own indents (72px and 16px), neither of which is on the Neoflo spacing scale — prefer `fullWidth` and control the inset with the parent’s padding, or with `sx`.',
    },
    {
      name: 'component',
      type: 'ElementType',
      default: "'hr'",
      description:
        'Element rendered at the root. Fully type-checked, so `component="li"` also accepts a list item’s own props — which is what a divider inside a `<ul>` or `<ol>` has to use, since a bare `<hr>` there is invalid markup.',
    },
    {
      name: 'absolute',
      type: 'boolean',
      default: 'false',
      description:
        'Positions the rule absolutely along the bottom of the nearest positioned ancestor. Rarely the right tool — a divider in normal flow is easier to reason about.',
    },
    {
      name: 'sx',
      type: 'SxProps<Theme>',
      default: '—',
      description:
        'One-off styling. Use it for the spacing around a rule (`sx={{ my: 3 }}`); the colour and width already come from the token scale.',
    },
    {
      name: 'classes',
      type: 'Partial<DividerClasses>',
      default: '—',
      description:
        'Overrides for the generated class names (`root`, `vertical`, `withChildren`, `flexItem`, `inset`, `middle`). `sx` is the shorter route for one-off styling.',
    },
  ],
  examples: [
    {
      title: 'Between sections',
      description:
        'The default. A horizontal rule edge to edge, rendered as a real `<hr>`, with the space around it set by the layout rather than by the divider.',
      code: [
        "import { Divider, Stack, Typography } from '@neoflo/atoms';",
        '',
        '<Stack spacing={3}>',
        '  <Typography variant="body2">Account details</Typography>',
        '  <Divider />',
        '  <Typography variant="body2">Billing</Typography>',
        '</Stack>',
      ].join('\n'),
    },
    {
      title: 'Between items in a row',
      description:
        '`flexItem` is what makes this work. A vertical divider is a flex child with no intrinsic height, so without it the rule computes to `0px` and nothing appears.',
      code: [
        "import { Divider, Stack, Typography } from '@neoflo/atoms';",
        '',
        '<Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>',
        '  <Typography variant="body2">Drafts</Typography>',
        '  <Divider orientation="vertical" flexItem />',
        '  <Typography variant="body2">Sent</Typography>',
        '  <Divider orientation="vertical" flexItem />',
        '  <Typography variant="body2">Archived</Typography>',
        '</Stack>',
      ].join('\n'),
    },
    {
      title: 'Labelled, to name the group that follows',
      description:
        'Children split the rule into two segments around the text. `textAlign="left"` reads as a section heading with a rule trailing off it, which is usually what a list of grouped items wants.',
      code: [
        "import { Divider } from '@neoflo/atoms';",
        '',
        '<Divider textAlign="left">Archived</Divider>',
      ].join('\n'),
    },
    {
      title: 'Inside a list',
      description:
        'A bare `<hr>` is not valid between `<li>` elements. `component="li"` keeps the markup legal, and MUI still supplies `role="separator"`.',
      code: [
        "import { Divider, Stack, Typography } from '@neoflo/atoms';",
        '',
        '<Stack component="ul" spacing={1} sx={{ listStyle: "none", p: 0, m: 0 }}>',
        '  <Typography component="li" variant="body2">Rename</Typography>',
        '  <Typography component="li" variant="body2">Duplicate</Typography>',
        '  <Divider component="li" />',
        '  <Typography component="li" variant="body2">Delete</Typography>',
        '</Stack>',
      ].join('\n'),
    },
    {
      title: 'Separating menu groups',
      description:
        'Inside a `Menu`, the rule is recoloured to the panel’s own border token so it agrees with `<MenuItem divider />`. Nothing to pass — the menu does it.',
      code: [
        "import { Divider, Menu, MenuItem } from '@neoflo/atoms';",
        '',
        '<Menu anchorEl={anchorEl} open={open} onClose={close}>',
        '  <MenuItem onClick={close}>Rename</MenuItem>',
        '  <MenuItem onClick={close}>Duplicate</MenuItem>',
        '  <Divider />',
        '  <MenuItem onClick={close}>Delete</MenuItem>',
        '</Menu>',
      ].join('\n'),
    },
    {
      title: 'As a Stack separator',
      description:
        '`Stack`’s `divider` prop inserts an element between every child and none at the ends, so the count stays right as the list changes length. Pass the component itself, not an element per gap.',
      code: [
        "import { Divider, Stack, Typography } from '@neoflo/atoms';",
        '',
        '<Stack',
        '  direction="row"',
        '  spacing={2}',
        '  divider={<Divider orientation="vertical" flexItem />}',
        '>',
        '  <Typography variant="body2">12 open</Typography>',
        '  <Typography variant="body2">4 closed</Typography>',
        '  <Typography variant="body2">1 blocked</Typography>',
        '</Stack>',
      ].join('\n'),
    },
  ],
  dos: [
    'Use a divider when whitespace alone has stopped separating two groups clearly — it is the fallback, not the first move',
    'Pair `orientation="vertical"` with `flexItem` every time, unless the parent already gives the row a fixed height',
    'Use `Stack`’s `divider` prop for a repeating separator, so the count follows the number of children automatically',
    'Use `component="li"` for a divider inside a `<ul>` or `<ol>`, where a bare `<hr>` is invalid markup',
    'Set the space around the rule from the layout (`Stack` spacing, or `sx={{ my: 3 }}`) rather than expecting the divider to bring its own',
  ],
  donts: [
    'Don’t reach for `variant="inset"` or `"middle"` — both carry Material’s indents (72px and 16px), and neither number exists on the Neoflo spacing scale',
    'Don’t put a divider between every item in a long list — at that density the rules become the texture and stop marking anything',
    'Don’t use a divider as a decorative line or a border; for an edge on a surface, use a border on that surface',
    'Don’t recolour it per usage — the hairline is one token so that every surface in the system agrees',
    'Don’t give a labelled divider a whole sentence; the label names the group that follows, so keep it to a word or two',
    'Don’t rely on a divider to convey meaning on its own — it separates, but it names nothing',
  ],
  relatedComponents: ['Stack', 'Menu', 'MenuItem', 'Box'],
};
