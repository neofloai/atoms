import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `Box`. Read by `scripts/generate.ts` and served
 * through the MCP `get_component` tool and the docs site.
 *
 * Each `examples` entry is paired with a live preview on the docs page
 * by matching `title` (see `app/(docs)/components/box/_components/
 * demos.tsx`, which fails the build if a title has no preview). So the
 * code below must stay literally renderable — it is the same snippet
 * the page draws, not a paraphrase of it.
 *
 * No `figmaUrl`: Box is a layout primitive with no visual design of its
 * own, so it has no counterpart in the Product Design System file.
 */
export const data: ComponentExamplesData = {
  name: 'Box',
  category: 'Layout',
  tagline:
    'Generic, theme-aware container — a div with access to the theme through the sx prop.',
  props: [
    {
      name: 'sx',
      type: 'SxProps<Theme> | ((theme) => SxProps) | Array<…>',
      default: '—',
      description:
        'Styles resolved against the Neoflo theme. Numeric spacing keys (`p`, `m`, `gap`) use the spacing scale; colour strings (`bgcolor: "primary.main"`) resolve from the palette in both colour schemes.',
    },
    {
      name: 'component',
      type: 'ElementType',
      default: "'div'",
      description:
        'Element or component rendered at the root. Polymorphic — `component="a"` also types the anchor props, so `href` is checked.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      default: '—',
      description: 'Box content.',
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
        'Box renders a `<div>` by default. Swap in any other valid HTML tag or React component with the `component` prop.',
      code: [
        '<Box',
        '  component="section"',
        '  sx={{',
        '    p: 2,',
        '    borderRadius: 1,',
        "    border: '1px dashed',",
        "    borderColor: 'divider',",
        '  }}',
        '>',
        '  This Box renders an HTML section element.',
        '</Box>',
      ].join('\n'),
    },
    {
      title: 'Customization',
      description:
        'Use `sx` to style any Box instance from the theme. Numbers go through the spacing scale — `p: 2` is theme spacing, not 2px — and colour strings resolve from the palette, so one snippet is correct in both colour schemes.',
      code: [
        '<Box',
        '  sx={{',
        '    width: 100,',
        '    height: 100,',
        '    borderRadius: 1,',
        "    bgcolor: 'primary.main',",
        "    '&:hover': { bgcolor: 'primary.dark' },",
        '  }}',
        '/>',
      ].join('\n'),
    },
    {
      title: 'Flex layout',
      description:
        'Box is the container to reach for when a layout needs more than one axis, or uneven alignment.',
      code: [
        "const tile = { p: 2, borderRadius: 1, bgcolor: 'action.hover' };",
        '',
        '<Box',
        "  sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}",
        '>',
        '  <Box sx={tile}>Left</Box>',
        '  <Box sx={tile}>Centre</Box>',
        '  <Box sx={tile}>Right</Box>',
        '</Box>',
      ].join('\n'),
    },
    {
      title: 'Responsive values',
      description:
        'Any `sx` value accepts a breakpoint object keyed by the theme breakpoints — one column on mobile, three from `md` up.',
      code: [
        '<Box',
        '  sx={{',
        "    display: 'grid',",
        '    gap: 2,',
        "    gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },",
        '  }}',
        '>',
        '  <Box sx={tile}>xs: 1fr</Box>',
        '  <Box sx={tile}>md: repeat(3, 1fr)</Box>',
        '  <Box sx={tile}>Third</Box>',
        '</Box>',
      ].join('\n'),
    },
    {
      title: 'Any element, still typed',
      description:
        '`component` is polymorphic: it narrows the remaining props to that element, so `href` is checked here and a typo is a build error.',
      code: [
        '<Box',
        '  component="a"',
        '  href="/tokens"',
        "  sx={{ color: 'primary.main', fontWeight: 600 }}",
        '>',
        '  This Box is an anchor →',
        '</Box>',
      ].join('\n'),
    },
    {
      title: 'Reading the theme directly',
      description:
        'Pass a function to `sx` when a value has no shorthand — never reach for a hex. Note that an `sx` callback is a function, so it cannot cross the React Server Component boundary: use it from a `"use client"` component.',
      code: [
        '<Box',
        '  sx={(theme) => ({',
        '    pb: 1,',
        '    borderBottom: `1px solid ${theme.palette.divider}`,',
        '    fontFamily: theme.typography.fontFamily,',
        '  })}',
        '>',
        '  Divider drawn from theme.palette.divider',
        '</Box>',
      ].join('\n'),
    },
  ],
  dos: [
    'Use it for layout — flex and grid containers, wrappers, and spacing between components',
    'Set the right element with `component` so the markup stays semantic (`section`, `main`, `aside`, `ul`)',
    'Reference the theme by name in `sx` (`bgcolor: "background.paper"`, `p: 2`) so both colour schemes and the spacing scale are handled for you',
    'Prefer a purpose-built component when one exists — Box is the open-ended option, not the first one',
  ],
  donts: [
    "Don't hardcode hex, rgb, or px colour and spacing values in `sx` — use palette names and the spacing scale",
    "Don't rebuild a component that already exists (a bordered Box is not a Card, a tinted Box is not an Alert)",
    "Don't use the legacy system props (`<Box mt={2} />`) — MUI deprecated them in favour of `sx={{ mt: 2 }}`",
    "Don't use `style={{}}` on a Box — it bypasses the theme and loses responsive values",
  ],
  relatedComponents: ['Stack', 'Grid', 'Container', 'Alert', 'Chip'],
  accessibility: [
    'Renders a `<div>` by default, which carries no semantics — use `component` to render the element the content actually is',
    'Box adds no ARIA of its own; when it becomes an interactive element, supply the role, focus handling, and label yourself',
  ],
};
