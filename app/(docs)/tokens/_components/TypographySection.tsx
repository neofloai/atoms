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
  /**
   * Which of the rung's two cuts to render. Passed per group rather than
   * inferred from the name: the scale ships a Medium and a Regular of
   * every rung at identical size and leading, and `src/tokens/typography.ts`
   * records which one this system uses -- Medium above body, Regular for
   * body and caption.
   */
  readonly weight: number;
}

function SlotRow({ name, size, leading, sample, weight }: SlotRowProps) {
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
          fontWeight: weight,
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
 * component-scale heading / body / caption ramp with live samples in each
 * size. The page-scale ramp, which shares these slot names at different
 * values, is `ResponsiveSection`.
 */
export function TypographySection() {
  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Typography
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Font families, weights, and the type ramp components measure
          against, synced from the Figma text styles. The token path is the
          slot name: <code>display.d1</code>, <code>headings.h1</code>
          &ndash;<code>h6</code>, and <code>body.b1</code> /{' '}
          <code>b2</code> / <code>caption</code>. The Responsive section
          below carries a second ramp that reuses the <code>b1</code> /{' '}
          <code>b2</code> / <code>caption</code> and <code>h1</code>&ndash;
          <code>h4</code> names at page scale &mdash; <code>b1</code> is
          13px here and 16px there.
        </Typography>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Font families
        </Typography>
        <Stack spacing={1.5}>
          <Stack spacing={0.5}>
            <Typography variant="caption" sx={{ fontFamily: MONO_FONT, color: 'text.secondary' }}>
              product.sans &mdash; DM Sans
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
              product.mono &mdash; Space Mono (not self-hosted; falls back to
              the system monospace)
            </Typography>
            <Typography sx={{ fontFamily: fontFamilies.product.mono, fontSize: 24 }}>
              1,512 icons &mdash; INV-04821 &mdash; 9,072
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
        <Typography variant="caption" color="text.secondary">
          <code>marketing.serif</code> is the fifth declared family and
          resolves to the same Instrument Serif stack as{' '}
          <code>product.serif</code>, so it is not sampled separately.
        </Typography>
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
          Display
        </Typography>
        <Stack spacing={2} sx={{ overflowX: 'auto' }}>
          {Object.entries(typography.display).map(([name, slot]) => (
            <SlotRow
              key={name}
              name={name}
              size={slot.size}
              leading={slot.leading}
              weight={fontWeights.medium}
              sample="Neoflo"
            />
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
              weight={fontWeights.medium}
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
              weight={fontWeights.regular}
              sample="The quick brown fox jumps over the lazy dog."
            />
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}

TypographySection.displayName = 'TypographySection';
