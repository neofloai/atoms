'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface SwatchProps {
  label: string;
  value: string;
  variant?: 'fill' | 'border' | 'text';
}

/**
 * Renders a single token preview tile.
 *
 * - `fill`   -> filled square (used for surface / raw colour scales)
 * - `border` -> empty tile with the token applied as a border
 * - `text`   -> sample text rendered in the token colour
 *
 * Hex value is shown beneath so designers can verify the on-screen
 * pixels against the Figma value directly.
 */
export function Swatch({ label, value, variant = 'fill' }: SwatchProps) {
  return (
    <Stack spacing={0.75} sx={{ minWidth: 96 }}>
      {variant === 'fill' && (
        <Box
          sx={{
            width: '100%',
            height: 64,
            borderRadius: 1,
            bgcolor: value,
            border: '1px solid',
            borderColor: 'divider',
          }}
        />
      )}
      {variant === 'border' && (
        <Box
          sx={{
            width: '100%',
            height: 64,
            borderRadius: 1,
            bgcolor: 'transparent',
            border: '3px solid',
            borderColor: value,
          }}
        />
      )}
      {variant === 'text' && (
        <Box
          sx={{
            width: '100%',
            height: 64,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'action.hover',
          }}
        >
          <Typography sx={{ color: value, fontWeight: 600 }}>Aa</Typography>
        </Box>
      )}
      <Stack spacing={0}>
        <Typography variant="caption" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
          {label}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontFamily: 'var(--font-geist-mono), monospace',
            color: 'text.secondary',
            lineHeight: 1.2,
          }}
        >
          {value}
        </Typography>
      </Stack>
    </Stack>
  );
}

Swatch.displayName = 'Swatch';
