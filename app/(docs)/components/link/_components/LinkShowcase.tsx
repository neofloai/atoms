'use client';

import * as React from 'react';
import NextLink from 'next/link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Alert } from '@/src/components/Alert';
import { Button } from '@/src/components/Button';
import { Link } from '@/src/components/Link';
import type { LinkColor } from '@/src/components/Link';

const ROLES: readonly LinkColor[] = [
  'primary',
  'secondary',
  'success',
  'error',
  'warning',
  'information',
];

const ENDPOINT =
  'https://atoms.neoflo.ai/mcp?transport=streamable-http&client=cursor';

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

/** One labelled cell, so a row of samples reads without a legend. */
function Sample({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={0.5} sx={{ minWidth: 160 }}>
      {children}
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}

Sample.displayName = 'Sample';

/** The `component="button"` case, with something to actually do. */
function ResendCode() {
  const [sent, setSent] = React.useState(0);

  return (
    <Stack spacing={1}>
      <Typography variant="body1">
        We sent a code to a@neoflo.ai.{' '}
        <Link component="button" type="button" onClick={() => setSent(sent + 1)}>
          Resend the code
        </Link>
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {sent === 0 ? 'Not sent yet' : `Sent ${sent} more time(s)`}
      </Typography>
    </Stack>
  );
}

ResendCode.displayName = 'ResendCode';

export function LinkShowcase() {
  return (
    <Stack spacing={5}>
      <PreviewCard
        title="Inside a sentence"
        description="The default: the paragraph's own size, the role's body ink, and an underline at 40% of that ink. Hover takes the underline to full strength and dims the ink one rung; Tab draws the focus outline."
      >
        <Typography variant="body1" sx={{ maxWidth: 520 }}>
          Usage resets on the first of each month. See the{' '}
          <Link href="/tokens">billing settings</Link> for the current plan, or{' '}
          <Link href="/help">talk to support</Link> if a charge looks wrong.
        </Typography>
      </PreviewCard>

      <PreviewCard
        title="Colour roles"
        description="Six roles, each resting on its text/<role>/body rung — the same ink an outline Button of that role uses for its label. warning is included for parity with Chip and Badge, and it is the one role whose hover rung measures under 4.5:1 on a light page."
      >
        <Stack direction="row" spacing={3} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {ROLES.map((role) => (
            <Sample key={role} label={role}>
              <Link href="/tokens" color={role} variant="body1">
                Compare plans
              </Link>
            </Sample>
          ))}
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Inheriting the copy around it"
        description="color=&quot;inherit&quot; paints nothing, so the link keeps the colour of whatever it sits in and marks itself with the underline alone. The two below are the same component."
      >
        <Stack spacing={2} sx={{ maxWidth: 520 }}>
          <Alert severity="warning">
            Your card expires this month.{' '}
            <Link href="/tokens" color="inherit">
              Update it now
            </Link>
          </Alert>
          <Typography variant="caption" color="text.secondary">
            Prices exclude tax.{' '}
            <Link href="/tokens" color="inherit">
              See how tax is calculated
            </Link>
          </Typography>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="The three underlines"
        description="always for prose — 40% of the ink, full strength on hover. hover and none only where position already says the thing is a link, such as a nav row or a footer column; none has the colour shift alone to mark hover."
      >
        <Stack direction="row" spacing={4}>
          <Sample label='underline="always"'>
            <Link href="/tokens" variant="body1">
              Documentation
            </Link>
          </Sample>
          <Sample label='underline="hover"'>
            <Link href="/tokens" variant="body1" underline="hover">
              Documentation
            </Link>
          </Sample>
          <Sample label='underline="none"'>
            <Link href="/tokens" variant="body1" underline="none">
              Documentation
            </Link>
          </Sample>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Where it goes, and how"
        description="A router link, an external tab named as one, and a URL held to one line."
      >
        <Stack spacing={2} sx={{ maxWidth: 520 }}>
          <Link component={NextLink} href="/tokens" variant="body1">
            Design tokens (client-side navigation)
          </Link>
          <Link
            href="https://mui.com/material-ui/react-link/"
            target="_blank"
            rel="noreferrer"
            variant="body1"
          >
            MUI Link documentation (opens in a new tab)
          </Link>
          <Link
            href={ENDPOINT}
            variant="body2"
            noWrap
            sx={{ display: 'block', maxWidth: 320 }}
          >
            {ENDPOINT}
          </Link>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="When there is nowhere to go"
        description="component=&quot;button&quot; renders a real button — Space works, the form is not submitted because type=&quot;button&quot; is set, and no fake href is left in the status bar."
      >
        <ResendCode />
      </PreviewCard>

      <PreviewCard
        title="A link is not a button"
        description="Both of these are clickable; only one of them is a destination. If the browser's back button would not undo it, it is an action, and it belongs in a Button."
      >
        <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
          <Sample label="navigates">
            <Link href="/tokens" variant="body1">
              View invoice
            </Link>
          </Sample>
          <Sample label="acts">
            <Button size="sm">Download invoice</Button>
          </Sample>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="sx still wins"
        description="The wrapper's own ink and underline are merged into sx before the caller's, so an override in sx beats them instead of losing to them. Both links below are the same component with the same color prop."
      >
        <Stack direction="row" spacing={4}>
          <Sample label="as shipped">
            <Link href="/tokens" variant="body1">
              Q3 revenue report
            </Link>
          </Sample>
          <Sample label='sx={{ color: "text.primary" }}'>
            <Link href="/tokens" variant="body1" sx={{ color: 'text.primary' }}>
              Q3 revenue report
            </Link>
          </Sample>
        </Stack>
      </PreviewCard>
    </Stack>
  );
}

LinkShowcase.displayName = 'LinkShowcase';
