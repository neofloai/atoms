'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';

import { Typography } from '@/src/components/Typography';
import { typography as tokens } from '@/src/tokens';

import type {
  TypographyVariant,
  TypographyWeight,
} from '@/src/components/Typography';

/**
 * Every label and heading on this page is rendered with the Atoms
 * `Typography`, including the chrome around the specimens — which means
 * the "subtitle" rows below are `body1` in its Medium cut, because that
 * is the migration this page recommends. The rest of the docs site
 * predates the component and still uses MUI's directly.
 */
interface Rung {
  variant: TypographyVariant;
  size: number;
  leading: number;
  /** Spread in from the token slot; annotated in `em`, not shown here. */
  letterSpacing: number;
  specimen: string;
}

const RUNGS: readonly Rung[] = [
  { variant: 'h1', ...tokens.headings.h1, specimen: 'Atoms' },
  { variant: 'h2', ...tokens.headings.h2, specimen: 'Atoms' },
  { variant: 'h3', ...tokens.headings.h3, specimen: 'Query Log' },
  { variant: 'h4', ...tokens.headings.h4, specimen: 'Query Log' },
  { variant: 'h5', ...tokens.headings.h5, specimen: 'Sign in' },
  { variant: 'h6', ...tokens.headings.h6, specimen: 'Recent activity' },
  {
    variant: 'body1',
    ...tokens.body.b1,
    specimen: 'The default rung. Most copy on a screen sits here.',
  },
  {
    variant: 'body2',
    ...tokens.body.b2,
    specimen: 'One rung down, for the supporting line under a title.',
  },
  {
    variant: 'caption',
    ...tokens.body.caption,
    specimen: 'Labels, units, and metadata.',
  },
];

const WEIGHTS: readonly TypographyWeight[] = ['regular', 'medium', 'semibold'];

function SectionLabel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="body1" weight="medium">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Stack>
  );
}

SectionLabel.displayName = 'SectionLabel';

function PreviewCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={1.5}>
      <SectionLabel title={title} description={description} />
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        {children}
      </Paper>
    </Stack>
  );
}

PreviewCard.displayName = 'PreviewCard';

/**
 * A specimen with its own numbers beside it, read from the tokens rather
 * than typed in — so the annotation cannot drift from what is rendered.
 */
function RungRow({ rung }: { rung: Rung }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={{ xs: 0.5, sm: 3 }}
      sx={{ alignItems: { sm: 'baseline' }, py: 1.5 }}
    >
      <Stack sx={{ width: 96, flexShrink: 0 }}>
        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
          {rung.variant}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {rung.size}/{rung.leading}
        </Typography>
      </Stack>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant={rung.variant}>{rung.specimen}</Typography>
      </Box>
    </Stack>
  );
}

RungRow.displayName = 'RungRow';

/**
 * Live rendering of the type scale: every rung the theme defines, both
 * weight cuts, and the two places the component departs from MUI's.
 */
export function TypographyShowcase() {
  return (
    <Stack spacing={4}>
      <PreviewCard
        title="The scale"
        description="Nine rungs plus `inherit`. Size and leading are read from the typography tokens for the annotation, so these numbers are the ones actually being rendered."
      >
        <Stack divider={<Box sx={{ borderTop: 1, borderColor: 'divider' }} />}>
          {RUNGS.map((rung) => (
            <RungRow key={rung.variant} rung={rung} />
          ))}
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Two cuts per rung"
        description="Each rung ships a Medium and a Regular with identical size and leading. The variant picks one — Medium for headings, Regular for body — and `weight` reaches the others."
      >
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              body1
            </Typography>
            {WEIGHTS.map((weight) => (
              <Stack key={weight} direction="row" spacing={3}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ width: 72, flexShrink: 0, fontFamily: 'monospace' }}
                >
                  {weight}
                </Typography>
                <Typography variant="body1" weight={weight}>
                  Billing and invoices
                </Typography>
              </Stack>
            ))}
          </Stack>
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              h6
            </Typography>
            {WEIGHTS.map((weight) => (
              <Stack key={weight} direction="row" spacing={3}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ width: 72, flexShrink: 0, fontFamily: 'monospace' }}
                >
                  {weight}
                </Typography>
                <Typography variant="h6" weight={weight}>
                  Recent activity
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="The size and the element are separate"
        description="Both of these render an h1. The rung is a visual decision and the element is a document one, so `variant` and `component` are set independently."
      >
        <Stack spacing={2}>
          <Typography variant="h5" component="h1">
            Sign in
          </Typography>
          <Typography variant="h3" component="h1">
            Query Log
          </Typography>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="A title and its supporting line"
        description="The pair most screens open with. The gap belongs to the Stack rather than to a margin on either line."
      >
        <Stack spacing={0.5}>
          <Typography variant="h5" component="h1">
            Sign in
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter your email and password to continue.
          </Typography>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Truncating instead of wrapping"
        description="`noWrap` needs a width to overflow. Useful in a table cell or a row where wrapping would change the height."
      >
        <Typography variant="body2" noWrap sx={{ maxWidth: 260 }}>
          INV-2026-0841 — Northwind Traders, net 30, awaiting approval
        </Typography>
      </PreviewCard>
    </Stack>
  );
}

TypographyShowcase.displayName = 'TypographyShowcase';
