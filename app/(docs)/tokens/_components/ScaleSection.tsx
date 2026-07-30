import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Swatch } from '../../_components/Swatch';

interface ScaleSectionProps {
  name: string;
  scale: Readonly<Record<string, string>>;
}

/**
 * Renders one raw colour scale (e.g. `primary`, `grey`) as a wrapping
 * row of `Swatch` tiles, one per shade.
 *
 * Shade keys are rendered in ascending numeric order so the lightest
 * shades sit on the left.
 */
export function ScaleSection({ name, scale }: ScaleSectionProps) {
  const shades = Object.entries(scale).sort(
    ([a], [b]) => Number(a) - Number(b)
  );

  return (
    <Stack spacing={1.5}>
      <Typography variant="h6" sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
        {name}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
          gap: 2,
        }}
      >
        {shades.map(([shade, hex]) => (
          <Swatch key={shade} label={`${name}/${shade}`} value={hex} />
        ))}
      </Box>
    </Stack>
  );
}

ScaleSection.displayName = 'ScaleSection';
