import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `IconButton`. Read by `scripts/generate.ts` and
 * served through the MCP `get_component` tool and the docs site.
 */
export const data: ComponentExamplesData = {
  name: 'IconButton',
  category: 'Inputs',
  tagline:
    'Icon-only action button with the same colour roles, emphasis levels, and sizes as Button.',
  figmaUrl:
    'https://www.figma.com/design/iDCodnA5uZ14EdttjSMCT1/Product-Design-System?node-id=983-16220',
  props: [
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'success' | 'error' | 'warning'",
      default: "'primary'",
      description:
        'Colour role. `secondary` renders on neutral grey surfaces; all others use their semantic colour scale.',
    },
    {
      name: 'appearance',
      type: "'contained' | 'outline' | 'text'",
      default: "'contained'",
      description:
        'Visual emphasis: solid fill, 1px border, or bare glyph. `text` takes a background on hover, focus, and press — unlike `Button`, where it underlines instead.',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      default: "'md'",
      description: 'Square control size: 32px, 36px, or 44px.',
    },
    {
      name: 'aria-label',
      type: 'string',
      default: '—',
      description:
        'Required for accessibility — the control has no visible text.',
    },
    {
      name: 'loading',
      type: 'boolean',
      default: 'false',
      description:
        'Shows a spinner and disables interaction. Inherited from MUI.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables the button and applies disabled styling.',
    },
  ],
  examples: [
    {
      title: 'Primary action',
      code: [
        "import { HeartIcon } from '@neoflo/atoms/icons';",
        '',
        '<IconButton aria-label="Save to favourites">',
        '  <HeartIcon />',
        '</IconButton>',
      ].join('\n'),
    },
    {
      title: 'Outline emphasis',
      code: [
        '<IconButton appearance="outline" aria-label="Edit">',
        '  <PencilSimpleIcon />',
        '</IconButton>',
      ].join('\n'),
    },
    {
      title: 'Low-emphasis destructive action',
      code: [
        '<IconButton variant="error" appearance="text" aria-label="Delete">',
        '  <TrashIcon />',
        '</IconButton>',
      ].join('\n'),
    },
    {
      title: 'Sizes',
      code: [
        '<IconButton size="sm" aria-label="Close"><XIcon /></IconButton>',
        '<IconButton size="md" aria-label="Close"><XIcon /></IconButton>',
        '<IconButton size="lg" aria-label="Close"><XIcon /></IconButton>',
      ].join('\n'),
    },
  ],
  dos: [
    'Always provide an `aria-label` describing the action',
    'Use icons from `@neoflo/atoms/icons` so size and weight defaults apply',
    'Use `appearance="text"` for toolbar and inline actions',
    'Match the `variant` to the action semantics (e.g. `error` for delete)',
  ],
  donts: [
    "Don't put text inside an IconButton — use `Button` with `startIcon` instead",
    "Don't rely on colour alone to communicate the action — the icon must be recognisable",
    "Don't override the circular shape or fixed sizes",
    "Don't use multiple contained `primary` icon buttons in one toolbar",
  ],
  relatedComponents: ['Button'],
  accessibility: [
    '`aria-label` is required — there is no visible text fallback',
    'Focus-visible state renders a 3px ring that meets contrast requirements',
  ],
};
