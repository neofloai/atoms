'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { FunnelSimpleIcon } from '@/src/icons';
import { Chip } from '@/src/components/Chip';

import type { ChipAppearance, ChipVariant } from '@/src/components/Chip';

const variants: readonly ChipVariant[] = [
  'primary',
  'secondary',
  'success',
  'error',
  'warning',
];

const smallVariants: readonly ChipVariant[] = [
  'secondary',
  'primary',
  'warning',
  'purple',
  'success',
  'orange',
  'error',
  'information',
];

const appearances: readonly ChipAppearance[] = ['contained', 'outline'];

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

function handleNoop(): void {
  // Demo-only handler so clickable / deletable affordances render.
}

const filters = ['Design', 'Engineering', 'Research'] as const;

/**
 * `selected` is a toggle, which a static swatch can't show — the point
 * is that the state survives the pointer leaving the chip.
 */
function FilterGroup() {
  const [active, setActive] = React.useState<readonly string[]>(['Design']);

  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
      {filters.map((filter) => {
        const isActive = active.includes(filter);
        return (
          <Chip
            key={filter}
            label={filter}
            appearance="outline"
            selected={isActive}
            onClick={() =>
              setActive((current) =>
                isActive
                  ? current.filter((f) => f !== filter)
                  : [...current, filter]
              )
            }
          />
        );
      })}
    </Stack>
  );
}

FilterGroup.displayName = 'FilterGroup';

/**
 * Live rendering of every Chip variant from the Figma component set:
 * the variant x appearance matrix, the two sizes, slot usage (avatar,
 * delete), and the disabled state.
 */
export function ChipShowcase() {
  return (
    <Stack spacing={4}>
      <PreviewCard title="Variants and emphasis">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, max-content)',
            gap: 2,
            alignItems: 'center',
          }}
        >
          {variants.map((variant) =>
            appearances.map((appearance) => (
              <Chip
                key={`${variant}-${appearance}`}
                variant={variant}
                appearance={appearance}
                label={`${variant} ${appearance}`}
              />
            ))
          )}
        </Box>
      </PreviewCard>

      <PreviewCard title="Selected — try it">
        <FilterGroup />
      </PreviewCard>

      <PreviewCard title="Selected, every role">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, max-content)',
            gap: 2,
            alignItems: 'center',
          }}
        >
          {variants.map((variant) =>
            appearances.map((appearance) => (
              <Chip
                key={`${variant}-${appearance}-selected`}
                variant={variant}
                appearance={appearance}
                selected
                onClick={handleNoop}
                label={`${variant} ${appearance}`}
              />
            ))
          )}
        </Box>
      </PreviewCard>

      <PreviewCard title="Sizes">
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Chip size="sm" variant="purple" label="Small" />
          <Chip dense label="Dense" />
          <Chip label="Medium" />
          <Chip dense appearance="outline" label="Dense outline" />
        </Stack>
      </PreviewCard>

      <PreviewCard title="Flat tag colours (size=&quot;sm&quot;)">
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', flexWrap: 'wrap' }}
        >
          {smallVariants.map((variant) => (
            <Chip key={variant} size="sm" variant={variant} label={variant} />
          ))}
        </Stack>
      </PreviewCard>

      <PreviewCard title="Slots">
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Chip icon={<FunnelSimpleIcon />} label="Filter" />
          <Chip
            size="sm"
            variant="primary"
            icon={<FunnelSimpleIcon />}
            label="Tag"
          />
          <Chip
            variant="secondary"
            avatar={<Avatar>OP</Avatar>}
            label="Olivia Park"
          />
          <Chip
            appearance="outline"
            label="Removable"
            onDelete={handleNoop}
          />
          <Chip label="Clickable" onClick={handleNoop} />
        </Stack>
      </PreviewCard>

      <PreviewCard title="States">
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Chip disabled label="Disabled" />
          <Chip appearance="outline" disabled label="Disabled outline" />
        </Stack>
      </PreviewCard>
    </Stack>
  );
}

ChipShowcase.displayName = 'ChipShowcase';
