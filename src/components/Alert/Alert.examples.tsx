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
    'Non-blocking message across four severities: an icon, a title, the message under it, and room for an action. Flat and full-bleed by default, or floating as a card.',
  figmaUrl:
    'https://www.figma.com/design/iDCodnA5uZ14EdttjSMCT1/Product-Design-System?node-id=973-3010',
  props: [
    {
      name: 'severity',
      type: "'error' | 'warning' | 'success' | 'info'",
      default: "'info'",
      description:
        'Semantic state. Drives the surface, the border, both text colours and the icon colour. All four resolve from tokens, so each is correct in light and dark.',
    },
    {
      name: 'title',
      type: 'ReactNode',
      default: '—',
      description:
        'The first line: what happened. Optional, but the design is built around it — omit it and the message takes the title type slot instead of rendering as a lone small line.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      default: '—',
      description:
        'The message under the title: what it means. One or two lines.',
    },
    {
      name: 'floating',
      type: 'boolean',
      default: 'false',
      description:
        'Render as a card — tinted surface, a border in the severity colour, and an 8px corner — instead of the flat, square, full-bleed fill. Use it for anything sitting on top of the page rather than inside it; `Snackbar` uses it for toasts.',
    },
    {
      name: 'action',
      type: 'ReactNode',
      default: '—',
      description:
        'Element after the message, justified to the end — typically a Button. Replaces the default close button. Inherited from MUI.',
    },
    {
      name: 'onClose',
      type: '(event) => void',
      default: '—',
      description:
        'When provided (and no `action`), renders a close button that fires on click. Inherited from MUI.',
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
      default: 'the alert glyph',
      description:
        'Override the per-severity icon. Every severity defaults to the same glyph, coloured by the severity.',
    },
  ],
  examples: [
    {
      title: 'Severities',
      description:
        'The `severity` prop sets the surface, both text colours and the icon colour. The two lines are separated by size and colour rather than weight.',
      code: [
        '<Alert severity="error" title="Payment failed">',
        '  We could not charge the card on file.',
        '</Alert>',
        '',
        '<Alert severity="warning" title="Trial ending">',
        '  Three days left, then the workspace goes read-only.',
        '</Alert>',
        '',
        '<Alert severity="success" title="Changes saved">',
        '  Your edits are live for everyone on the team.',
        '</Alert>',
        '',
        '<Alert severity="info" title="New version available">',
        '  Reload to pick up the latest release.',
        '</Alert>',
      ].join('\n'),
    },
    {
      title: 'Flat or floating',
      description:
        'The default is flat, square and full-bleed — it belongs to the region it sits at the top of. `floating` makes it a card with a border and a corner, for anything sitting on top of the page instead of inside it.',
      code: [
        '<Alert severity="info" title="Read-only" floating>',
        '  You are viewing a published snapshot.',
        '</Alert>',
      ].join('\n'),
    },
    {
      title: 'With an action',
      description:
        'The action is justified to the end of the row and replaces the close button.',
      code: [
        '<Alert',
        '  severity="error"',
        '  title="Payment failed"',
        '  action={',
        '    <Button variant="secondary" size="sm">',
        '      Update card',
        '    </Button>',
        '  }',
        '>',
        '  We could not charge the card on file.',
        '</Alert>',
      ].join('\n'),
    },
    {
      title: 'Dismissible',
      description: 'Pass `onClose` to render an on-brand close button.',
      code: [
        '<Alert severity="info" title="Maintenance tonight" onClose={handleDismiss}>',
        '  Expect a short interruption around 02:00 UTC.',
        '</Alert>',
      ].join('\n'),
    },
    {
      title: 'Message only',
      description:
        'A title is what the design is built around, but it can be left off. The message then takes the title type slot rather than rendering as a lone small line.',
      code: '<Alert severity="success">Copied to your clipboard.</Alert>',
    },
    {
      title: 'As a toast',
      description:
        'Reach for `Snackbar` rather than composing this yourself — it holds the floating Alert, the corner, the slide and the queue.',
      code: [
        "import { useSnackbar } from '@neofloai/atoms';",
        '',
        'const { success } = useSnackbar();',
        "success('Your edits are live for everyone on the team.');",
      ].join('\n'),
    },
  ],
  dos: [
    'Give it a title that names what happened, and a message that says what it means',
    'Match the `severity` to the meaning (success for confirmations, error for failures)',
    'Use `floating` for an alert on top of the page, flat for one inside it',
    'Use `onClose` for dismissible, low-urgency alerts',
    'Use `action` when there is somewhere for the reader to go',
  ],
  donts: [
    "Don't use an Alert to block the user — use a Dialog for responses you must collect",
    "Don't repeat the title in the message; they are two different sentences",
    "Don't hardcode background, border, or text colours — the severity covers both colour schemes",
    "Don't stack many alerts at once; surface the single most important message",
    "Don't build a toast out of a floating Alert by hand — that is what Snackbar is",
  ],
  relatedComponents: ['Snackbar', 'Button', 'IconButton'],
};
