'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface SwatchProps {
  label: string;
  value: string;
  variant?: 'fill' | 'border' | 'text';
  /**
   * Backdrop for the `text` and `border` variants. Defaults to the
   * viewer's own surface, which is right when the tile sits next to
   * comparable content — but a swatch previewing a *specific* colour
   * scheme should pass that scheme's `background.default`, or a light
   * value ends up rendered on a dark tile and reads as invisible.
   * Ignored by `fill`, which is the colour itself.
   */
  backdrop?: string;
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
export function Swatch({
  label,
  value,
  variant = 'fill',
  backdrop,
}: SwatchProps) {
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
            bgcolor: backdrop ?? 'transparent',
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
            bgcolor: backdrop ?? 'action.hover',
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
