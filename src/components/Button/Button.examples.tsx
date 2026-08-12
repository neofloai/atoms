import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `Button`. Read by `scripts/generate.ts` and
 * served through the MCP `get_component` tool and the docs site.
 */
export const data: ComponentExamplesData = {
  name: 'Button',
  category: 'Inputs',
  tagline:
    'Branded action button with five colour roles, three emphasis levels, and three sizes.',
  figmaUrl:
    'https://www.figma.com/design/iDCodnA5uZ14EdttjSMCT1/Product-Design-System?node-id=983-17180',
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
        'Visual emphasis: solid fill, 1px border, or label-only. `text` sits flush (no horizontal padding) and underlines on hover rather than taking a background.',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      default: "'md'",
      description: 'Control height: 32px, 36px, or 44px.',
    },
    {
      name: 'loading',
      type: 'boolean',
      default: 'false',
      description:
        'Shows a spinner and disables interaction. Inherited from MUI.',
    },
    {
      name: 'startIcon / endIcon',
      type: 'ReactNode',
      default: '—',
      description:
        'Icon before / after the label. Use icons from @neoflo/atoms/icons.',
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
      title: 'Primary call to action',
      description: 'The main CTA on a page — one per section.',
      code: '<Button variant="primary">Submit</Button>',
    },
    {
      title: 'Secondary action',
      description: 'Neutral action next to a primary CTA.',
      code: '<Button variant="secondary">Cancel</Button>',
    },
    {
      title: 'Outline emphasis',
      code: '<Button variant="primary" appearance="outline">View report</Button>',
    },
    {
      title: 'Low-emphasis destructive action',
      code: '<Button variant="error" appearance="text">Delete account</Button>',
    },
    {
      title: 'Sizes',
      code: [
        '<Button size="sm">Small</Button>',
        '<Button size="md">Medium</Button>',
        '<Button size="lg">Large</Button>',
      ].join('\n'),
    },
    {
      title: 'With icons',
      code: [
        "import { HeartIcon, ArrowRightIcon } from '@neoflo/atoms/icons';",
        '',
        '<Button startIcon={<HeartIcon />} endIcon={<ArrowRightIcon />}>',
        '  Save to favourites',
        '</Button>',
      ].join('\n'),
    },
    {
      title: 'Loading state',
      code: '<Button loading>Processing...</Button>',
    },
  ],
  dos: [
    'Use `variant="primary"` for the main CTA on a page (one per section)',
    'Use `variant="error"` for irreversible actions (delete, remove)',
    'Use `appearance="outline"` or `appearance="text"` for secondary actions',
    'Pair `variant="secondary"` with a primary button for cancel/back actions',
  ],
  donts: [
    "Don't use multiple `primary` contained buttons in the same section",
    "Don't use `variant=\"error\"` for cancel or dismiss actions",
    "Don't override button colours with `sx` — pick the right variant instead",
    "Don't use `size=\"sm\"` for primary page-level CTAs",
  ],
  relatedComponents: ['IconButton'],
};
