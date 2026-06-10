import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { radius } from '@/src/tokens';

const MONO_FONT = 'var(--font-geist-mono), ui-monospace, monospace';

/**
 * Renders the radius tokens as solid swatches whose corners use the
 * actual token value. Engineers can eyeball the difference between
 * each step and confirm `radius.xl = 24px` matches a card in Figma.
 */
export function RadiusSection() {
  const entries = Object.entries(radius) as Array<
    [keyof typeof radius, number]
  >;

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Radius
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Corner-radius tokens in pixels. Figma does not define a
          semantic radius layer; designers use the shared{' '}
          <code>Scale/*</code> primitive set directly. The names below
          are an engineering convenience matching the same numeric
          ladder as <code>spacing</code>, plus a <code>full</code>{' '}
          token for pill-shaped controls. The card sample in Figma uses{' '}
          <code>radius.xl</code> (24px).
        </Typography>
      </Stack>

      <Stack
        direction="row"
        spacing={4}
        sx={{ flexWrap: 'wrap', rowGap: 3 }}
      >
        {entries.map(([name, value]) => (
          <Stack key={name} spacing={1} sx={{ width: 120 }}>
            <Box
              sx={{
                width: '100%',
                height: 96,
                bgcolor: 'primary.main',
                borderRadius: `${Math.min(value, 48)}px`,
              }}
            />
            <Stack spacing={0.25}>
              <Typography
                variant="caption"
                sx={{ fontFamily: MONO_FONT, fontWeight: 600 }}
              >
                radius.{name}
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontFamily: MONO_FONT, color: 'text.secondary' }}
              >
                {value === 9999 ? '9999px (full)' : `${value}px`}
              </Typography>
            </Stack>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}

RadiusSection.displayName = 'RadiusSection';
