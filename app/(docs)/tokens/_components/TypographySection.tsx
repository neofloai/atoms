import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { fontFamilies, fontWeights, typography } from '@/src/tokens';

const MONO_FONT = 'var(--font-geist-mono), ui-monospace, monospace';

interface SlotRowProps {
  readonly name: string;
  readonly size: number;
  readonly leading: number;
  readonly sample: string;
}

function SlotRow({ name, size, leading, sample }: SlotRowProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ alignItems: { xs: 'flex-start', sm: 'baseline' } }}
    >
      <Stack
        spacing={0.25}
        sx={{ width: { sm: 140 }, flexShrink: 0, fontFamily: MONO_FONT }}
      >
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          {name}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', fontFamily: MONO_FONT }}
        >
          {size}px / {leading}px
        </Typography>
      </Stack>
      <Box
        sx={{
          fontSize: `${size}px`,
          lineHeight: `${leading}px`,
          fontWeight: name.startsWith('h') ? fontWeights.bold : fontWeights.regular,
          color: 'text.primary',
        }}
      >
        {sample}
      </Box>
    </Stack>
  );
}

SlotRow.displayName = 'SlotRow';

/**
 * Renders the typography token system: font families, weights, and the
 * heading / body / caption type scale with live samples in each size.
 */
export function TypographySection() {
  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Typography
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Font families, weights, and the H1-H4 / B1-B2 / caption type
          scale. Sizes shown are placeholder values; the canonical
          numbers live in Figma&apos;s responsive variable collection
          and will be synced when the designer confirms.
        </Typography>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Font families
        </Typography>
        <Stack spacing={1.5}>
          <Stack spacing={0.5}>
            <Typography variant="caption" sx={{ fontFamily: MONO_FONT, color: 'text.secondary' }}>
              product.sans &mdash; Plus Jakarta Sans
            </Typography>
            <Typography sx={{ fontFamily: fontFamilies.product.sans, fontSize: 24 }}>
              The quick brown fox jumps over the lazy dog
            </Typography>
          </Stack>
          <Stack spacing={0.5}>
            <Typography variant="caption" sx={{ fontFamily: MONO_FONT, color: 'text.secondary' }}>
              product.serif &mdash; Instrument Serif
            </Typography>
            <Typography sx={{ fontFamily: fontFamilies.product.serif, fontSize: 24 }}>
              The quick brown fox jumps over the lazy dog
            </Typography>
          </Stack>
          <Stack spacing={0.5}>
            <Typography variant="caption" sx={{ fontFamily: MONO_FONT, color: 'text.secondary' }}>
              marketing.sans &mdash; Clash Grotesk (not yet self-hosted; falls back to product.sans)
            </Typography>
            <Typography sx={{ fontFamily: fontFamilies.marketing.sans, fontSize: 24 }}>
              The quick brown fox jumps over the lazy dog
            </Typography>
          </Stack>
        </Stack>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Font weights
        </Typography>
        <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', rowGap: 1.5 }}>
          {Object.entries(fontWeights).map(([name, weight]) => (
            <Stack key={name} spacing={0.25} sx={{ width: 160 }}>
              <Typography variant="caption" sx={{ fontFamily: MONO_FONT, color: 'text.secondary' }}>
                {name} &mdash; {weight}
              </Typography>
              <Typography
                sx={{
                  fontFamily: fontFamilies.product.sans,
                  fontWeight: weight,
                  fontSize: 20,
                }}
              >
                Aa
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Headings
        </Typography>
        <Stack spacing={2}>
          {Object.entries(typography.headings).map(([name, slot]) => (
            <SlotRow
              key={name}
              name={name}
              size={slot.size}
              leading={slot.leading}
              sample="The quick brown fox jumps"
            />
          ))}
        </Stack>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Body
        </Typography>
        <Stack spacing={2}>
          {Object.entries(typography.body).map(([name, slot]) => (
            <SlotRow
              key={name}
              name={name}
              size={slot.size}
              leading={slot.leading}
              sample="The quick brown fox jumps over the lazy dog."
            />
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}

TypographySection.displayName = 'TypographySection';
