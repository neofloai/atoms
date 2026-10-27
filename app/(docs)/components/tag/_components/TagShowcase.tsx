'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  CubeIcon,
  FilePdfIcon,
  LockIcon,
  WarningCircleIcon,
} from '@/src/icons';
import { Tag } from '@/src/components/Tag';
import { border, surface, text } from '@/src/tokens';

import type {
  TagAppearance,
  TagSize,
  TagVariant,
} from '@/src/components/Tag';

const variants: readonly TagVariant[] = [
  'secondary',
  'primary',
  'warning',
  'purple',
  'success',
  'orange',
  'error',
  'information',
];

const appearances: readonly TagAppearance[] = ['contained', 'outline'];

const sizes: readonly TagSize[] = ['md', 'sm'];

function PreviewCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        {children}
      </Paper>
    </Stack>
  );
}

PreviewCard.displayName = 'PreviewCard';

/**
 * Live rendering of every Tag variant: the colour x appearance matrix
 * at both sizes, the glyph slots, and the `colors` escape hatch.
 */
export function TagShowcase() {
  return (
    <Stack spacing={4}>
      {sizes.map((size) => (
        <PreviewCard
          key={size}
          title={size === 'md' ? 'Medium (md)' : 'Small (sm)'}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${variants.length}, max-content)`,
              gap: 2,
              alignItems: 'center',
              justifyItems: 'start',
              overflowX: 'auto',
            }}
          >
            {appearances.map((appearance) =>
              variants.map((variant) => (
                <Tag
                  key={`${appearance}-${variant}`}
                  size={size}
                  variant={variant}
                  appearance={appearance}
                  icon={<CubeIcon />}
                  label={variant}
                  endIcon={<CubeIcon />}
                />
              ))
            )}
          </Box>
        </PreviewCard>
      ))}

      <PreviewCard title="Outlined tags — a table&apos;s Status column">
        <Stack spacing={2}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Tag
              appearance="outline"
              variant="information"
              label="Extraction"
            />
            <Tag appearance="outline" variant="warning" label="Matching" />
            <Tag appearance="outline" variant="success" label="ERP Posting" />
            <Tag
              appearance="outline"
              variant="error"
              icon={<WarningCircleIcon />}
              label="Error"
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Only the error carries a glyph: a stage of the workflow is named by
            its label, and a glyph on all four would be decoration that stops
            the one that needs attention from standing out.
          </Typography>
        </Stack>
      </PreviewCard>

      <PreviewCard title="Glyphs">
        <Stack spacing={2}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Tag variant="secondary" icon={<FilePdfIcon />} label="invoice.pdf" />
            <Tag
              variant="secondary"
              label="invoice.pdf"
              endIcon={<LockIcon />}
            />
            <Tag
              variant="secondary"
              icon={<FilePdfIcon />}
              label="invoice.pdf"
              endIcon={<LockIcon />}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            <code>icon</code> leads and <code>endIcon</code> trails. Both are
            12px at either size and both take the label&apos;s colour.
          </Typography>
        </Stack>
      </PreviewCard>

      <PreviewCard title="A status the roles have no colour for">
        <Stack spacing={2}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Tag
              appearance="outline"
              label="Extraction"
              colors={{
                bg: surface.information.subtle,
                border: border.information.default,
                text: text.information[3],
              }}
            />
            <Tag
              appearance="outline"
              label="Review"
              colors={{ text: text.default.b1 }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            <code>colors</code> takes the fill, the outline and the label
            separately, and each falls back to the role — the second tag above
            changes only its label and keeps <code>primary</code>&apos;s fill
            and border. Reach for a role first: a status column is read by
            meaning, and a reader cannot tell from a decorative hue which of
            two statuses is the bad one. This is for a colour the roles
            genuinely do not carry.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pass tokens rather than hexes. A token is a{' '}
            <code>{'{ light, dark }'}</code> pair and resolves per scheme; a
            bare hex is light-mode only by definition, so it paints the same
            colour on a near-black page.
          </Typography>
        </Stack>
      </PreviewCard>
    </Stack>
  );
}

TagShowcase.displayName = 'TagShowcase';
