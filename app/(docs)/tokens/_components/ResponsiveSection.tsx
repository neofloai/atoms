import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { responsive } from '@/src/tokens';

const MONO_FONT = 'var(--font-geist-mono), ui-monospace, monospace';

const BREAKPOINTS = [
  ['desktop', responsive.desktop],
  ['mobile', responsive.mobile],
] as const;

/**
 * Three columns: slot name, then one cell per breakpoint. The ramps read
 * as a comparison, so they stay narrow enough that the eye can jump
 * between the two columns; the spacing bars need the room.
 */
const GRID_SX = {
  display: 'grid',
  gridTemplateColumns: '72px repeat(2, minmax(0, 1fr))',
  columnGap: 3,
  rowGap: 1,
  alignItems: 'baseline',
} as const;

const RAMP_GRID_SX = { ...GRID_SX, maxWidth: 460 } as const;

function HeaderRow({ sx = GRID_SX }: { readonly sx?: typeof GRID_SX }) {
  return (
    <Box sx={sx}>
      <Box />
      {BREAKPOINTS.map(([name, bp]) => (
        <Typography key={name} variant="caption" sx={{ fontWeight: 600 }}>
          {name} &mdash; {bp.frameWidth}px
        </Typography>
      ))}
    </Box>
  );
}

HeaderRow.displayName = 'HeaderRow';

interface RampProps {
  readonly title: string;
  readonly group: 'headings' | 'body';
}

/**
 * One type ramp, desktop against mobile. Values are read per breakpoint
 * rather than interpolated — a slot can hold the same size on both (`b1`
 * is 16px either way) while its leading moves.
 */
function Ramp({ title, group }: RampProps) {
  const slots = Object.keys(responsive.desktop[group]) as Array<
    keyof (typeof responsive.desktop)[typeof group]
  >;

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <HeaderRow sx={RAMP_GRID_SX} />
      {slots.map((slot) => (
        <Box key={slot} sx={RAMP_GRID_SX}>
          <Typography variant="caption" sx={{ fontFamily: MONO_FONT, fontWeight: 600 }}>
            {slot}
          </Typography>
          {BREAKPOINTS.map(([name, bp]) => {
            const { size, leading } = bp[group][slot];
            return (
              <Typography
                key={name}
                variant="caption"
                sx={{ color: 'text.secondary', fontFamily: MONO_FONT }}
              >
                {size}px / {leading}px
              </Typography>
            );
          })}
        </Box>
      ))}
    </Stack>
  );
}

Ramp.displayName = 'Ramp';

/** The page-scale gap ladder, as bars so the mobile halving is visible. */
function SpacingLadder() {
  const steps = Object.keys(responsive.desktop.spacing) as Array<
    keyof typeof responsive.desktop.spacing
  >;

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        Spacing
      </Typography>
      <HeaderRow />
      {steps.map((step) => (
        <Box key={step} sx={GRID_SX}>
          <Typography variant="caption" sx={{ fontFamily: MONO_FONT, fontWeight: 600 }}>
            {step}
          </Typography>
          {BREAKPOINTS.map(([name, bp]) => {
            const px = bp.spacing[step];
            return (
              <Stack key={name} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontFamily: MONO_FONT,
                    width: 40,
                    flexShrink: 0,
                  }}
                >
                  {px}px
                </Typography>
                <Box
                  sx={{
                    height: 10,
                    // The 128px top rung would overflow the column.
                    width: `${(px / 128) * 100}%`,
                    minWidth: px ? 2 : 0,
                    bgcolor: 'primary.main',
                    borderRadius: 0.5,
                  }}
                />
              </Stack>
            );
          })}
        </Box>
      ))}
    </Stack>
  );
}

SpacingLadder.displayName = 'SpacingLadder';

/**
 * Renders the Figma "responsive" variable collection — the page-scale
 * type and spacing ladders, which resolve to different values per
 * breakpoint rather than per colour scheme.
 */
export function ResponsiveSection() {
  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Responsive
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The page-scale ramps, keyed by breakpoint instead of by colour
          scheme. Used by marketing and long-form layouts, where a heading
          shrinks on small screens. Components use the fixed{' '}
          <code>typography</code> and <code>spacing</code> scales above.
        </Typography>
      </Stack>
      <Ramp title="Headings" group="headings" />
      <Ramp title="Body" group="body" />
      <SpacingLadder />
    </Stack>
  );
}

ResponsiveSection.displayName = 'ResponsiveSection';
