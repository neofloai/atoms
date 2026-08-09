import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from '@/app/_lib/Link';

interface LandingCard {
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly status: 'ready' | 'soon';
}

const cards: readonly LandingCard[] = [
  {
    title: 'Foundations',
    description:
      'Colour scales, surfaces, borders, and text tokens. The full brand palette in one place.',
    href: '/tokens',
    status: 'ready',
  },
  {
    title: 'Components',
    description:
      'Neoflo-branded wrappers around Material UI — layout, buttons, inputs, feedback, and overlays.',
    href: '/components',
    status: 'ready',
  },
  {
    title: 'Patterns',
    description:
      'Pre-composed layouts for common pages — dashboards, settings, auth flows.',
    href: '/patterns',
    status: 'soon',
  },
];

export default function HomePage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={2} sx={{ maxWidth: 720 }}>
          <Chip
            label="v1.0.0"
            size="small"
            sx={{
              alignSelf: 'flex-start',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              fontWeight: 600,
            }}
          />
          <Typography variant="h3" sx={{ fontWeight: 700, lineHeight: 1.15 }}>
            Neoflo Atoms
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontWeight: 400, color: 'text.secondary', lineHeight: 1.5 }}
          >
            One design system. Three outputs: a React component library, this
            documentation site, and an MCP endpoint that lets AI editors
            generate design-system-compliant code automatically.
          </Typography>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ pt: 1, color: 'text.secondary' }}
          >
            <Typography variant="body2">
              Next.js 16 · React 19 · Material UI v9
            </Typography>
          </Stack>
        </Stack>

        <Divider />

        <Stack spacing={2}>
          <Typography variant="overline" color="text.secondary">
            Explore
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 3,
            }}
          >
            {cards.map((card) => (
              <Paper
                key={card.title}
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 2,
                  transition: 'border-color 120ms, box-shadow 120ms',
                  ...(card.status === 'ready' && {
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: '0 0 0 1px var(--mui-palette-primary-main)',
                    },
                  }),
                }}
              >
                <Stack spacing={1.5} sx={{ height: '100%' }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {card.title}
                    </Typography>
                    {card.status === 'soon' && (
                      <Chip
                        label="Soon"
                        size="small"
                        sx={{
                          fontSize: 10,
                          height: 18,
                          fontWeight: 700,
                          letterSpacing: 0.4,
                        }}
                      />
                    )}
                  </Stack>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ flex: 1 }}
                  >
                    {card.description}
                  </Typography>
                  {card.status === 'ready' ? (
                    <Link
                      component={NextLink}
                      href={card.href}
                      sx={{ fontWeight: 600, fontSize: 14 }}
                    >
                      Browse {card.title.toLowerCase()} →
                    </Link>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.disabled', fontWeight: 600 }}
                    >
                      Coming soon
                    </Typography>
                  )}
                </Stack>
              </Paper>
            ))}
          </Box>
        </Stack>

        <Divider />

        <Stack spacing={2} sx={{ maxWidth: 720 }}>
          <Typography variant="overline" color="text.secondary">
            For AI editors
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            The MCP endpoint
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Point your editor at <code>/mcp</code> and it can list every
            component, token, and pattern at request time — no more
            hallucinated APIs or guessed colours.
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
            {`{
  "mcpServers": {
    "atoms": {
      "url": "https://atoms.neoflo.ai/mcp"
    }
  }
}`}
          </Paper>
        </Stack>
      </Stack>
    </Container>
  );
}
