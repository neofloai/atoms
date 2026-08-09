import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `Zoom`. Read by `scripts/generate.ts` and served
 * through the MCP `get_component` tool and the docs site.
 *
 * No `figmaUrl` — the design library specifies no motion. See
 * `DESIGNER_QUESTIONS.md` #25.
 */
export const data: ComponentExamplesData = {
  name: 'Zoom',
  category: 'Motion',
  tagline:
    'Scales a child from nothing to full size about its own centre, on a fixed duration — the transition for a small control whose size is already known.',
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
        'A single element that accepts a `ref` and a `style` prop. The transition writes a `transform: scale(…)` onto it.',
    },
    {
      name: 'timeout',
      type: 'number | { appear?, enter?, exit? }',
      default: '{ enter: 225, exit: 195 }',
      description:
        'Duration in milliseconds. Unlike `Grow`, this does not accept `"auto"` — the child is not measured, which is exactly why it suits controls of known size.',
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
        'Whether to animate on first mount when `in` is already true. Set it to `false` for a control that should simply be present when the page loads.',
    },
    {
      name: 'mountOnEnter / unmountOnExit',
      type: 'boolean',
      default: 'false',
      description:
        'Defer mounting until the first enter, and remove the child once it has left. `unmountOnExit` matters for a control: one scaled to nothing is still focusable and still clickable at its centre point.',
    },
    {
      name: 'disablePrefersReducedMotion',
      type: 'boolean',
      default: 'false',
      description:
        'Keep animating even when the OS asks for reduced motion. The theme opts everything in via `motion: { reducedMotion: "system" }`.',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      default: '—',
      description:
        'Merged into the child\'s inline style, which is how `transitionDelay` is applied when staggering a swap — the transition owns `transform` and `transition`, so anything else you need goes here.',
    },
  ],
  examples: [
    {
      title: 'A control that appears with a selection',
      description:
        'The clearest use: an action that only exists while something is selected. `unmountOnExit` keeps the button out of the tab order the rest of the time.',
      code: [
        '<Zoom in={selected.length > 0} unmountOnExit>',
        '  <IconButton aria-label="Delete selected" onClick={remove}>',
        '    <Trash />',
        '  </IconButton>',
        '</Zoom>',
      ].join('\n'),
    },
    {
      title: 'Swapping two controls in one slot',
      description:
        'Two zooms in the same place will collide unless the entering one waits for the exiting one. Delaying by the exit duration makes the pair read as one slot changing occupant rather than two unrelated appearances.',
      code: [
        'const EXIT = 195;',
        '',
        '{actions.map((action, index) => (',
        '  <Zoom',
        '    key={action.id}',
        '    in={tab === index}',
        '    timeout={{ enter: 225, exit: EXIT }}',
        '    style={{ transitionDelay: tab === index ? `${EXIT}ms` : "0ms" }}',
        '    unmountOnExit',
        '  >',
        '    <IconButton aria-label={action.label}>{action.icon}</IconButton>',
        '  </Zoom>',
        '))}',
      ].join('\n'),
    },
    {
      title: 'Holding the slot open',
      description:
        'Unmounting a control removes its space, so everything beside it shifts. Give the pair a fixed-size container when the surrounding layout should stay still through the swap.',
      code: [
        '<Box sx={{ width: 40, height: 40, display: "grid" }}>',
        '  <Zoom in={!saving}>',
        '    <IconButton sx={{ gridArea: "1 / 1" }} aria-label="Save">',
        '      <FloppyDisk />',
        '    </IconButton>',
        '  </Zoom>',
        '  <Zoom in={saving}>',
        '    <Box sx={{ gridArea: "1 / 1", display: "grid", placeItems: "center" }}>',
        '      <Skeleton variant="circular" width={24} height={24} />',
        '    </Box>',
        '  </Zoom>',
        '</Box>',
      ].join('\n'),
    },
    {
      title: 'Skipping the entrance on load',
      description:
        'A control that is present from the start should not scale in as the page arrives — that reads as the interface still assembling itself.',
      code: [
        '<Zoom in={enabled} appear={false}>',
        '  <Chip label="Live" variant="success" />',
        '</Zoom>',
      ].join('\n'),
    },
  ],
  dos: [
    'Use `Zoom` for small controls of known size — icon buttons, chips, badges',
    'Pass `unmountOnExit` so a control scaled to nothing is not still focusable and clickable',
    'Delay the entering element by the exiting one\'s duration when two zooms share a slot',
    'Give a swap a fixed-size container if the surrounding layout should not move',
    'Use `appear={false}` for anything already on screen at first paint',
  ],
  donts: [
    "Don't zoom a panel or a card — scaling a large surface distorts its text on the way in; `Grow` measures its child and `Fade` avoids the problem entirely",
    "Don't run two zooms in the same slot without a delay; they overlap and read as a flicker",
    "Don't reach for `Zoom` when the size is unpredictable — it has no `timeout=\"auto\"`, which is `Grow`'s whole reason to exist",
    "Don't scale something that also moves the page around it; combine it with a fixed-size slot instead",
    "Don't use it as the only signal that an action became available — a screen reader user gets no scale, so the control's appearance needs announcing another way",
  ],
  relatedComponents: ['Grow', 'Fade', 'Slide', 'IconButton'],
  accessibility: [
    'Respects `prefers-reduced-motion: reduce` automatically via the theme\'s `motion: { reducedMotion: "system" }`',
    'A control at `scale(0)` still occupies the tab order and still responds to clicks at its centre — always pass `unmountOnExit` for interactive children',
    'Adds no ARIA; a control that appears in response to a selection still needs an accessible name and, ideally, a live region announcing that it became available',
    'When two controls share a slot, make sure the label changes with the control, or a screen reader announces the old one until the swap completes',
    'Keep the duration short: the control is not usefully clickable until it has reached full size',
  ],
};
