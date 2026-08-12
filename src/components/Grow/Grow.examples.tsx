import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `Grow`. Read by `scripts/generate.ts` and served
 * through the MCP `get_component` tool and the docs site.
 *
 * No `figmaUrl` — the design library specifies no motion. See
 * `DESIGNER_QUESTIONS.md` #25.
 */
export const data: ComponentExamplesData = {
  name: 'Grow',
  category: 'Motion',
  tagline:
    'Scales and fades a child in from a small transparent state, timing itself to the size of what it is revealing — the transition for surfaces that emerge from something else.',
  props: [
    {
      name: 'in',
      type: 'boolean',
      default: 'false',
      description:
        'Whether the child is shown. Flipping it runs the enter or exit transition.',
    },
    {
      name: 'children',
      type: 'ReactElement',
      default: '—',
      description:
        'A single element that accepts a `ref` and a `style` prop. The ref is not optional here the way it is elsewhere: `timeout="auto"` measures the node, so a child that drops it transitions in zero milliseconds.',
    },
    {
      name: 'timeout',
      type: "number | 'auto' | { appear?, enter?, exit? }",
      default: "'auto'",
      description:
        'Duration in milliseconds, or `"auto"` to derive it from the child\'s height — so a four-item menu opens faster than a twenty-item one. This is the only transition in the set that defaults to `"auto"`.',
    },
    {
      name: 'easing',
      type: 'string | { enter?, exit? }',
      default: 'theme.transitions.easing.easeInOut',
      description:
        'CSS timing function, optionally split per direction.',
    },
    {
      name: 'appear',
      type: 'boolean',
      default: 'true',
      description:
        'Whether to animate on first mount when `in` is already true.',
    },
    {
      name: 'mountOnEnter / unmountOnExit',
      type: 'boolean',
      default: 'false',
      description:
        'Defer mounting until the first enter, and remove the child once it has left. For a popover-like surface both are usually right — the content is neither needed nor meaningful while closed.',
    },
    {
      name: 'disablePrefersReducedMotion',
      type: 'boolean',
      default: 'false',
      description:
        'Keep animating even when the OS asks for reduced motion. The theme opts everything in via `motion: { reducedMotion: "system" }`, so this is an escape hatch.',
    },
    {
      name: 'onEntered / onExited',
      type: '(node, isAppearing) => void',
      default: '—',
      description:
        'Lifecycle callbacks, with `onEnter`, `onEntering`, `onExit`, and `onExiting` alongside them.',
    },
  ],
  examples: [
    {
      title: 'A surface that emerges from its trigger',
      description:
        'The default `timeout="auto"` measures the panel, so the animation is proportionate to how much is being revealed. Set `transformOrigin` to the corner the panel belongs to and the scale reads as coming out of the button rather than out of nowhere.',
      code: [
        '<Grow in={open} style={{ transformOrigin: "top left" }}>',
        '  <Paper variant="outlined" sx={{ p: 2 }}>',
        '    <Stack spacing={1}>{filters}</Stack>',
        '  </Paper>',
        '</Grow>',
      ].join('\n'),
    },
    {
      title: 'Staggering a group',
      description:
        'Offsetting each child by a fixed step turns a set of simultaneous appearances into one movement across the group. Keep the exit uniform — staggering the way out reads as hesitation.',
      code: [
        '<Stack direction="row" spacing={1}>',
        '  {tags.map((tag, index) => (',
        '    <Grow',
        '      key={tag.id}',
        '      in={show}',
        '      timeout={{ enter: 200 + index * 60, exit: 150 }}',
        '    >',
        '      <Chip label={tag.label} />',
        '    </Grow>',
        '  ))}',
        '</Stack>',
      ].join('\n'),
    },
    {
      title: 'A fixed duration instead',
      description:
        '`"auto"` is right when the size is unpredictable and wrong when it is not: a small control of known size gets a duration measured from almost nothing, which reads as a snap. State a number for those.',
      code: [
        '<Grow in={active} timeout={200}>',
        '  <Chip label="Live" variant="success" />',
        '</Grow>',
      ].join('\n'),
    },
    {
      title: 'Already used by Menu',
      description:
        "Atoms' `Menu` opens with this transition internally, because MUI's `Popover` does. You do not need to add it — reach for `Grow` directly only when building a surface that `Menu` does not already cover.",
      code: [
        '<Menu anchorEl={anchorEl} open={open} onClose={close}>',
        '  <MenuItem onClick={close}>Rename</MenuItem>',
        '  <MenuItem onClick={close}>Duplicate</MenuItem>',
        '</Menu>',
      ].join('\n'),
    },
  ],
  dos: [
    'Use `Grow` for surfaces whose size you do not know in advance — the default `timeout="auto"` measures them so the duration always suits the content',
    'Set `style={{ transformOrigin }}` to the point the surface belongs to, so the scale reads as emerging from its trigger',
    'Pair it with `mountOnEnter` and `unmountOnExit` for popover-like content',
    'Give a stagger a uniform exit; only the entrance benefits from being offset',
    'Reach for a fixed `timeout` when the child is small and its size is already known',
  ],
  donts: [
    "Don't use it for a full-width panel — a large scale distorts the content on the way in, where `Fade` or `Slide` would not",
    "Don't rely on `timeout=\"auto\"` with a child that cannot be measured (`display: none`, zero height, or a component that drops `ref`) — it silently produces a zero-length transition",
    "Don't add a `Grow` around `Menu`; it already grows, and nesting the two compounds the scale",
    "Don't stagger more than a handful of items — beyond that the last one arrives long after the user has stopped waiting",
    "Don't use it for content that pushes the page around; a scaling element that also reflows the layout reads as a glitch",
  ],
  relatedComponents: ['Fade', 'Zoom', 'Slide', 'Menu'],
};
