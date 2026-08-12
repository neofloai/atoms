import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `Collapse`. Read by `scripts/generate.ts` and
 * served through the MCP `get_component` tool and the docs site.
 *
 * No `figmaUrl` — the design library specifies no motion. See
 * `DESIGNER_QUESTIONS.md` #25.
 */
export const data: ComponentExamplesData = {
  name: 'Collapse',
  category: 'Motion',
  tagline:
    'Animates a child between zero and its natural size, reflowing the page as it opens — the only transition in the set that changes layout, and therefore the one for disclosure.',
  props: [
    {
      name: 'in',
      type: 'boolean',
      default: 'false',
      description:
        'Whether the content is expanded. Flipping it animates the height (or width) between `collapsedSize` and the child\'s natural size.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      default: '—',
      description:
        'The content to collapse. Unlike the other four transitions this is a plain node, not a single ref-holding element — `Collapse` wraps its content rather than cloning it, so text, fragments, and lists are all valid.',
    },
    {
      name: 'orientation',
      type: "'vertical' | 'horizontal'",
      default: "'vertical'",
      description:
        'Axis to animate along. `horizontal` collapses width instead of height — the mechanism behind a sidebar that shrinks to an icon rail.',
    },
    {
      name: 'collapsedSize',
      type: 'string | number',
      default: "'0px'",
      description:
        'Size when closed. Set it to leave a preview visible instead of collapsing to nothing — a "read more" that shows the first line is `collapsedSize={24}`, not a separate component.',
    },
    {
      name: 'timeout',
      type: "number | 'auto' | { appear?, enter?, exit? }",
      default: 'theme.transitions.duration.standard',
      description:
        'Duration in milliseconds, or `"auto"` to derive it from the content\'s size. The default is a flat 300ms; `"auto"` is usually the better choice, because a two-line disclosure and a twenty-line one should not take the same time.',
    },
    {
      name: 'easing',
      type: 'string | { enter?, exit? }',
      default: 'theme.transitions.easing.easeInOut',
      description:
        'CSS timing function, optionally split per direction.',
    },
    {
      name: 'mountOnEnter / unmountOnExit',
      type: 'boolean',
      default: 'false',
      description:
        'Defer mounting until the first expand, and remove the content once collapsed. `unmountOnExit` is what keeps hidden content out of the DOM rather than present at zero height.',
    },
    {
      name: 'disablePrefersReducedMotion',
      type: 'boolean',
      default: 'false',
      description:
        'Keep animating even when the OS asks for reduced motion. The theme opts everything in via `motion: { reducedMotion: "system" }`.',
    },
    {
      name: 'component',
      type: 'ElementType',
      default: "'div'",
      description:
        'Element rendered at the root. Use it when a `div` would be invalid HTML in the position the disclosure sits in — inside a list or a table, for instance.',
    },
    {
      name: 'sx',
      type: 'SxProps<Theme>',
      default: '—',
      description:
        'Styles resolved against the Neoflo theme, applied to the outer wrapper.',
    },
  ],
  examples: [
    {
      title: 'A disclosure',
      description:
        '`Collapse` manages size, not semantics — the trigger and what it opens are yours to wire together.',
      code: [
        'const [open, setOpen] = React.useState(false);',
        '',
        '<Button',
        '  appearance="text"',
        '  onClick={() => setOpen(!open)}',
        '  aria-expanded={open}',
        '  aria-controls="billing-details"',
        '>',
        '  {open ? "Hide details" : "Show details"}',
        '</Button>',
        '<Collapse in={open} timeout="auto" unmountOnExit>',
        '  <Box id="billing-details" sx={{ pt: 2 }}>',
        '    <Typography variant="body2">{details}</Typography>',
        '  </Box>',
        '</Collapse>',
      ].join('\n'),
    },
    {
      title: 'Keeping a preview visible',
      description:
        '`collapsedSize` is the height when closed, so the content can be truncated rather than hidden. This is the whole of a "read more" — no measuring, no second render, no separate component.',
      code: [
        '<Collapse in={expanded} collapsedSize={44}>',
        '  <Typography variant="body2" color="text.secondary">',
        '    {article.body}',
        '  </Typography>',
        '</Collapse>',
      ].join('\n'),
    },
    {
      title: 'Dismissing an alert without a jump',
      description:
        'Removing a message outright makes everything below it snap upward. Collapsing it hands that height back over the same duration, so the page settles instead of jumping.',
      code: [
        '<Collapse in={visible} unmountOnExit>',
        '  <Alert',
        '    severity="info"',
        '    onClose={() => setVisible(false)}',
        '  >',
        '    Two teammates are waiting for an invite.',
        '  </Alert>',
        '</Collapse>',
      ].join('\n'),
    },
    {
      title: 'A rail that collapses sideways',
      description:
        '`orientation="horizontal"` animates width instead of height. Pair it with a `collapsedSize` wide enough for the icons so the navigation stays usable while narrow.',
      code: [
        '<Collapse',
        '  in={expanded}',
        '  orientation="horizontal"',
        '  collapsedSize={56}',
        '  timeout="auto"',
        '>',
        '  <Stack sx={{ width: 240 }}>{navigation}</Stack>',
        '</Collapse>',
      ].join('\n'),
    },
    {
      title: 'A list of expanding rows',
      description:
        'One `Collapse` per row, each driven by its own boolean. Keep the trigger and the region adjacent in the DOM so the markup reads in the order it renders.',
      code: [
        '{sections.map((section) => (',
        '  <Box key={section.id}>',
        '    <Button',
        '      appearance="text"',
        '      onClick={() => toggle(section.id)}',
        '      aria-expanded={openIds.includes(section.id)}',
        '      aria-controls={`section-${section.id}`}',
        '    >',
        '      {section.title}',
        '    </Button>',
        '    <Collapse in={openIds.includes(section.id)} timeout="auto" unmountOnExit>',
        '      <Box id={`section-${section.id}`} sx={{ px: 2, pb: 2 }}>',
        '        {section.body}',
        '      </Box>',
        '    </Collapse>',
        '  </Box>',
        '))}',
      ].join('\n'),
    },
  ],
  dos: [
    'Use `Collapse` whenever the surrounding content should move out of the way rather than be covered',
    'Pass `timeout="auto"` so the duration suits how much is being revealed',
    'Add `unmountOnExit` so collapsed content leaves the DOM and the tab order',
    'Reach for `collapsedSize` before writing a truncation of your own',
  ],
  donts: [
    "Don't use it for floating content — a popover or menu should not push the page around; that is `Grow` or `Fade`",
    "Don't leave the default flat 300ms on content of wildly varying length; a long section crawls and a short one is over before it registers",
    "Don't animate a collapse inside another collapse — the outer one measures a target that is still moving and lands at the wrong height",
    "Don't collapse content that contains focus — move focus out first, or the browser scrolls to chase a shrinking element",
  ],
  relatedComponents: ['Fade', 'Grow', 'Alert', 'Skeleton'],
};
