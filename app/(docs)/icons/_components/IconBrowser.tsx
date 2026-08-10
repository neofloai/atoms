'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import * as PhosphorIcons from '@phosphor-icons/react';
import type { IconWeight } from '@phosphor-icons/react';
import { CATALOG_ICONS } from './iconCatalog';

const MONO_FONT = 'var(--font-geist-mono), ui-monospace, monospace';
const WEIGHTS: readonly IconWeight[] = ['thin', 'light', 'regular', 'bold', 'fill', 'duotone'];

/**
 * Phosphor 2.1 suffixed every export with `Icon` and deprecated the
 * bare names, so `MagnifyingGlass` is now `MagnifyingGlassIcon`.
 *
 * The catalog keeps the base names — that is what phosphoricons.com
 * shows, so adding to it stays a copy-paste — and the suffix is
 * appended here, in the one place that resolves, labels, and copies
 * them. The label and the copied import are the suffixed name, since
 * that is what consumers should be writing.
 */
function exportName(base: string): string {
  return `${base}Icon`;
}

type PhosphorIconComponent = React.ComponentType<{
  size?: number | string;
  weight?: IconWeight;
  color?: string;
}>;

function resolveIcon(name: string): PhosphorIconComponent | null {
  const lib = PhosphorIcons as unknown as Record<string, unknown>;
  const candidate = lib[name];
  if (typeof candidate === 'function' || typeof candidate === 'object') {
    return candidate as PhosphorIconComponent;
  }
  return null;
}

interface IconBrowserProps {
  readonly initialWeight?: IconWeight;
}

export function IconBrowser({ initialWeight = 'regular' }: IconBrowserProps) {
  const [query, setQuery] = React.useState('');
  const [weight, setWeight] = React.useState<IconWeight>(initialWeight);
  const [copied, setCopied] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    // Match on the base name, and drop a trailing "icon" from the query
    // so pasting the full export name (`MagnifyingGlassIcon`) finds the
    // icon too. Every entry shares that suffix, so matching against it
    // would make "icon" a query that returns everything.
    const q = query.trim().toLowerCase().replace(/icon$/, '');
    if (!q) return CATALOG_ICONS;
    return CATALOG_ICONS.filter((name) => name.toLowerCase().includes(q));
  }, [query]);

  async function handleCopy(name: string): Promise<void> {
    const snippet = `import { ${name} } from '@neoflo/atoms/icons';`;
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(name);
    } catch {
      // Clipboard API can fail in insecure contexts; silently ignore.
    }
  }

  function handleWeightChange(_: React.MouseEvent<HTMLElement>, next: IconWeight | null) {
    if (next) setWeight(next);
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}
      >
        <TextField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search icons (e.g. arrow, shield, user)"
          size="small"
          fullWidth
          sx={{ maxWidth: { md: 360 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <PhosphorIcons.MagnifyingGlassIcon size={16} />
                </InputAdornment>
              ),
            },
          }}
        />
        <ToggleButtonGroup
          value={weight}
          exclusive
          size="small"
          onChange={handleWeightChange}
          aria-label="Icon weight"
        >
          {WEIGHTS.map((w) => (
            <ToggleButton
              key={w}
              value={w}
              sx={{ textTransform: 'capitalize', px: 1.5 }}
            >
              {w}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      <Typography variant="caption" color="text.secondary">
        Showing {filtered.length} of {CATALOG_ICONS.length} curated icons.
        Need something else? Browse the full ~9,000-icon catalog at{' '}
        <Box
          component="a"
          href="https://phosphoricons.com"
          target="_blank"
          rel="noreferrer"
          sx={{ color: 'primary.main' }}
        >
          phosphoricons.com
        </Box>
        {' '}— every icon shown there is importable from{' '}
        <code>@neoflo/atoms/icons</code>. Names there are unsuffixed, so add{' '}
        <code>Icon</code>: <code>magnifying-glass</code> imports as{' '}
        <code>MagnifyingGlassIcon</code>.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(4, 1fr)',
            lg: 'repeat(5, 1fr)',
          },
          gap: 1.5,
        }}
      >
        {filtered.map((base) => {
          const name = exportName(base);
          const Component = resolveIcon(name);
          if (!Component) return null;
          return (
            <Tooltip key={name} title="Click to copy import">
              <IconButton
                onClick={() => handleCopy(name)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  p: 2,
                  borderRadius: 1.5,
                  border: 1,
                  borderColor: 'divider',
                  color: 'text.primary',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover',
                  },
                }}
                aria-label={`Copy import for ${name}`}
              >
                <Component size={28} weight={weight} />
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: MONO_FONT,
                    fontSize: 11,
                    color: 'text.secondary',
                    textAlign: 'center',
                    wordBreak: 'break-all',
                  }}
                >
                  {name}
                </Typography>
              </IconButton>
            </Tooltip>
          );
        })}
      </Box>

      <Snackbar
        open={copied !== null}
        autoHideDuration={1800}
        onClose={() => setCopied(null)}
        message={copied ? `Copied import for ${copied}` : ''}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Stack>
  );
}

IconBrowser.displayName = 'IconBrowser';
