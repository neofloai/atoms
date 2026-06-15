import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `Alert`. Read by `scripts/generate.ts` and served
 * through the MCP `get_component` / `list_components` tools and the
 * docs site.
 */
export const data: ComponentExamplesData = {
  name: 'Alert',
  category: 'Feedback',
  tagline:
    'Inline, non-blocking message for status and feedback across four severities and three emphasis styles.',
  figmaUrl:
    'https://www.figma.com/design/iDCodnA5uZ14EdttjSMCT1/Product-Design-System?node-id=973-3010',
  props: [
    {
      name: 'severity',
      type: "'error' | 'warning' | 'success' | 'info'",
      default: "'info'",
      description:
        'Semantic state. Drives the colour and the default icon. Colours resolve from the token-built theme palette.',
    },
    {
      name: 'variant',
      type: "'filled' | 'subtle' | 'outline'",
      default: "'subtle'",
      description:
        'Visual emphasis: solid severity surface, tinted surface, or 1px border.',
    },
    {
      name: 'title',
      type: 'ReactNode',
      default: '—',
      description: 'Optional bold title rendered above the message.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      default: '—',
      description: 'The alert message body. Inherited from MUI.',
    },
    {
      name: 'onClose',
      type: '(event) => void',
      default: '—',
      description:
        'When provided (and no `action`), renders a close button that fires on click. Inherited from MUI.',
    },
    {
      name: 'action',
      type: 'ReactNode',
      default: '—',
      description:
        'Element rendered after the message, justified to the end — e.g. a Button. Replaces the default close button. Inherited from MUI.',
    },
    {
      name: 'icon',
      type: 'ReactNode | false',
      default: '—',
      description:
        'Override the leading icon. Set to `false` to remove it. Inherited from MUI.',
    },
    {
      name: 'iconMapping',
      type: '{ error?, warning?, success?, info? }',
      default: 'Phosphor icons',
      description:
        'Override the per-severity icon. Defaults to the Neoflo Phosphor set.',
    },
  ],
  examples: [
    {
      title: 'Severities',
      description:
        'The `severity` prop sets the colour and icon. All four resolve from the theme palette.',
      code: [
        '<Alert severity="error">Something went wrong.</Alert>',
        '<Alert severity="warning">Your trial ends soon.</Alert>',
        '<Alert severity="success">Changes saved.</Alert>',
        '<Alert severity="info">A new version is available.</Alert>',
      ].join('\n'),
    },
    {
      title: 'Variants',
      description:
        'Emphasis from heaviest to lightest: `filled`, `subtle` (default), `outline`.',
      code: [
        '<Alert severity="success" variant="filled">Deployed.</Alert>',
        '<Alert severity="success" variant="subtle">Deployed.</Alert>',
        '<Alert severity="success" variant="outline">Deployed.</Alert>',
      ].join('\n'),
    },
    {
      title: 'With title',
      code: [
        '<Alert severity="error" title="Payment failed">',
        '  We could not charge your card. Update your billing details.',
        '</Alert>',
      ].join('\n'),
    },
    {
      title: 'Dismissible',
      description:
        'Pass `onClose` to render an on-brand close button.',
      code: '<Alert severity="info" onClose={handleDismiss}>Heads up.</Alert>',
    },
    {
      title: 'With an action',
      code: [
        '<Alert',
        '  severity="warning"',
        '  action={<Button variant="secondary" size="sm">Undo</Button>}',
        '>',
        '  Item moved to trash.',
        '</Alert>',
      ].join('\n'),
    },
  ],
  dos: [
    'Match the `severity` to the meaning (success for confirmations, error for failures)',
    'Keep messages short and actionable; add a `title` only when the body needs framing',
    'Use `onClose` for dismissible, low-urgency alerts',
    'Reserve `variant="filled"` for the highest-priority messages',
  ],
  donts: [
    "Don't use an Alert to block the user — use a Dialog for responses you must collect",
    "Don't rely on colour alone — the text must carry the meaning",
    "Don't hardcode background, border, or text colours — the severity covers both colour schemes",
    "Don't stack many alerts at once; surface the single most important message",
  ],
  relatedComponents: ['Button', 'IconButton'],
  accessibility: [
    'Renders with role="alert" by default; pass role="status" for lower-urgency messages',
    'The close button and any action are keyboard-accessible and never steal focus',
    'Icon and colour are decorative — the message text conveys the state',
  ],
};
