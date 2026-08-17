import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/**
 * The theme section of the branding page: one provider, two schemes, and
 * the hook a switch needs.
 *
 * Extracted from the page because the page crossed its size limit when
 * the runtime side of colour mode was added. The three snippets are the
 * three separate decisions — mount it, start it in a scheme, let someone
 * change it — so they stay separate blocks rather than one long listing.
 */

const PROVIDER_SNIPPET = `import { NeofloThemeProvider } from '@neofloai/atoms';

<NeofloThemeProvider>{children}</NeofloThemeProvider>
// pin a scheme: <NeofloThemeProvider defaultMode="light">`;

const SWITCH_SNIPPET = `import { useColorScheme } from '@neofloai/atoms';

const { mode, setMode } = useColorScheme();

// undefined until the stored preference has been read
if (!mode) return <IconButton sx={{ visibility: 'hidden' }} />;

setMode(mode === 'dark' ? 'light' : 'dark');`;

const BY_NAME_SNIPPET = `<Button color="primary">Save</Button>
<Box sx={{ bgcolor: 'background.paper', color: 'text.secondary' }} />

// and where you need a raw scale value, import the token —
// never paste a hex literal
import { colors } from '@neofloai/atoms/tokens';`;

function Snippet({ children }: { children: string }) {
  return (
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
      {children}
    </Paper>
  );
}

Snippet.displayName = 'Snippet';

export function ThemeSection({ summary }: { summary: string }) {
  return (
    <Stack spacing={2} id="theme">
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        Theme &amp; colour modes
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {summary}
      </Typography>
      <Snippet>{PROVIDER_SNIPPET}</Snippet>
      <Typography variant="body2" color="text.secondary">
        That one wrapper is the whole setup. It applies the theme, mounts{' '}
        <code>CssBaseline</code>, self-hosts DM Sans and Instrument Serif, and
        sets the Phosphor icon defaults — no font links, no CSS imports, no
        per-component theming. It defaults to the system colour scheme and both
        schemes are first-class, so every value in the table above resolves
        correctly in either.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        <code>defaultMode</code> is the scheme the app starts in. For one the
        person using it can change, reach for <code>useColorScheme</code> —
        exported from Atoms so a light/dark switch needs no{' '}
        <code>@mui/material</code> import. The provider persists the choice, so
        it survives a reload. One catch: <code>mode</code> is{' '}
        <code>undefined</code> on the first render, before that stored
        preference has been read, so render the space rather than a guess or the
        control visibly flips after hydration.
      </Typography>
      <Snippet>{SWITCH_SNIPPET}</Snippet>
      <Typography variant="body2" color="text.secondary">
        From there, reference colour by <em>name</em> rather than value — that
        is what keeps a product on-brand when the tokens change:
      </Typography>
      <Snippet>{BY_NAME_SNIPPET}</Snippet>
    </Stack>
  );
}

ThemeSection.displayName = 'ThemeSection';
