import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for the Dialog family. Read by `scripts/generate.ts` and
 * served through the MCP `get_component` tool and the docs site.
 *
 * The props table covers all five parts. Region props are prefixed with
 * the component that owns them, since the table is one flat list — the
 * same convention `Card.examples.tsx` uses.
 */
export const data: ComponentExamplesData = {
  name: 'Dialog',
  category: 'Feedback',
  tagline:
    'A modal panel that interrupts the page to ask for a decision. One locked shell — the same surface a Card uses — filled by composing a title, a body, and a footer.',
  figmaUrl:
    'https://www.figma.com/design/iDCodnA5uZ14EdttjSMCT1/Product-Design-System?node-id=3420-3360&m=dev',
  props: [
    {
      name: 'open',
      type: 'boolean',
      default: '—',
      description:
        'Whether the dialog is shown. Required, and the only piece of state a dialog has — everything else about it is composition.',
    },
    {
      name: 'onClose',
      type: '(event, reason) => void',
      default: '—',
      description:
        'Fires when the dialog asks to be dismissed. `reason` is `"escapeKeyDown"` or `"backdropClick"`, so a dialog that should only close deliberately can ignore the second one. Omit it entirely and both are refused.',
    },
    {
      name: 'maxWidth',
      type: "'xs' | 'sm' | 'md' | 'lg' | 'xl' | false",
      default: "'sm'",
      description:
        'Widest the panel will grow — MUI’s breakpoint scale, unchanged, or `false` to lift the cap. Left alone the panel hugs its content up to this width.',
    },
    {
      name: 'fullWidth',
      type: 'boolean',
      default: 'false',
      description:
        'Grow the panel to `maxWidth` instead of hugging its content. Set it on any dialog with fields in it — a form that sizes itself to its longest label reflows as the user types.',
    },
    {
      name: 'fullScreen',
      type: 'boolean',
      default: 'false',
      description:
        'Fill the viewport, dropping the margin and the corners. Pair it with `useMediaQuery` rather than hardcoding it, so a dialog is only full screen where the screen is small.',
    },
    {
      name: 'scroll',
      type: "'paper' | 'body'",
      default: "'paper'",
      description:
        'Where a dialog too tall for the viewport scrolls. `paper` keeps the title and footer fixed and scrolls the body between them; `body` scrolls the whole panel inside the page.',
    },
    {
      name: 'role',
      type: "'dialog' | 'alertdialog'",
      default: "'dialog'",
      description:
        'Use `alertdialog` for an interruption that has to be dealt with before anything else — a destructive confirmation, a lost connection.',
    },
    {
      name: 'slotProps',
      type: '{ paper, backdrop, container, root, transition }',
      default: '{}',
      description:
        'Props for each part of the overlay. The panel is drawn flat because the backdrop does the separating, so `slotProps={{ paper: { sx: { boxShadow: 3 } } }}` is how a dialog gets a shadow back if it needs one.',
    },
    {
      name: 'DialogTitle children',
      type: 'ReactNode',
      default: '—',
      description:
        'The title line — 20/28 at medium weight, in the heading ink. Rendered as a real `h2` inside the title block.',
    },
    {
      name: 'DialogTitle subtitle',
      type: 'ReactNode',
      default: '—',
      description:
        'The 13px line under the title. Use it for the consequence of the decision, not for a restatement of the title.',
    },
    {
      name: 'DialogTitle icon',
      type: 'ReactNode',
      default: '—',
      description:
        'A glyph, shown in a 44px primary badge above the title. Pass the icon itself — the badge is drawn by the title, and it is decoration rather than a control, so it is not focusable.',
    },
    {
      name: 'DialogTitle onClose',
      type: '(event) => void',
      default: '—',
      description:
        'Renders the 32px close button at the trailing edge and fires when it is clicked. Omit it and no button renders, the same way `Alert` decides. Usually the same handler `Dialog`’s `onClose` gets.',
    },
    {
      name: 'DialogTitle slotProps',
      type: '{ closeButton }',
      default: '{}',
      description:
        'Props forwarded to the close button, which is an `IconButton` and takes the full house API. For a translated label: `slotProps={{ closeButton: { "aria-label": "Fermer" } }}`.',
    },
    {
      name: 'DialogContent children',
      type: 'ReactNode',
      default: '—',
      description:
        'The body. The region carries padding and nothing else, so anything goes here — a `TextField`, a `Select`, a `Stack` of them, an `Alert`, a list of `Checkbox` rows.',
    },
    {
      name: 'DialogContent dividers',
      type: 'boolean',
      default: 'false',
      description:
        'Draw a rule above and below the body. For a long scrolling body, so the content visibly runs under the title rather than stopping short of it.',
    },
    {
      name: 'DialogContentText children',
      type: 'ReactNode',
      default: '—',
      description:
        'A paragraph of body copy inside `DialogContent`, at the 13/20 body rung. Use it for prose; put fields and lists straight into `DialogContent` without it.',
    },
    {
      name: 'DialogActions children',
      type: 'ReactNode',
      default: '—',
      description:
        'The footer row, pushed to the trailing edge with 4px between children. A leading description is a composition — put the text first and add `sx={{ justifyContent: "space-between" }}`.',
    },
    {
      name: 'DialogActions disableSpacing',
      type: 'boolean',
      default: 'false',
      description:
        'Turn off the 4px gap between children, for a footer that manages its own spacing.',
    },
    {
      name: 'sx',
      type: 'SxProps<Theme>',
      default: '—',
      description:
        'One-off styling, available on all five parts. The surface, border, radius, padding, and the footer’s rule already come from tokens.',
    },
  ],
  examples: [
    {
      title: 'A confirmation',
      description:
        'A title on its own over a sentence of body copy. `alertdialog` because the decision is destructive.',
      code: `const [open, setOpen] = React.useState(false);

<Dialog open={open} onClose={() => setOpen(false)} role="alertdialog">
  <DialogTitle onClose={() => setOpen(false)}>Delete workspace?</DialogTitle>
  <DialogContent>
    <DialogContentText>
      Every project in this workspace is removed permanently. This cannot be undone.
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button appearance="text" variant="secondary" size="sm" onClick={() => setOpen(false)}>
      Cancel
    </Button>
    <Button variant="error" size="sm" onClick={handleDelete}>
      Delete workspace
    </Button>
  </DialogActions>
</Dialog>`,
    },
    {
      title: 'A title with a subtitle',
      description:
        'The subtitle carries what happens next, so the title can stay short.',
      code: `<Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
  <DialogTitle subtitle="They will get an email invitation." onClose={handleClose}>
    Invite a teammate
  </DialogTitle>
  <DialogContent>
    <TextField label="Email" placeholder="name@company.com" fullWidth />
  </DialogContent>
  <DialogActions>
    <Button appearance="text" variant="secondary" size="sm" onClick={handleClose}>
      Cancel
    </Button>
    <Button size="sm" onClick={handleSend}>Send invite</Button>
  </DialogActions>
</Dialog>`,
    },
    {
      title: 'A title with an icon badge',
      description:
        'The `icon` cell — a 44px primary badge above the title. Use it where the dialog needs to be recognised before it is read.',
      code: `<Dialog open={open} onClose={handleClose} role="alertdialog">
  <DialogTitle
    icon={<WarningIcon />}
    subtitle="Two of your integrations stopped syncing 40 minutes ago."
    onClose={handleClose}
  >
    Sync failed
  </DialogTitle>
  <DialogContent>
    <Alert severity="error">Stripe and HubSpot both returned 401.</Alert>
  </DialogContent>
  <DialogActions>
    <Button appearance="text" variant="secondary" size="sm" onClick={handleClose}>
      Dismiss
    </Button>
    <Button size="sm" onClick={handleRetry}>Reconnect</Button>
  </DialogActions>
</Dialog>`,
    },
    {
      title: 'A form',
      description:
        '`fullWidth` with a `maxWidth`, so the panel keeps one width instead of resizing to its longest field.',
      code: `<Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
  <DialogTitle subtitle="Only you and the people you invite can see it." onClose={handleClose}>
    New project
  </DialogTitle>
  <DialogContent>
    <Stack spacing={3}>
      <TextField label="Name" fullWidth />
      <Select label="Workspace" fullWidth defaultValue="acme">
        <MenuItem value="acme">Acme</MenuItem>
        <MenuItem value="personal">Personal</MenuItem>
      </Select>
      <DatePicker label="Target date" />
    </Stack>
  </DialogContent>
  <DialogActions>
    <Button appearance="text" variant="secondary" size="sm" onClick={handleClose}>
      Cancel
    </Button>
    <Button size="sm" type="submit">Create project</Button>
  </DialogActions>
</Dialog>`,
    },
    {
      title: 'A footer with a description',
      description:
        'The text goes in first and `space-between` opens the row up; the buttons are grouped so the 4px between them survives.',
      code: `<DialogActions sx={{ justifyContent: 'space-between' }}>
  <Stack>
    <Typography variant="body2">Draft saved</Typography>
    <Typography variant="caption" color="text.secondary">4 minutes ago</Typography>
  </Stack>
  <Stack direction="row" spacing={0.5}>
    <Button appearance="text" variant="secondary" size="sm" onClick={handleClose}>
      Discard
    </Button>
    <Button size="sm" onClick={handlePublish}>Publish</Button>
  </Stack>
</DialogActions>`,
    },
    {
      title: 'A footer of icon buttons',
      description:
        'Four 32px controls, for a dialog that acts on the thing it is showing rather than closing on a decision.',
      code: `<DialogActions sx={{ justifyContent: 'space-between' }}>
  <Typography variant="body2" color="text.secondary">Invoice #4021</Typography>
  <Stack direction="row" spacing={0.5}>
    <IconButton variant="secondary" size="sm" aria-label="Add line item">
      <PlusSquareIcon />
    </IconButton>
    <IconButton variant="secondary" size="sm" aria-label="Duplicate">
      <CopySimpleIcon />
    </IconButton>
    <IconButton variant="secondary" size="sm" aria-label="Delete">
      <TrashSimpleIcon />
    </IconButton>
    <IconButton variant="secondary" size="sm" aria-label="Send">
      <PaperPlaneTiltIcon />
    </IconButton>
  </Stack>
</DialogActions>`,
    },
    {
      title: 'A long body that scrolls',
      description:
        '`dividers` rules the body off from the title and footer, which stay put while it scrolls.',
      code: `<Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
  <DialogTitle subtitle="Select the invoices to include." onClose={handleClose}>
    Invoice selection
  </DialogTitle>
  <DialogContent dividers>
    <Stack>
      {invoices.map((invoice) => (
        <Checkbox key={invoice.id} label={invoice.reference} />
      ))}
    </Stack>
  </DialogContent>
  <DialogActions>
    <Button appearance="text" variant="secondary" size="sm" onClick={handleClose}>
      Cancel
    </Button>
    <Button size="sm" onClick={handleAttach}>Attach 3 invoices</Button>
  </DialogActions>
</Dialog>`,
    },
    {
      title: 'A decision that has to be made',
      description:
        'No close button and no dismissal: `onClose` is left off the dialog, so Escape and a backdrop click are both refused, and the title gets no `onClose` either.',
      code: `<Dialog open={open} role="alertdialog" fullWidth maxWidth="xs">
  <DialogTitle subtitle="Accept them to keep using your account.">
    Terms updated
  </DialogTitle>
  <DialogContent>
    <DialogContentText>
      We have changed how long we keep deleted records. Nothing else has changed.
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button appearance="text" variant="secondary" size="sm" onClick={handleSignOut}>
      Sign out
    </Button>
    <Button size="sm" onClick={handleAccept}>Accept</Button>
  </DialogActions>
</Dialog>`,
    },
  ],
  dos: [
    'Give the footer one clear primary action and put it last — the trailing edge is where the eye lands, and the design draws `Cancel` then `Action` in that order.',
    'Use `size="sm"` on the footer buttons — a dialog footer is a row of 32px controls, which is `Button`’s `sm`.',
    'Set `fullWidth` with a `maxWidth` on any dialog containing fields, so the panel does not resize as the content changes.',
    'Pass the same handler to `Dialog`’s `onClose` and `DialogTitle`’s, so Escape, the backdrop, and the close button all do one thing.',
    'Use `role="alertdialog"` for a destructive confirmation, and leave `onClose` off entirely when a decision genuinely cannot be deferred.',
  ],
  donts: [
    'Don’t reach for a dialog to show information the page could show in place — it blocks everything behind it, so it should be asking a question.',
    'Don’t put a shadow on the panel to make it stand out; the backdrop already separates it, which is why the design draws a flat edge.',
    'Don’t build the title row by hand — `subtitle`, `icon`, and `onClose` already cover it, and a hand-built row will not line up with one that uses them.',
    'Don’t pass an `IconButton` as the title’s `icon` — pass the glyph. The badge is decoration, and a control there has nothing to do.',
    'Don’t stack a second dialog on top of one that is already open; put the second step in the same panel, or close the first.',
  ],
  relatedComponents: ['Card', 'Menu', 'Alert', 'Button', 'IconButton'],
};
