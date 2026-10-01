import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `Button`. Read by `scripts/generate.ts` and
 * served through the MCP `get_component` tool and the docs site.
 */
export const data: ComponentExamplesData = {
  name: 'Button',
  category: 'Inputs',
  tagline:
    'Branded action button with five colour roles, four emphasis levels, and four sizes.',
  figmaUrl:
    'https://www.figma.com/design/iDCodnA5uZ14EdttjSMCT1/Product-Design-System?node-id=4137-10437',
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
      type: "'contained' | 'outline' | 'text' | 'social'",
      default: "'contained'",
      description:
        'Visual emphasis, highest first: a solid fill, a 1px border, or label-only. `text` takes the role’s soft fill on hover, press and focus — the same fill `outline` uses — and is inset less than the other two so that fill has room around the label. `social` sits outside the ladder: a near-white card inside a neutral hairline for sign-in buttons, neutral only, so it ignores `variant`.',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg' | 'xl'",
      default: "'md' ('lg' for social)",
      description:
        'Control height: 28px, 32px, 40px, or 48px. Each size sets its own inline padding (8 / 12 / 16 / 12px) and glyph size (16 / 16 / 20 / 20px; `social` keeps its mark at 16 throughout); `lg` and `xl` take a heading-sized label, `sm` and `md` a body-sized one. `xl` is the page-level size — the one action a screen exists for, beside its title — and works with every `variant` and `appearance`. With `appearance="social"` the default is `lg` (40px), the size the sign-in button is drawn at — omit `size` to get it, and pass `md` or `sm` only when a layout genuinely needs a smaller one.',
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
        'Icon before / after the label. Use icons from @neofloai/atoms/icons.',
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
      title: 'The action a page exists for',
      description:
        '`size="xl"` — 48px tall with a heading-sized label, sitting beside the page title rather than in a row of controls. It paints like any other size, so pick the role with `variant` and the emphasis with `appearance`.',
      code: [
        "import { UploadSimpleIcon } from '@neofloai/atoms/icons';",
        '',
        '<Button size="xl" startIcon={<UploadSimpleIcon />}>',
        '  Add Invoice',
        '</Button>',
      ].join('\n'),
    },
    {
      title: 'Sign in with a third party',
      description:
        'A near-white card inside a neutral hairline, quiet enough that someone else’s logo can sit inside it without competing. Neutral only — `variant` does not apply — and normally full width in a login column. It is large (40px) by default, so leave `size` off. It carries the Google mark in Google’s colours without being asked; pass your own `startIcon` for another provider, or `null` for none.',
      code: [
        '<Button appearance="social" fullWidth>Continue with Google</Button>',
      ].join('\n'),
    },
    {
      title: 'Sizes',
      code: [
        '<Button size="sm">Small</Button>',
        '<Button size="md">Medium</Button>',
        '<Button size="lg">Large</Button>',
        '<Button size="xl">Extra large</Button>',
      ].join('\n'),
    },
    {
      title: 'With icons',
      code: [
        "import { HeartIcon, ArrowRightIcon } from '@neofloai/atoms/icons';",
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
    'Use `size="xl"` for the one action a screen exists for, beside its title',
    'Use `appearance="social"` for sign-in buttons that carry a third-party logo, at its default `lg` size — omit `size`',
  ],
  donts: [
    "Don't use multiple `primary` contained buttons in the same section",
    "Don't use `variant=\"error\"` for cancel or dismiss actions",
    "Don't override button colours with `sx` — pick the right variant instead",
    "Don't use `size=\"sm\"` for primary page-level CTAs",
    "Don't put two `xl` buttons on one screen — it is the page's single call to action, and a second one cancels the first",
    "Don't reach for `size=\"xl\"` inside a card, a toolbar, a dialog or a table row; it is sized for a page header",
    "Don't pass `variant` alongside `appearance=\"social\"` expecting a colour — it is drawn neutral only",
    "Don't pass Phosphor's monochrome `GoogleLogoIcon` to a social button — the default mark is already the right one",

  ],
  relatedComponents: ['IconButton'],
};
