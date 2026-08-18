import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `Typography`. Read by `scripts/generate.ts` and
 * served through the MCP `get_component` / `list_components` tools and
 * the docs site.
 */
export const data: ComponentExamplesData = {
  name: 'Typography',
  category: 'Data Display',
  tagline:
    'Text on the type scale. Ten rungs, two weight cuts each, and the element kept separate from the size — so a page title can be an h1 without being 80px tall.',
  props: [
    {
      name: 'variant',
      type: "'h1'–'h6' | 'body1' | 'body2' | 'caption' | 'inherit'",
      default: "'body1'",
      description:
        'Which rung of the type scale to set. Size, leading and letter-spacing all resolve from the typography tokens. Narrower than MUI’s list: `subtitle1`, `subtitle2`, `button` and `overline` are not offered, because the scale does not define them — see the migration example below for what to write instead.',
    },
    {
      name: 'weight',
      type: "'regular' | 'medium' | 'semibold'",
      default: '—',
      description:
        'Which cut of the rung. Every rung ships a Medium and a Regular with the same size and leading, and the variant picks one — Medium for headings, Regular for body and caption. This reaches the other. Omit it to take the variant’s own cut.',
    },
    {
      name: 'component',
      type: 'ElementType',
      default: 'per variant',
      description:
        'The element to render. Defaults to the variant’s natural match (`h5` renders an `<h5>`, `body1` a `<p>`, `caption` a `<span>`). Set it when the size and the document level are different decisions.',
    },
    {
      name: 'color',
      type: 'string',
      default: "'inherit'",
      description:
        'Text colour, resolved from the palette — `text.primary`, `text.secondary`, `error.main`. Inherited from MUI, and already on-brand because the palette is built from tokens.',
    },
    {
      name: 'align',
      type: "'inherit' | 'left' | 'center' | 'right' | 'justify'",
      default: "'inherit'",
      description: 'Text alignment. Inherited from MUI.',
    },
    {
      name: 'noWrap',
      type: 'boolean',
      default: 'false',
      description:
        'Truncate to a single line with an ellipsis instead of wrapping. Needs a width to overflow, so the element has to be block or inline-block. Inherited from MUI.',
    },
    {
      name: 'gutterBottom',
      type: 'boolean',
      default: 'false',
      description:
        'Adds a bottom margin. Prefer the gap on a parent `Stack` — one source of spacing per layout reads better than margins on the items.',
    },
  ],
  examples: [
    {
      title: 'The scale',
      description:
        'Ten rungs. The six headings run 80px down to 16px, the two body sizes are 13px and 12px, and the caption is 10px.',
      code: [
        '<Typography variant="h3">Query Log</Typography>',
        '<Typography variant="h5">Sign in</Typography>',
        '<Typography variant="body1">The default. Most copy sits here.</Typography>',
        '<Typography variant="body2">One rung down, for supporting lines.</Typography>',
        '<Typography variant="caption">Labels and metadata.</Typography>',
      ].join('\n'),
    },
    {
      title: 'The size and the element are separate',
      description:
        'A page needs one `h1` for its document structure, and rarely wants it set at 80px. `variant` picks the size, `component` picks the element.',
      code: [
        '<Typography variant="h5" component="h1">',
        '  Sign in',
        '</Typography>',
      ].join('\n'),
    },
    {
      title: 'Coming from MUI’s variants',
      description:
        'A subtitle in this scale is not its own rung — it is a body rung in its Medium cut. That is what `weight` is for, and it is why there is no `subtitle1` or `subtitle2` to reach for.',
      code: [
        '// Instead of variant="subtitle1" or sx={{ fontWeight: 600 }}:',
        '<Typography variant="body1" weight="medium">',
        '  Billing',
        '</Typography>',
        '',
        '// A heading that needs to sit back rather than lead:',
        '<Typography variant="h6" weight="regular">',
        '  Recent activity',
        '</Typography>',
      ].join('\n'),
    },
    {
      title: 'A title with a line under it',
      description:
        'The pair most screens open with. The gap comes from the `Stack`, not from a margin on either line.',
      code: [
        '<Stack spacing={0.5}>',
        '  <Typography variant="h5" component="h1">',
        '    Sign in',
        '  </Typography>',
        '  <Typography variant="body2" color="text.secondary">',
        '    Enter your email and password to continue.',
        '  </Typography>',
        '</Stack>',
      ].join('\n'),
    },
    {
      title: 'Truncating to one line',
      description:
        'For a cell or a row where the text is longer than the space and wrapping would change the row height.',
      code: [
        '<Typography variant="body2" noWrap sx={{ maxWidth: 240 }}>',
        '  {invoice.reference}',
        '</Typography>',
      ].join('\n'),
    },
    {
      title: 'Inheriting the surrounding type',
      description:
        '`inherit` sets no size of its own — use it for text inside a control or a cell that has already been sized.',
      code: [
        '<Typography variant="inherit" weight="medium">',
        '  {row.total}',
        '</Typography>',
      ].join('\n'),
    },
  ],
  dos: [
    'Use `variant` for every piece of text, so the size comes from the scale rather than from `sx`',
    'Set `component` when the document level and the visual size differ',
    'Reach for `weight` instead of `sx={{ fontWeight }}` — it can only produce the cuts the font ships',
    'Use `color="text.secondary"` for supporting copy rather than a literal colour',
    'Space stacked text with the parent’s `gap` rather than `gutterBottom`',
  ],
  donts: [
    'Don’t import `Typography` from `@mui/material` — its `subtitle1`, `subtitle2`, `button` and `overline` variants carry Material’s metrics, not this scale’s',
    'Don’t set `fontSize`, `lineHeight` or `letterSpacing` by hand; if no rung fits, the scale is the thing to change',
    'Don’t use `fontWeight: 700` — DM Sans has no Bold cut, so the browser synthesises one. `weight="semibold"` is the top of the ladder',
    'Don’t pick a heading variant for its size alone on a page that then has no `h1`',
    'Don’t use a heading rung as body copy to make it look emphatic — that is what `weight` is for',
  ],
  relatedComponents: ['Link', 'Stack', 'Alert'],
};
