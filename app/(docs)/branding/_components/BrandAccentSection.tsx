import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { colors } from '@/src/tokens';

/**
 * The brand colour story in the two pieces that are actually brand
 * *decisions*: one chromatic accent, and the greyscale everything else
 * is built from.
 *
 * Deliberately does not enumerate the semantic status colours (those are
 * palette roles — see `PaletteSection`) or `orange`/`purple` (those are
 * Chip tag tints with one consumer each, documented on /tokens under
 * Surface/Text and on the Chip page). Both are read from `colors`, so
 * nothing here can drift from the token source.
 */

const GREY_SHADES = Object.entries(colors.grey).sort(
  ([a], [b]) => Number(a) - Number(b)
);

const ACCENT = colors.primary[500];

export function BrandAccentSection() {
  return (
    <Stack spacing={4}>
      <Stack spacing={1.5}>
        <Stack spacing={0.25}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            One accent
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The only chromatic brand colour. Primary actions, selection, and
            focus — one per view. Reach it as{' '}
            <code>primary.main</code>, never as a hex literal.
          </Typography>
        </Stack>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 96,
              height: 96,
              borderRadius: 2,
              bgcolor: ACCENT,
              border: '1px solid',
              borderColor: 'divider',
              flexShrink: 0,
            }}
          />
          <Stack spacing={0.25}>
            <Typography
              sx={{
                fontFamily: 'var(--font-geist-mono), monospace',
                fontWeight: 600,
              }}
            >
              primary/500
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontFamily: 'var(--font-geist-mono), monospace' }}
            >
              {ACCENT}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              = <code>palette.primary.main</code>
            </Typography>
          </Stack>
        </Stack>
      </Stack>

      <Stack spacing={1.5}>
        <Stack spacing={0.25}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Greyscale foundation
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Most of any Neoflo screen is this ramp — surfaces, borders, and
            text all resolve into it. {GREY_SHADES.length} steps from{' '}
            <code>grey/{GREY_SHADES[0][0]}</code> to{' '}
            <code>grey/{GREY_SHADES[GREY_SHADES.length - 1][0]}</code>.
          </Typography>
        </Stack>
        <Stack spacing={0.75}>
          <Box
            sx={{
              display: 'flex',
              height: 56,
              borderRadius: 1.5,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            {GREY_SHADES.map(([shade, hex]) => (
              <Box
                key={shade}
                title={`grey/${shade} · ${hex}`}
                sx={{ flex: 1, bgcolor: hex }}
              />
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary">
            Full per-shade values live on the{' '}
            <Box component="a" href="/tokens" sx={{ color: 'primary.main' }}>
              Tokens
            </Box>{' '}
            page.
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
}

BrandAccentSection.displayName = 'BrandAccentSection';
