import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { elevation } from '@/src/tokens';

const MONO_FONT = 'var(--font-geist-mono), ui-monospace, monospace';

interface ShadowCardProps {
  readonly name: string;
  readonly shadow: string;
  readonly usage: string;
}

function ShadowCard({ name, shadow, usage }: ShadowCardProps) {
  return (
    <Stack spacing={1.5} sx={{ width: 220 }}>
      <Box
        sx={{
          width: '100%',
          height: 120,
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: shadow,
        }}
      />
      <Stack spacing={0.5}>
        <Typography variant="caption" sx={{ fontFamily: MONO_FONT, fontWeight: 600 }}>
          elevation.{name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {usage}
        </Typography>
      </Stack>
    </Stack>
  );
}

ShadowCard.displayName = 'ShadowCard';

const USAGES: Readonly<Record<string, string>> = {
  small: 'Buttons, input focus, slight elevation.',
  medium: 'Dropdowns, tooltips, floating elements.',
  large: 'Modals, dialogs, popovers.',
};

/**
 * Renders the three elevation tokens (small / medium / large) as
 * sample cards so the team can eyeball the difference between them.
 */
export function ElevationSection() {
  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Elevation
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Three semantic shadow levels matching the Figma effect styles.
          Values shown are placeholders; the canonical shadows will be
          synced once the designer hands off offset/blur/colour specs.
        </Typography>
      </Stack>

      <Stack
        direction="row"
        spacing={4}
        sx={{
          flexWrap: 'wrap',
          rowGap: 3,
          p: 4,
          bgcolor: 'background.default',
          borderRadius: 1,
        }}
      >
        {Object.entries(elevation).map(([name, value]) => (
          <ShadowCard key={name} name={name} shadow={value} usage={USAGES[name] ?? ''} />
        ))}
      </Stack>
    </Stack>
  );
}

ElevationSection.displayName = 'ElevationSection';
