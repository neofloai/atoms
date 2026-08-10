import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { IconBrowser } from './_components/IconBrowser';

export const metadata = {
  title: 'Icons — Atoms',
  description:
    'Browse and copy any of the ~9,000 Phosphor icons shipped with @neoflo/atoms. Each icon supports six weights matching the Figma design system.',
};

export default function IconsPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Foundations
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Icons
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Atoms ships the full <strong>Phosphor</strong> icon library
            (~9,000 icons, 6 weights). Consumers of{' '}
            <code>@neoflo/atoms</code> install nothing extra — every icon
            is importable from the <code>@neoflo/atoms/icons</code>{' '}
            subpath and tree-shaken at build time so the bundle stays
            small.
          </Typography>
        </Stack>

        <Box
          sx={{
            p: 3,
            borderRadius: 1.5,
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Usage
          </Typography>
          <Stack
            component="pre"
            sx={{
              m: 0,
              p: 2,
              borderRadius: 1,
              bgcolor: 'action.hover',
              fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
              fontSize: 13,
              lineHeight: 1.7,
              overflowX: 'auto',
            }}
          >
{`import { ShieldCheckIcon, ArrowRightIcon } from '@neoflo/atoms/icons';

<ShieldCheckIcon />                       // 24px, regular, currentColor
<ArrowRightIcon size={16} weight="bold" /> // per-instance overrides

// Six weights mirror Figma: thin, light, regular, bold, fill, duotone`}
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
            Defaults (size 24, weight regular, colour <code>currentColor</code>)
            come from <code>IconContext.Provider</code> in{' '}
            <code>NeofloThemeProvider</code>. Every name ends in{' '}
            <code>Icon</code> — the unsuffixed <code>ShieldCheck</code> still
            resolves, but Phosphor deprecated it and your editor will say so.
          </Typography>
        </Box>

        <Divider />

        <IconBrowser />
      </Stack>
    </Container>
  );
}
