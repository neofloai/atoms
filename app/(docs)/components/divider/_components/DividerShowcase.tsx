'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Divider } from '@/src/components/Divider';
import { surface } from '@/src/tokens';

import type { DividerTextAlign } from '@/src/components/Divider';

/**
 * Live previews for the Divider page.
 *
 * Two of these carry weight beyond decoration.
 *
 * "Every surface" is the one design decision on this page rendered so a
 * reviewer can check it instead of taking it on trust. Each layer shows
 * MUI's `palette.divider` above the Neoflo token, and on dark `card 1`
 * the MUI rule is the same colour as the surface — it disappears
 * entirely. That is the whole argument for the override, and it is
 * visible rather than asserted.
 *
 * "Why a vertical divider vanishes" exists because `flexItem` is the
 * single most common thing to miss, and a preview that shows the
 * failure next to the fix answers the question faster than the prop
 * table does.
 *
 * Previews import from `@/src/components/*`, so the page exercises the
 * same export path a consumer of `@neoflo/atoms` would take.
 */

function PreviewCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      {hint && (
        <Typography variant="body2" color="text.secondary">
          {hint}
        </Typography>
      )}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        {children}
      </Paper>
    </Stack>
  );
}

PreviewCard.displayName = 'PreviewCard';

const SURFACES = [
  { label: 'page', token: surface.layers.page },
  { label: 'card 1', token: surface.layers.card1 },
  { label: 'card 2', token: surface.layers.card2 },
  { label: 'card 3', token: surface.layers.card3 },
];

const TEXT_ALIGNS: readonly DividerTextAlign[] = ['left', 'center', 'right'];

/** Measured light/dark contrast against each layer — see `Divider.tsx`. */
const CONTRAST: Record<string, { mui: string; ours: string }> = {
  page: { mui: '1.25 / 1.07', ours: '1.61 / 1.86' },
  'card 1': { mui: '1.22 / 1.00', ours: '1.57 / 1.74' },
  'card 2': { mui: '1.16 / 1.05', ours: '1.50 / 1.66' },
  'card 3': { mui: '1.09 / 1.15', ours: '1.41 / 1.51' },
};

export function DividerShowcase() {
  return (
    <Stack spacing={4}>
      <PreviewCard
        title="Between sections"
        hint="The default — a full-width rule rendered as a real <hr>. The space around it comes from the layout, not from the divider."
      >
        <Stack spacing={2}>
          <Typography variant="body2">Account details</Typography>
          <Divider />
          <Typography variant="body2">Billing</Typography>
          <Divider />
          <Typography variant="body2">Notifications</Typography>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Why a vertical divider vanishes"
        hint="A vertical divider is a flex child with no intrinsic height, so inside a row it computes to 0px tall and renders nothing. flexItem stretches it to the height of the row. Both sides below are the same markup apart from that one prop."
      >
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              without <code>flexItem</code> — nothing renders
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              sx={{ alignItems: 'center', minHeight: 40 }}
            >
              <Typography variant="body2">Drafts</Typography>
              <Divider orientation="vertical" />
              <Typography variant="body2">Sent</Typography>
              <Divider orientation="vertical" />
              <Typography variant="body2">Archived</Typography>
            </Stack>
          </Stack>
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              with <code>flexItem</code>
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              sx={{ alignItems: 'center', minHeight: 40 }}
            >
              <Typography variant="body2">Drafts</Typography>
              <Divider orientation="vertical" flexItem />
              <Typography variant="body2">Sent</Typography>
              <Divider orientation="vertical" flexItem />
              <Typography variant="body2">Archived</Typography>
            </Stack>
          </Stack>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Labelled"
        hint="Children split the rule into two segments around the text. textAlign moves the label along the rule; it is ignored on a vertical divider, which always centres."
      >
        <Stack spacing={3}>
          {TEXT_ALIGNS.map((align) => (
            <Stack key={align} spacing={1}>
              <Typography variant="caption" color="text.secondary">
                textAlign=&quot;{align}&quot;
              </Typography>
              <Divider textAlign={align}>Archived</Divider>
            </Stack>
          ))}
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="As a Stack separator"
        hint="Stack's divider prop inserts one element between every pair of children and none at the ends, so the count stays right however many children there are."
      >
        <Stack
          direction="row"
          spacing={2}
          divider={<Divider orientation="vertical" flexItem />}
          sx={{ flexWrap: 'wrap' }}
        >
          <Typography variant="body2">12 open</Typography>
          <Typography variant="body2">4 closed</Typography>
          <Typography variant="body2">1 blocked</Typography>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Every surface"
        hint="The one decision on this page, rendered. Each layer shows MUI's palette.divider above the Neoflo hairline. On dark card 1 the MUI rule is exactly the same colour as the surface — 1.00:1 — so it does not render at all. Switch the page to dark mode to see it go."
      >
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
            {SURFACES.map(({ label, token }) => (
              <Box
                key={label}
                sx={(theme) => ({
                  p: 2,
                  borderRadius: 2,
                  minWidth: 168,
                  flex: '1 1 168px',
                  backgroundColor: token.light,
                  ...theme.applyStyles('dark', {
                    backgroundColor: token.dark,
                  }),
                })}
              >
                <Stack spacing={1.5}>
                  <Typography variant="caption" color="text.secondary">
                    {label}
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      palette.divider
                    </Typography>
                    {/* Drawn by hand rather than with MUI's Divider, so
                        the comparison is against the raw palette value
                        this component deliberately stops using. */}
                    <Box
                      sx={{ borderTop: 1, borderColor: 'divider', height: 0 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {CONTRAST[label].mui}
                    </Typography>
                  </Stack>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Atoms Divider
                    </Typography>
                    <Divider />
                    <Typography variant="caption" color="text.secondary">
                      {CONTRAST[label].ours}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Ratios are light / dark. None reaches the 3:1 of WCAG 1.4.11,
            and none needs to — that threshold covers controls and graphics
            required to understand the content, and a separator is neither.
            The bar is that the rule is visible on every layer, which
            palette.divider was failing outright.
          </Typography>
        </Stack>
      </PreviewCard>
    </Stack>
  );
}

DividerShowcase.displayName = 'DividerShowcase';
