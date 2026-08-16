import { Fragment } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { NeofloLogo } from '@/src/brand';
import { branding } from '@/src/brand/branding';
import { colors, fontFamilies } from '@/src/tokens';
import { BrandAccentSection } from './_components/BrandAccentSection';
import { FaviconSection } from './_components/FaviconSection';
import { PaletteSection } from './_components/PaletteSection';

export const metadata = {
  title: 'Branding — Atoms',
  description: branding.tagline,
};

function sectionSummary(id: string): string {
  return branding.sections.find((s) => s.id === id)?.summary ?? '';
}

interface FontSpec {
  name: string;
  role: string;
  family: string;
  note?: string;
}

const fontSpecs: readonly FontSpec[] = [
  {
    name: 'DM Sans',
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
    note: 'Not yet self-hosted — falls back to DM Sans.',
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
            {`import { NeofloLogo } from '@neofloai/atoms';\n\n<NeofloLogo />                          // icon mark, 24px\n<NeofloLogo variant="full" size={28} /> // mark + wordmark`}
          </Paper>
          <Typography variant="body2" color="text.secondary">
            The mark is monochrome and inherits <code>currentColor</code>, so
            it adapts to light and dark surfaces from one source. Set its
            colour by setting <code>color</code> on an ancestor.
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={2} id="favicon">
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Favicon
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {sectionSummary('favicon')}
          </Typography>
          <FaviconSection />
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
            <BrandAccentSection />
          </SectionCard>

          <Stack spacing={0.5} sx={{ pt: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              <code>theme.palette</code>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Everything the theme exposes to your components, in both colour
              schemes. This is the layer you write against —{' '}
              <code>color=&quot;primary&quot;</code>,{' '}
              <code>sx=&#123;&#123; bgcolor: &apos;background.paper&apos; &#125;&#125;</code>{' '}
              — so a blank project needs nothing beyond these names. Read live
              from <code>src/theme/palette.ts</code>, so it cannot drift from
              what <code>NeofloThemeProvider</code> renders.
            </Typography>
          </Stack>
          <SectionCard>
            <PaletteSection />
          </SectionCard>

          <Typography variant="body2" color="text.secondary">
            Looking for the underlying scales, or the semantic{' '}
            <code>surface</code> / <code>border</code> / <code>text</code> /{' '}
            <code>icon</code> tokens the palette is built from? Those live on
            the{' '}
            <Box component="a" href="/tokens" sx={{ color: 'primary.main' }}>
              Tokens
            </Box>{' '}
            page.
          </Typography>
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
            {/* Dividers interleaved manually rather than via Stack's
                `divider` prop: that prop resolves to `undefined` when
                used from a Server Component like this page (open MUI
                bug mui/material-ui#48214), which crashes the render. */}
            <Stack spacing={3}>
              {fontSpecs.map((spec, index) => (
                <Fragment key={spec.name}>
                  {index > 0 && <Divider flexItem />}
                  <FontSample {...spec} />
                </Fragment>
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
            {`import { NeofloThemeProvider } from '@neofloai/atoms';\n\n<NeofloThemeProvider>{children}</NeofloThemeProvider>\n// pin a scheme: <NeofloThemeProvider defaultMode="light">`}
          </Paper>
          <Typography variant="body2" color="text.secondary">
            That one wrapper is the whole setup. It applies the theme, mounts{' '}
            <code>CssBaseline</code>, self-hosts DM Sans and Instrument Serif,
            and sets the Phosphor icon defaults — no font links, no CSS
            imports, no per-component theming. It defaults to the system
            colour scheme and both schemes are first-class, so every value in
            the table above resolves correctly in either.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            From there, reference colour by <em>name</em> rather than value —
            that is what keeps a product on-brand when the tokens change:
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
            {`<Button color="primary">Save</Button>\n<Box sx={{ bgcolor: 'background.paper', color: 'text.secondary' }} />\n\n// and where you need a raw scale value, import the token —\n// never paste a hex literal\nimport { colors } from '@neofloai/atoms/tokens';`}
          </Paper>
        </Stack>
      </Stack>
    </Container>
  );
}
