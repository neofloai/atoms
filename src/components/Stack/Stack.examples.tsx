import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `Stack`. Read by `scripts/generate.ts` and served
 * through the MCP `get_component` tool and the docs site.
 *
 * Each `examples` entry is paired with a live preview on the docs page
 * by matching `title` (see `app/(docs)/components/stack/_components/
 * demos.tsx`, which fails the build if a title has no preview). So the
 * code below must stay literally renderable — it is the same snippet
 * the page draws, not a paraphrase of it.
 *
 * No `figmaUrl`: Stack is a layout primitive with no visual design of
 * its own, so it has no counterpart in the Product Design System file.
 */
export const data: ComponentExamplesData = {
  name: 'Stack',
  category: 'Layout',
  tagline:
    'Container for arranging elements in a row or a column, with even spacing from the token scale.',
  props: [
    {
      name: 'direction',
      type: "'column' | 'column-reverse' | 'row' | 'row-reverse' | responsive",
      default: "'column'",
      description:
        'The axis children are arranged on. Accepts a breakpoint object — `{ xs: "column", sm: "row" }` — so a layout can change axis without a media query.',
    },
    {
      name: 'spacing',
      type: 'number | string | responsive',
      default: '0',
      description:
        'Space between immediate children, as an index into the theme spacing scale (`spacing={2}` is theme spacing, not 2px). Also accepts a breakpoint object.',
    },
    {
      name: 'divider',
      type: 'ReactNode',
      default: '—',
      description:
        'Element rendered between each child. Decorative — it receives the same spacing as the children.',
    },
    {
      name: 'useFlexGap',
      type: 'boolean',
      default: 'false',
      description:
        'Space children with CSS `gap` instead of margins. Set this when children carry their own margins or the row needs to wrap — see the limitation below.',
    },
    {
      name: 'sx',
      type: 'SxProps<Theme> | ((theme) => SxProps) | Array<…>',
      default: '—',
      description:
        'Styles resolved against the Neoflo theme. Use it for the flex properties Stack has no prop for, such as `alignItems` and `justifyContent`.',
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
      description: 'The elements to arrange.',
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
      title: 'Basics',
      description:
        'Stack arranges its immediate children on one axis — a column by default. `spacing` is an index into the token spacing scale, so the gap stays correct if the scale changes.',
      code: [
        '// Filler styling, reused across the examples below.',
        "const tile = { p: 2, borderRadius: 1, bgcolor: 'action.hover' };",
        '',
        '<Stack spacing={2}>',
        '  <Box sx={tile}>Item 1</Box>',
        '  <Box sx={tile}>Item 2</Box>',
        '  <Box sx={tile}>Item 3</Box>',
        '</Stack>',
      ].join('\n'),
    },
    {
      title: 'Direction',
      description:
        'Set `direction="row"` to arrange children horizontally instead.',
      code: [
        '<Stack direction="row" spacing={2}>',
        '  <Box sx={tile}>Item 1</Box>',
        '  <Box sx={tile}>Item 2</Box>',
        '  <Box sx={tile}>Item 3</Box>',
        '</Stack>',
      ].join('\n'),
    },
    {
      title: 'Dividers',
      description:
        'Use `divider` to insert an element between each child. Atoms does not export a Divider component yet, so a one-pixel Box tinted with `divider` from the palette is the token-driven way to draw one — the prop accepts any node.',
      code: [
        '<Stack',
        '  direction="row"',
        '  spacing={2}',
        "  divider={<Box sx={{ width: '1px', bgcolor: 'divider' }} />}",
        '>',
        '  <Box sx={tile}>Item 1</Box>',
        '  <Box sx={tile}>Item 2</Box>',
        '  <Box sx={tile}>Item 3</Box>',
        '</Stack>',
      ].join('\n'),
    },
    {
      title: 'Responsive values',
      description:
        'Both `direction` and `spacing` accept a breakpoint object keyed by the theme breakpoints — a column on mobile that becomes a row from `sm` up, with the gap growing as the viewport does.',
      code: [
        '<Stack',
        "  direction={{ xs: 'column', sm: 'row' }}",
        '  spacing={{ xs: 1, sm: 2, md: 4 }}',
        '>',
        '  <Box sx={tile}>Item 1</Box>',
        '  <Box sx={tile}>Item 2</Box>',
        '  <Box sx={tile}>Item 3</Box>',
        '</Stack>',
      ].join('\n'),
    },
    {
      title: 'Flexbox gap',
      description:
        'By default Stack spaces children with margins, which cannot survive a wrap and overrides margins set on the children. `useFlexGap` switches to CSS `gap` instead — required whenever the row wraps.',
      code: [
        '<Stack',
        '  direction="row"',
        '  spacing={2}',
        '  useFlexGap',
        "  sx={{ flexWrap: 'wrap' }}",
        '>',
        '  <Box sx={tile}>Item 1</Box>',
        '  <Box sx={tile}>Item 2</Box>',
        '  <Box sx={tile}>An item long enough to force a wrap</Box>',
        '</Stack>',
      ].join('\n'),
    },
    {
      title: 'Customization',
      description:
        'Stack has props for the axis and the gap only. Everything else about the arrangement — alignment, distribution, padding, the surface itself — goes through `sx`, resolved against the theme.',
      code: [
        '<Stack',
        '  direction="row"',
        '  spacing={2}',
        '  sx={{',
        '    p: 2,',
        '    borderRadius: 1,',
        "    alignItems: 'center',",
        "    justifyContent: 'space-between',",
        "    bgcolor: 'action.hover',",
        '  }}',
        '>',
        '  <Box>Aligned and spaced apart</Box>',
        '  <Avatar size="sm">NF</Avatar>',
        '</Stack>',
      ].join('\n'),
    },
    {
      title: 'Truncating text in a row',
      description:
        'A flex item starts at `min-width: auto`, so a child that cannot wrap will push the row wider than its container instead of shrinking. Set `minWidth: 0` on the child that should truncate — the single most common Stack surprise.',
      code: [
        "<Stack direction=\"row\" spacing={2} sx={{ alignItems: 'center' }}>",
        '  <Avatar size="sm">NF</Avatar>',
        '  <Box',
        '    sx={{',
        '      minWidth: 0,',
        "      overflow: 'hidden',",
        "      textOverflow: 'ellipsis',",
        "      whiteSpace: 'nowrap',",
        '    }}',
        '  >',
        '    A single line of text that is long enough to need truncating, rather',
        '    than pushing the row wider than the container it sits in.',
        '  </Box>',
        '</Stack>',
      ].join('\n'),
    },
  ],
  dos: [
    'Use it for one-dimensional layout — a row or a column of siblings with even spacing between them',
    'Space children with `spacing` rather than margins, so the gap comes from the token scale and stays in one place',
    'Change `direction` and `spacing` per breakpoint (`direction={{ xs: "column", sm: "row" }}`) instead of writing media queries',
    'Set `component` so the markup matches what the group actually is (`ul`, `nav`, `section`)',
    'Pass `useFlexGap` whenever the row can wrap, or a child carries its own margin',
  ],
  donts: [
    "Don't set a margin on a direct child — the default spacing implementation applies its own margins and yours is ignored; use `useFlexGap` if you need child margins",
    "Don't reach for Stack when the layout has two axes or needs per-child placement — that is a flex or grid `Box`",
    "Don't hardcode a gap in `sx` (`gap: '12px'`) — `spacing` already resolves from the theme spacing scale",
    "Don't nest a Stack around each child to space it — one Stack spaces all of its immediate children",
    "Don't use a `divider` between the items of a `component=\"ul\"` Stack — the extra element breaks the list semantics",
  ],
  relatedComponents: ['Box', 'Grid'],
  accessibility: [
    'Renders a `<div>` by default, which carries no semantics — set `component` to the element the group actually is (`ul`, `nav`, `fieldset`)',
    'With `component="ul"`, each child needs `component="li"` for the group to be announced as a list',
    'The `divider` element is decorative and carries no role, so keep meaning in the children rather than in the separator',
    'Stack changes visual order only through `direction` — `row-reverse` and `column-reverse` leave the DOM and tab order unchanged, so avoid them where reading order matters',
  ],
};
