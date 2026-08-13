'use client';

import * as React from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Alert } from '@/src/components/Alert';
import { Button } from '@/src/components/Button';
import { Checkbox } from '@/src/components/Checkbox';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@/src/components/Dialog';
import { IconButton } from '@/src/components/IconButton';
import { MenuItem } from '@/src/components/MenuItem';
import { Select } from '@/src/components/Select';
import { TextField } from '@/src/components/TextField';
import {
  CopySimpleIcon,
  PaperPlaneTiltIcon,
  PlusSquareIcon,
  TrashSimpleIcon,
  WarningIcon,
} from '@/src/icons';

function PreviewCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        {children}
      </Paper>
    </Stack>
  );
}

PreviewCard.displayName = 'PreviewCard';

/**
 * A trigger plus the dialog it opens. Every preview on this page is a real
 * dialog rather than a picture of one — a modal is its backdrop and its
 * focus behaviour as much as its panel, and an inline copy would show
 * neither.
 */
function Demo({
  label,
  children,
}: {
  label: string;
  children: (close: () => void, open: boolean) => React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const close = React.useCallback(() => setOpen(false), []);

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        {label}
      </Button>
      {children(close, open)}
    </>
  );
}

Demo.displayName = 'Demo';

/** The three title layouts, side by side, each on its own trigger. */
function TitleCells() {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <Demo label="Title only">
        {(close, open) => (
          <Dialog open={open} onClose={close} role="alertdialog">
            <DialogTitle onClose={close}>Delete workspace?</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Every project in this workspace is removed permanently. This
                cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                appearance="text"
                variant="secondary"
                size="sm"
                onClick={close}
              >
                Cancel
              </Button>
              <Button variant="error" size="sm" onClick={close}>
                Delete workspace
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Demo>

      <Demo label="With a subtitle">
        {(close, open) => (
          <Dialog open={open} onClose={close} fullWidth maxWidth="xs">
            <DialogTitle
              subtitle="They will get an email invitation."
              onClose={close}
            >
              Invite a teammate
            </DialogTitle>
            <DialogContent>
              <TextField
                label="Email"
                placeholder="name@company.com"
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button
                appearance="text"
                variant="secondary"
                size="sm"
                onClick={close}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={close}>
                Send invite
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Demo>

      <Demo label="With an icon badge">
        {(close, open) => (
          <Dialog open={open} onClose={close} role="alertdialog">
            <DialogTitle
              icon={<WarningIcon />}
              subtitle="Two of your integrations stopped syncing 40 minutes ago."
              onClose={close}
            >
              Sync failed
            </DialogTitle>
            <DialogContent>
              <Alert severity="error">
                Stripe and HubSpot both returned 401.
              </Alert>
            </DialogContent>
            <DialogActions>
              <Button
                appearance="text"
                variant="secondary"
                size="sm"
                onClick={close}
              >
                Dismiss
              </Button>
              <Button size="sm" onClick={close}>
                Reconnect
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Demo>
    </Stack>
  );
}

TitleCells.displayName = 'TitleCells';

/** A form, at a pinned width so it does not resize as fields fill. */
function FormDialog() {
  return (
    <Demo label="Open the form">
      {(close, open) => (
        <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
          <DialogTitle
            subtitle="Only you and the people you invite can see it."
            onClose={close}
          >
            New project
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3}>
              <TextField label="Name" placeholder="Q4 migration" fullWidth />
              <Select label="Workspace" defaultValue="acme" fullWidth>
                <MenuItem value="acme">Acme</MenuItem>
                <MenuItem value="personal">Personal</MenuItem>
              </Select>
              <TextField
                label="Description"
                multiline
                minRows={3}
                fullWidth
                helperText="Optional."
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              appearance="text"
              variant="secondary"
              size="sm"
              onClick={close}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={close}>
              Create project
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Demo>
  );
}

FormDialog.displayName = 'FormDialog';

/** Footers that lead with text, with buttons or icon buttons trailing. */
function FooterCells() {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <Demo label="Text and buttons">
        {(close, open) => (
          <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
            <DialogTitle onClose={close}>Publish changes</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Six edits go live immediately. Anyone with the link will see
                them.
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'space-between' }}>
              <Stack>
                <Typography variant="body2">Draft saved</Typography>
                <Typography variant="caption" color="text.secondary">
                  4 minutes ago
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.5}>
                <Button
                  appearance="text"
                  variant="secondary"
                  size="sm"
                  onClick={close}
                >
                  Discard
                </Button>
                <Button size="sm" onClick={close}>
                  Publish
                </Button>
              </Stack>
            </DialogActions>
          </Dialog>
        )}
      </Demo>

      <Demo label="Text and icon buttons">
        {(close, open) => (
          <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
            <DialogTitle subtitle="Due 12 September" onClose={close}>
              Invoice #4021
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                Three line items, £4,180 excluding VAT.
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Invoice #4021
              </Typography>
              <Stack direction="row" spacing={0.5}>
                <IconButton
                  variant="secondary"
                  size="sm"
                  aria-label="Add line item"
                >
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
            </DialogActions>
          </Dialog>
        )}
      </Demo>
    </Stack>
  );
}

FooterCells.displayName = 'FooterCells';

const INVOICES = [
  'INV-4021 — Acme Ltd',
  'INV-4022 — Northwind',
  'INV-4023 — Globex',
  'INV-4024 — Initech',
  'INV-4025 — Umbrella',
  'INV-4026 — Soylent',
  'INV-4027 — Hooli',
  'INV-4028 — Vehement',
  'INV-4029 — Massive Dynamic',
  'INV-4030 — Cyberdyne',
  'INV-4031 — Stark Industries',
  'INV-4032 — Wayne Enterprises',
];

/** A body too tall for the panel, ruled off from the title and footer. */
function ScrollingDialog() {
  return (
    <Demo label="Open the long one">
      {(close, open) => (
        <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
          <DialogTitle
            subtitle="Select the invoices to include."
            onClose={close}
          >
            Invoice selection
          </DialogTitle>
          <DialogContent dividers>
            <Stack>
              {INVOICES.map((invoice) => (
                <Checkbox key={invoice} label={invoice} />
              ))}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              appearance="text"
              variant="secondary"
              size="sm"
              onClick={close}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={close}>
              Attach selected
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Demo>
  );
}

ScrollingDialog.displayName = 'ScrollingDialog';

/**
 * No dismissal at all — no `onClose` on the dialog, so Escape and the
 * backdrop are refused, and no `onClose` on the title, so no close button
 * renders. The only ways out are the two buttons.
 */
function UndismissableDialog() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Open (Escape will not close it)
      </Button>
      <Dialog open={open} role="alertdialog" fullWidth maxWidth="xs">
        <DialogTitle subtitle="Accept them to keep using your account.">
          Terms updated
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            We have changed how long we keep deleted records. Nothing else has
            changed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            appearance="text"
            variant="secondary"
            size="sm"
            onClick={() => setOpen(false)}
          >
            Sign out
          </Button>
          <Button size="sm" onClick={() => setOpen(false)}>
            Accept
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

UndismissableDialog.displayName = 'UndismissableDialog';

/** Full screen, which drops the margin and squares the corners. */
function FullScreenDialog() {
  return (
    <Demo label="Open full screen">
      {(close, open) => (
        <Dialog open={open} onClose={close} fullScreen>
          <DialogTitle subtitle="Everything, edge to edge." onClose={close}>
            Full screen
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              The panel fills the viewport, so the margin goes and the corners
              square off. Drive it from `useMediaQuery` — full screen is a
              small-screen treatment.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button size="sm" onClick={close}>
              Done
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Demo>
  );
}

FullScreenDialog.displayName = 'FullScreenDialog';

/** Every width on MUI's scale, so the default can be judged against them. */
function Widths() {
  return (
    <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
      {(['xs', 'sm', 'md', 'lg'] as const).map((maxWidth) => (
        <Demo key={maxWidth} label={maxWidth}>
          {(close, open) => (
            <Dialog open={open} onClose={close} fullWidth maxWidth={maxWidth}>
              <DialogTitle
                subtitle={`fullWidth with maxWidth="${maxWidth}".`}
                onClose={close}
              >
                Width {maxWidth}
              </DialogTitle>
              <DialogContent>
                <DialogContentText>
                  The default is `sm`. With `fullWidth` set, the panel grows to
                  the cap instead of hugging its content.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button size="sm" onClick={close}>
                  Close
                </Button>
              </DialogActions>
            </Dialog>
          )}
        </Demo>
      ))}
    </Stack>
  );
}

Widths.displayName = 'Widths';

export function DialogShowcase() {
  return (
    <Stack spacing={5}>
      <PreviewCard
        title="Three title layouts"
        description="A title on its own, a title with a subtitle under it, and a title with a 44px icon badge above it. All three take the close button."
      >
        <TitleCells />
      </PreviewCard>

      <PreviewCard
        title="A form"
        description="`fullWidth` with a `maxWidth`, so the panel keeps one width instead of resizing to its longest field. The body is ordinary Atoms components — nothing about the content region is dialog-specific."
      >
        <FormDialog />
      </PreviewCard>

      <PreviewCard
        title="A footer that leads with text"
        description="Put the text in first and add `sx={{ justifyContent: 'space-between' }}` to open the row up, grouping the buttons so the 4px between them survives. The trailing side can be buttons or icon buttons."
      >
        <FooterCells />
      </PreviewCard>

      <PreviewCard
        title="A body that scrolls"
        description="`dividers` rules the body off, and the title and footer stay put while it moves. The rules are drawn in the panel's own border token, so they match the edge around it in both colour schemes."
      >
        <ScrollingDialog />
      </PreviewCard>

      <PreviewCard
        title="A decision that has to be made"
        description="No `onClose` anywhere: Escape and the backdrop are both refused and no close button renders. Use it sparingly — it is the only way out of a dialog being a button."
      >
        <UndismissableDialog />
      </PreviewCard>

      <PreviewCard
        title="Full screen"
        description="Drops the 32px margin and squares the corners, since a panel filling the viewport has no outside edge to round. Pair it with `useMediaQuery` rather than setting it outright."
      >
        <FullScreenDialog />
      </PreviewCard>

      <PreviewCard
        title="Widths"
        description="MUI's scale, unchanged. The default is `sm`."
      >
        <Widths />
      </PreviewCard>
    </Stack>
  );
}

DialogShowcase.displayName = 'DialogShowcase';
