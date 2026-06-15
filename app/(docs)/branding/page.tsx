import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { NeofloLogo } from '@/src/brand';
import { branding } from '@/src/brand/branding';
import { colors, fontFamilies } from '@/src/tokens';

export const metadata = {
  title: 'Branding — Atoms',
  description: branding.tagline,
};

function sectionSummary(id: string): string {
  return branding.sections.find((s) => s.id === id)?.summary ?? '';
}

interface SwatchSpec {
  label: string;
  value: string;
  /** Use a dark label when the swatch is light. */
  ink?: boolean;
}

const brandSwatches: readonly SwatchSpec[] = [
  { label: 'Primary blue', value: colors.primary[600] },
  { label: 'Success', value: colors.green[500] },
  { label: 'Error', value: colors.red[500] },
  { label: 'Warning', value: colors.yellow[500], ink: true },
  { label: 'Informational', value: colors.purple[500] },
  { label: 'Accent orange', value: colors.orange[500], ink: true },
];

const neutralSwatches: readonly SwatchSpec[] = [
  { label: 'Ink', value: colors.grey[1200] },
  { label: 'Body', value: colors.grey[800] },
  { label: 'Border', value: colors.grey[300], ink: true },
  { label: 'Surface', value: colors.grey[100], ink: true },
];

function Swatch({ label, value, ink }: SwatchSpec) {
  return (
    <Stack spacing={0.75} sx={{ width: 132 }}>
      <Box
        sx={{
          height: 72,
          borderRadius: 1.5,
          bgcolor: value,
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'flex-end',
          p: 1,
          color: ink ? colors.grey[1200] : colors.grey[25],
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          {value}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
    </Stack>
  );
}

Swatch.displayName = 'Swatch';

interface FontSpec {
  name: string;
  role: string;
  family: string;
  note?: string;
}

const fontSpecs: readonly FontSpec[] = [
  {
    name: 'Plus Jakarta Sans',
    role: 'Product UI — primary sans',
    family: fontFamilies.product.sans,
  },
  {
    name: 'Instrument Serif',
    role: 'Editorial / display accent',
    family: fontFamilies.product.serif,
  },
  {
    name: 'Clash Grotesk',
    role: 'Marketing display',
    family: fontFamilies.marketing.sans,
    note: 'Not yet self-hosted — falls back to Plus Jakarta Sans (see DESIGNER_QUESTIONS.md #7).',
  },
];

function FontSample({ name, role, family, note }: FontSpec) {
  return (
    <Stack spacing={0.5}>
      <Typography sx={{ fontFamily: family, fontSize: 32, lineHeight: 1.2 }}>
        Neoflo design system
      </Typography>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {name}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {role}
        {note ? ` · ${note}` : ''}
      </Typography>
    </Stack>
  );
}

FontSample.displayName = 'FontSample';

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      {children}
    </Paper>
  );
}

SectionCard.displayName = 'SectionCard';

export default function BrandingDocsPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Foundations
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Branding
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {branding.tagline}
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={2} id="logo">
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Logo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {sectionSummary('logo')}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
            }}
          >
            <SectionCard>
              <Stack
                spacing={3}
                sx={{ alignItems: 'center', justifyContent: 'center', py: 2 }}
              >
                <NeofloLogo variant="full" size={36} />
                <Stack
                  direction="row"
                  spacing={3}
                  sx={{ alignItems: 'flex-end' }}
                >
                  <NeofloLogo size={24} />
                  <NeofloLogo size={32} />
                  <NeofloLogo size={40} />
                </Stack>
              </Stack>
            </SectionCard>
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: colors.grey[1000],
                color: colors.grey[25],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <NeofloLogo variant="full" size={36} />
            </Paper>
          </Box>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 1.5,
              fontFamily: 'var(--font-geist-mono), monospace',
              fontSize: 13,
              bgcolor: 'action.hover',
              whiteSpace: 'pre',
              overflowX: 'auto',
            }}
          >
            {`import { NeofloLogo } from '@neoflo/atoms';\n\n<NeofloLogo />                          // icon mark, 24px\n<NeofloLogo variant="full" size={28} /> // mark + wordmark`}
          </Paper>
          <Typography variant="body2" color="text.secondary">
            The mark is monochrome and inherits <code>currentColor</code>, so
            it adapts to light and dark surfaces from one source. Set its
            colour by setting <code>color</code> on an ancestor.
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={2} id="color">
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Brand colours
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {sectionSummary('color')}
          </Typography>
          <SectionCard>
            <Stack spacing={3}>
              <Box
                sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}
              >
                {brandSwatches.map((swatch) => (
                  <Swatch key={swatch.label} {...swatch} />
                ))}
              </Box>
              <Box
                sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}
              >
                {neutralSwatches.map((swatch) => (
                  <Swatch key={swatch.label} {...swatch} />
                ))}
              </Box>
            </Stack>
          </SectionCard>
        </Stack>

        <Divider />

        <Stack spacing={2} id="typography">
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Typography &amp; fonts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {sectionSummary('typography')}
          </Typography>
          <SectionCard>
            <Stack spacing={3} divider={<Divider flexItem />}>
              {fontSpecs.map((spec) => (
                <FontSample key={spec.name} {...spec} />
              ))}
            </Stack>
          </SectionCard>
        </Stack>

        <Divider />

        <Stack spacing={2} id="theme">
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Theme &amp; colour modes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {sectionSummary('theme')}
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 1.5,
              fontFamily: 'var(--font-geist-mono), monospace',
              fontSize: 13,
              bgcolor: 'action.hover',
              whiteSpace: 'pre',
              overflowX: 'auto',
            }}
          >
            {`import { NeofloThemeProvider } from '@neoflo/atoms';\n\n<NeofloThemeProvider>{children}</NeofloThemeProvider>\n// pin a scheme: <NeofloThemeProvider defaultMode="light">`}
          </Paper>
        </Stack>
      </Stack>
    </Container>
  );
}
