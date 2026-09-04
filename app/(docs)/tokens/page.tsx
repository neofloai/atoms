import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { APP_BAR_HEIGHT } from '../_components/navigation';

const ANCHOR_OFFSET_SX = { scrollMarginTop: APP_BAR_HEIGHT + 16 };
import { border, colors, icon, spacing, surface, text } from '@/src/tokens';
import { ElevationSection } from './_components/ElevationSection';
import { figmaSlotFor } from './_components/figmaSlots';
import { RadiusSection } from './_components/RadiusSection';
import { ResponsiveSection } from './_components/ResponsiveSection';
import { ScaleSection } from './_components/ScaleSection';
import { SemanticSection } from './_components/SemanticSection';
import { SpacingSection } from './_components/SpacingSection';
import { TypographySection } from './_components/TypographySection';

export const metadata = {
  title: 'Tokens — Atoms',
  description:
    'Live preview of every Neoflo design token: raw colour scales plus semantic surface, border, and text tokens for both light and dark modes.',
};

export default function TokensPage() {
  const scales = Object.entries(colors) as Array<
    [string, Readonly<Record<string, string>>]
  >;

  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Design System
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Tokens
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Single source of truth for every brand colour. Raw scales feed
            the semantic layer, which feeds the MUI theme. Edit values in
            <code> src/tokens/</code> — every consumer of{' '}
            <code>@neofloai/atoms</code> picks up the change on next install.
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={4}>
          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Raw colour scales
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Single-mode hex values from the designer&apos;s Figma library.
              These are the only place colours are declared as literals.
              Scales are named by hue, exactly as Figma names them &mdash;{' '}
              <code>red</code> and <code>blue</code>, not{' '}
              <code>error</code> and <code>info</code>. The semantic
              sections below name the same colours by meaning instead, so{' '}
              <code>text.error</code> resolves to the <code>red</code>{' '}
              scale and <code>text.information</code> to <code>blue</code>.
            </Typography>
          </Stack>
          <Stack spacing={4}>
            {scales.map(([name, scale]) => (
              <ScaleSection key={name} name={name} scale={scale} />
            ))}
          </Stack>
        </Stack>

        <Divider />

        <SemanticSection
          title="Surface"
          description="Background fills for page chrome, cards, buttons, and state surfaces. Each token shows both colour-scheme values side-by-side."
          tokens={surface}
          swatchVariant="fill"
        />

        <Divider />

        <SemanticSection
          title="Border"
          description="Outline tokens for cards, inputs, and interactive states (default, hover, focus)."
          tokens={border}
          swatchVariant="border"
        />

        <Divider />

        <SemanticSection
          title="Text"
          description="Font colours, grouped by typography slot rather than by interaction state. The neutral default group runs heading, body, caption, placeholder and subtle — the first four also carry an OnColor cut, for text sitting on a filled surface. Every accent role (primary, information, success, error, warning, orange, purple) is a four-rung ladder, darkest first: body, caption, accent, onColorHover. disabled is default plus onColor. Each rung shows its Figma variable name underneath, where that differs — Figma names the default group after the type-scale rung it pairs with (b1, b2, b3) and numbers the accent ladders 1 to 4. A rung with no second name is spelled the same in both."
          tokens={text}
          swatchVariant="text"
          figmaSlot={(group, token) => figmaSlotFor('text', group, token)}
        />

        <Divider />

        <SemanticSection
          title="Icon"
          description="Icon colours, carrying the same group and rung names as Text so an icon beside a body string takes the matching token. As of the current sync only default.subtle and disabled.onColor hold values that differ from their text counterparts. Each rung shows its Figma variable name underneath."
          tokens={icon}
          swatchVariant="text"
          figmaSlot={(group, token) => figmaSlotFor('icon', group, token)}
        />

        <Divider />

        <Box id="spacing" sx={ANCHOR_OFFSET_SX}>
          <SpacingSection
            title="Spacing"
            description="Component spacing scale in pixels. T-shirt-sized steps from 0 (none) up to 96 (xxl). The page-scale ladder, which resolves per breakpoint, is under Responsive below."
            tokens={spacing}
          />
        </Box>

        <Divider />

        <Box id="typography" sx={ANCHOR_OFFSET_SX}>
          <TypographySection />
        </Box>

        <Divider />

        <Box id="responsive" sx={ANCHOR_OFFSET_SX}>
          <ResponsiveSection />
        </Box>

        <Divider />

        <Box id="elevation" sx={ANCHOR_OFFSET_SX}>
          <ElevationSection />
        </Box>

        <Divider />

        <Box id="radius" sx={ANCHOR_OFFSET_SX}>
          <RadiusSection />
        </Box>
      </Stack>
    </Container>
  );
}
