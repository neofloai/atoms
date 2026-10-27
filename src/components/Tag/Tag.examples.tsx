import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `Tag`. Read by `scripts/generate.ts` and served
 * through the MCP `get_component` tool and the docs site.
 */
export const data: ComponentExamplesData = {
  name: 'Tag',
  category: 'Data Display',
  tagline:
    'Small coloured label for a status, a category or a count, in eight colour roles.',
  figmaUrl:
    'https://www.figma.com/design/iDCodnA5uZ14EdttjSMCT1/Product-Design-System?node-id=4648-16784',
  props: [
    {
      name: 'label',
      type: 'ReactNode',
      default: '—',
      description: 'Tag content. Inherited from MUI.',
    },
    {
      name: 'variant',
      type: "'secondary' | 'primary' | 'warning' | 'purple' | 'success' | 'orange' | 'error' | 'information'",
      default: "'primary'",
      description:
        'Colour role, named by meaning: `secondary` is grey, `warning` yellow, `success` green, `error` red, `information` blue. `orange` and `purple` carry no meaning of their own and are for categories rather than statuses.',
    },
    {
      name: 'appearance',
      type: "'contained' | 'outline'",
      default: "'contained'",
      description:
        '`outline` draws a 1px border in the role’s own border colour over the same fill — the treatment a table’s Status column uses. On `success` and `error` the label also steps a rung darker. The border is taken out of the padding, so an outlined tag is exactly as wide as a contained one.',
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      default: "'md'",
      description: '`md` = 20px with a 12px label, `sm` = 18px with an 11px label.',
    },
    {
      name: 'icon',
      type: 'ReactElement',
      default: '—',
      description:
        'A 12px glyph before the label. Inherits the label colour. Inherited from MUI.',
    },
    {
      name: 'endIcon',
      type: 'ReactElement',
      default: '—',
      description: 'A 12px glyph after the label. Inherits the label colour.',
    },
    {
      name: 'colors',
      type: '{ bg?: ModeToken | string; border?: ModeToken | string; text?: ModeToken | string }',
      default: 'undefined',
      description:
        'Overrides the three colours `variant` would paint, per key — pass one and the other two still come from the role. `border` shows only with `appearance="outline"`. Reach for a role first: a status column is read by meaning, and a reader cannot tell from a decorative hue which of two statuses is the bad one. This is for a colour the roles genuinely do not carry. Pass design tokens rather than hexes — a token is a `{ light, dark }` pair and resolves per scheme, where a bare hex is light-mode only by definition and paints the same colour on a near-black page.',
    },
  ],
  examples: [
    {
      title: 'Status tag',
      code: '<Tag variant="success" label="Active" />',
    },
    {
      title: 'Colours',
      description:
        'Eight roles. Pick the one for what the tag means, and the colour follows in both light and dark.',
      code: [
        '<Tag variant="secondary" label="Draft" />',
        '<Tag variant="primary" label="New" />',
        '<Tag variant="warning" label="Pending" />',
        '<Tag variant="purple" label="Design" />',
        '<Tag variant="success" label="Paid" />',
        '<Tag variant="orange" label="Research" />',
        '<Tag variant="error" label="Overdue" />',
        '<Tag variant="information" label="In review" />',
      ].join('\n'),
    },
    {
      title: 'Outlined status tags',
      description:
        'A table’s Status column: the role’s fill with its own border outlined over it.',
      code: [
        '<Tag appearance="outline" variant="information" label="Extraction" />',
        '<Tag appearance="outline" variant="warning" label="Matching" />',
        '<Tag appearance="outline" variant="success" label="ERP Posting" />',
        '<Tag appearance="outline" variant="error" label="Error" />',
      ].join('\n'),
    },
    {
      title: 'Sizes',
      description: '`md` is 20px and the default; `sm` is 18px.',
      code: [
        '<Tag label="Medium" />',
        '<Tag size="sm" label="Small" />',
      ].join('\n'),
    },
    {
      title: 'With glyphs',
      description:
        '`icon` leads and `endIcon` trails, both at 12px and both in the label’s colour. Keep a glyph for the tag that needs attention — a glyph on every row is decoration, and it stops the one that matters from standing out.',
      code: [
        "import { FilePdfIcon, LockIcon, WarningCircleIcon } from '@neofloai/atoms/icons';",
        '',
        '<Tag',
        '  variant="error"',
        '  appearance="outline"',
        '  icon={<WarningCircleIcon />}',
        '  label="Error"',
        '/>',
        '<Tag',
        '  variant="secondary"',
        '  icon={<FilePdfIcon />}',
        '  label="invoice.pdf"',
        '  endIcon={<LockIcon />}',
        '/>',
      ].join('\n'),
    },
    {
      title: 'A status the roles have no colour for',
      description:
        'The escape hatch, and the last resort. `colors` takes the fill, the outline and the label separately, so a status the roles do not cover can still be built out of tokens rather than hexes — which is what keeps it working in dark mode.',
      code: [
        "import { border, surface, text } from '@neofloai/atoms/tokens';",
        '',
        '<Tag',
        '  appearance="outline"',
        '  label="Extraction"',
        '  colors={{',
        '    bg: surface.information.subtle,',
        '    border: border.information.default,',
        '    text: text.information[3],',
        '  }}',
        '/>',
      ].join('\n'),
    },
  ],
  dos: [
    'Match the `variant` to the meaning (e.g. `success` for healthy states, `error` for failures)',
    'Use `appearance="outline"` for a status in a table column',
    'Keep labels short — one or two words',
  ],
  donts: [
    "Don't make a tag clickable — use `Button` for an action, `ToggleButton` for a choice, `Checkbox` for a selection",
    "Don't rely on colour alone to communicate status — the label must carry the meaning",
    "Don't mix sizes within one group of tags",
    "Don't use `orange` or `purple` for a status — they carry no meaning a reader can learn",
    "Don't hardcode background or border colours — the variant covers both colour schemes",
  ],
  relatedComponents: ['Badge', 'Button', 'ToggleButton'],
};
