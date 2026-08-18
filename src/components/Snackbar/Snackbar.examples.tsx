import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `Snackbar`. Read by `scripts/generate.ts` and
 * served through the MCP `get_component` / `list_components` tools and
 * the docs site.
 */
export const data: ComponentExamplesData = {
  name: 'Snackbar',
  category: 'Feedback',
  tagline:
    'Transient feedback in the corner of the page — an Alert with its icon, title, message and action, sliding in from the top right and dismissing itself without interrupting what comes next.',
  props: [
    {
      name: 'open',
      type: 'boolean',
      default: 'false',
      description:
        'Whether the snackbar is shown. Only for the controlled form — `SnackbarProvider` owns this when you use the hook.',
    },
    {
      name: 'title',
      type: 'ReactNode',
      default: 'the severity',
      description:
        "The first line, in bold: what happened. Falls back to the severity's own word — `Success`, `Error`, `Warning`, `Heads up` — so every toast is a titled alert without every call site writing two strings. Pass `null` for the rare one that wants a single line.",
    },
    {
      name: 'message',
      type: 'ReactNode',
      default: '—',
      description:
        'The second line: what the outcome means. One sentence — a toast is not a place to explain.',
    },
    {
      name: 'severity',
      type: "'error' | 'warning' | 'success' | 'info'",
      default: "'info'",
      description:
        'Passed through to the Alert inside. Sets the colour, the icon and the fallback title, and with them whether the message reads as a confirmation or a failure.',
    },
    {
      name: 'autoHideDuration',
      type: 'number | null',
      default: '5000',
      description:
        'Milliseconds on screen before it closes itself. `null` keeps it up until something takes it down — worth passing for an error carrying a recovery step nobody reads in five seconds.',
    },
    {
      name: 'anchorOrigin',
      type: '{ vertical, horizontal }',
      default: "{ vertical: 'top', horizontal: 'right' }",
      description:
        'Which corner it appears in. The slide direction follows it automatically — in from the nearest edge, back out the same way.',
    },
    {
      name: 'action',
      type: 'ReactNode',
      default: '—',
      description:
        'Element after the message, typically an Undo button. Rendered beside the close button rather than in place of it.',
    },
    {
      name: 'dismissible',
      type: 'boolean',
      default: 'true',
      description:
        'Render a close button on the alert, beside `action` when there is one. Ignored when there is no `onClose` to call.',
    },
    {
      name: 'onClose',
      type: "(event, reason) => void",
      default: '—',
      description:
        "Fired when it asks to be closed. `reason` is `'timeout'`, `'clickaway'`, `'escapeKeyDown'` or `'dismiss'` (the close button). Ignore `clickaway` — a click elsewhere on the page is not a decision about the toast.",
    },
  ],
  examples: [
    {
      title: 'Provider and hook',
      description:
        'The form to reach for. Mount the provider once, inside `NeofloThemeProvider`, then fire messages from event handlers — no state at the call site. The provider queues, so two messages fired at once arrive one after the other rather than covering each other.',
      code: [
        "import { NeofloThemeProvider, SnackbarProvider } from '@neofloai/atoms';",
        '',
        'function App() {',
        '  return (',
        '    <NeofloThemeProvider>',
        '      <SnackbarProvider>',
        '        <Dashboard />',
        '      </SnackbarProvider>',
        '    </NeofloThemeProvider>',
        '  );',
        '}',
      ].join('\n'),
    },
    {
      title: 'Firing a message',
      description:
        'One line per outcome. `success`, `error`, `warning` and `info` take the message and nothing else — the icon and the title come from the severity, so a single argument still renders as a titled two-line alert.',
      code: [
        "import { useSnackbar } from '@neofloai/atoms';",
        '',
        'function SaveButton({ draft }) {',
        '  const { success, error } = useSnackbar();',
        '',
        '  async function handleSave() {',
        '    try {',
        '      await save(draft);',
        "      success('Your edits are live for everyone on the team.');",
        '    } catch (cause) {',
        "      console.error('Save failed:', cause);",
        "      error('Nothing was lost — try again in a moment.');",
        '    }',
        '  }',
        '',
        '  return <Button variant="primary" onClick={handleSave}>Save</Button>;',
        '}',
      ].join('\n'),
    },
    {
      title: 'Writing the title yourself',
      description:
        'The fallback title names the severity; a real title names the event. Worth writing for anything a user might have to act on, which is most errors — pass it as the second argument to a shorthand, or use `notify`.',
      code: [
        'const { error } = useSnackbar();',
        '',
        "error('The file was larger than the 25 MB limit.', {",
        "  title: 'Upload failed',",
        '  // Says what to do next, so it waits to be read rather than',
        '  // expiring halfway through.',
        '  autoHideDuration: null,',
        '});',
      ].join('\n'),
    },
    {
      title: 'Icon, title, message and an action',
      description:
        'The full composition. The action sits beside the close button rather than replacing it, so an Undo toast can still be put away early.',
      code: [
        'const { notify } = useSnackbar();',
        '',
        'notify({',
        "  severity: 'info',",
        "  title: 'Item moved to trash',",
        "  message: 'It stays recoverable for 30 days.',",
        '  action: (',
        '    <Button variant="secondary" size="sm" onClick={handleUndo}>',
        '      Undo',
        '    </Button>',
        '  ),',
        '});',
      ].join('\n'),
    },
    {
      title: 'Controlled, without the provider',
      description:
        'The primitive, for the one screen that needs to own `open` itself. Everything the provider does is on top of this.',
      code: [
        'const [open, setOpen] = React.useState(false);',
        '',
        '<Snackbar',
        '  open={open}',
        '  severity="success"',
        '  title="Changes saved"',
        '  message="Your edits are live for everyone on the team."',
        '  onClose={() => setOpen(false)}',
        '/>',
      ].join('\n'),
    },
    {
      title: 'Somewhere other than the top right',
      description:
        'The slide follows the anchor, so a bottom-left toast enters from the left rather than still coming in from the right.',
      code: [
        '<SnackbarProvider',
        "  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}",
        '  autoHideDuration={8000}',
        '>',
        '  <App />',
        '</SnackbarProvider>',
      ].join('\n'),
    },
  ],
  dos: [
    'Use it for the outcome of something the user just did — saved, deleted, failed, copied',
    'Write a `title` that names the event rather than leaving the severity to stand in, wherever the event has a name',
    'Keep the message to one sentence, and say what it means rather than that something happened',
    'Pass `autoHideDuration: null` for an error whose message carries a recovery step',
    'Mount one `SnackbarProvider` for the whole app and fire through `useSnackbar`',
    'Ignore the `clickaway` reason if you wire `onClose` yourself',
  ],
  donts: [
    "Don't use it for anything the user has to act on — a Dialog is for decisions you need collected",
    "Don't repeat the title in the message; the two lines are what happened and what it means, not the same sentence twice",
    "Don't stack toasts; the provider queues them for a reason, and a column of them in one corner buries the message that mattered",
    "Don't put a form, a list, or more than one action in one — it is two lines and at most an Undo",
    "Don't use it for state that persists, like a failed connection that is still failing; that is an inline Alert on the screen it affects",
    "Don't mount a second provider inside the first — the inner one wins for its subtree and the queues no longer see each other",
  ],
  relatedComponents: ['Alert', 'Dialog', 'Button'],
};
