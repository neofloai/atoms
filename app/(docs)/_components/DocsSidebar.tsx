'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import NextLink from '@/app/_lib/Link';
import { navigation, type NavItem } from './navigation';

interface DocsSidebarProps {
  onItemClick?: () => void;
}

/**
 * Tracks the active URL (pathname + hash) used to highlight sidebar
 * items. `usePathname` from `next/navigation` returns only the
 * pathname (no hash) and updates a render or two after a `<Link>`
 * click. Without compensation the highlight flickers to the previous
 * item until `pathname` catches up.
 *
 * Three signals are combined into one canonical `activeUrl`:
 *
 *   - `pathname` from `next/navigation`.
 *   - `hash` from `window.location.hash`, synced on mount, on
 *     `pathname` change, and on the `hashchange` event.
 *   - `prediction` — an optimistic snapshot set by `predict(href)`
 *     from `<Link onNavigate>`. It is anchored to `pathname` (not the
 *     full URL) so a synchronous hash change does not invalidate it,
 *     and it lives while `pathname` equals either the snapshot
 *     pathname (navigation still pending) or the predicted pathname
 *     (navigation succeeded). A `popstate` listener clears the
 *     prediction on browser back/forward to avoid back-nav highlights
 *     getting stuck on a stale prediction.
 */
interface Prediction {
  /** Full URL we predicted (may include hash). */
  readonly url: string;
  /** Pathname the user was on when they clicked. */
  readonly fromPathname: string;
  /** Pathname portion of `url`, precomputed for cheap comparison. */
  readonly toPathname: string;
}

function pathnameOf(href: string): string {
  const i = href.indexOf('#');
  return i === -1 ? href : href.slice(0, i);
}

function useActiveUrl(): readonly [string, (predicted: string) => void] {
  const pathname = usePathname();
  const [hash, setHash] = React.useState('');
  const [prediction, setPrediction] = React.useState<Prediction | null>(null);

  React.useEffect(() => {
    function update(): void {
      setHash(window.location.hash);
    }
    update();
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, [pathname]);

  React.useEffect(() => {
    function clear(): void {
      setPrediction(null);
    }
    window.addEventListener('popstate', clear);
    return () => window.removeEventListener('popstate', clear);
  }, []);

  const realUrl = hash ? `${pathname}${hash}` : pathname;

  // Prediction is "live" while either:
  //   1. `pathname` still equals `fromPathname` -> navigation hasn't
  //      completed; show the predicted URL to avoid flicker.
  //   2. `pathname` has reached `toPathname` -> navigation succeeded;
  //      show the predicted URL until `hash` syncs (otherwise the
  //      stale hash would cause a one-frame "no match" flash).
  // Browser back/forward fires `popstate` and clears the prediction
  // before this evaluation runs, so back-nav is not affected.
  const isLive =
    prediction !== null &&
    (pathname === prediction.fromPathname ||
      pathname === prediction.toPathname);
  const activeUrl = isLive ? prediction!.url : realUrl;

  function predict(next: string): void {
    setPrediction({
      url: next,
      fromPathname: pathname,
      toPathname: pathnameOf(next),
    });
  }

  return [activeUrl, predict] as const;
}

/**
 * Renders the docs-site navigation list driven by `navigation.ts`.
 *
 * Active highlighting matches against `pathname + hash`:
 *   - `/` is active only when on the root with no hash.
 *   - `/tokens` is active only when on `/tokens` with no hash; clicking
 *     `/tokens#typography` deselects it in favour of Typography.
 *   - `/tokens#typography` is active only when both pathname and hash
 *     match exactly.
 *   - Hashless items also match nested routes
 *     (`/components/button/playground` highlights `/components/button`).
 *
 * `onItemClick` is invoked after any link is tapped so the mobile
 * drawer can close itself.
 */
export function DocsSidebar({ onItemClick }: DocsSidebarProps) {
  const pathname = usePathname();
  const [activeUrl, predict] = useActiveUrl();

  function isActive(item: NavItem): boolean {
    if (item.disabled) return false;
    if (item.href === activeUrl) return true;
    if (!item.href.includes('#') && pathname.startsWith(`${item.href}/`)) {
      return true;
    }
    return false;
  }

  function handleNavigate(item: NavItem): void {
    if (item.disabled) return;
    // Predict the target URL synchronously so the highlight switches
    // before Next.js completes the route change. Hooked into
    // `next/link`'s `onNavigate` rather than `onClick` so it only fires
    // for real client-side navigations (cmd-click, new tabs, downloads,
    // and external links are excluded).
    predict(item.href);
    onItemClick?.();
  }

  return (
    <Box
      role="navigation"
      aria-label="Docs"
      sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <Toolbar sx={{ minHeight: 56, px: 3 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: 1,
              bgcolor: 'primary.main',
            }}
          />
          <Stack spacing={-0.25}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Neoflo Atoms
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontSize: 11 }}
            >
              v0.1.0 · design system
            </Typography>
          </Stack>
        </Stack>
      </Toolbar>
      <Box sx={{ overflowY: 'auto', flex: 1, pb: 4 }}>
        {navigation.map((section) => (
          <Box key={section.title} sx={{ mt: 2 }}>
            <Typography
              variant="overline"
              sx={{
                display: 'block',
                px: 3,
                pb: 0.5,
                color: 'text.secondary',
                fontWeight: 700,
                letterSpacing: 0.6,
              }}
            >
              {section.title}
            </Typography>
            <List dense disablePadding>
              {section.items.map((item) => {
                const active = isActive(item);
                const linkProps = item.disabled
                  ? ({ component: 'div' } as const)
                  : ({
                      component: NextLink,
                      href: item.href,
                      onNavigate: () => handleNavigate(item),
                    } as const);
                return (
                  <ListItem key={item.label} disablePadding sx={{ px: 1.5 }}>
                    <ListItemButton
                      {...linkProps}
                      disabled={item.disabled}
                      selected={active}
                      sx={{
                        borderRadius: 1.5,
                        py: 0.75,
                        '&.Mui-selected': {
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          '&:hover': { bgcolor: 'primary.dark' },
                        },
                      }}
                    >
                      <ListItemText
                        primary={item.label}
                        slotProps={{
                          primary: {
                            sx: { fontSize: 14, fontWeight: active ? 600 : 500 },
                          },
                        }}
                      />
                      {item.disabled && (
                        <Typography
                          variant="caption"
                          sx={{
                            ml: 1,
                            px: 0.75,
                            py: 0.125,
                            borderRadius: 0.75,
                            bgcolor: 'action.hover',
                            color: 'text.disabled',
                            fontSize: 10,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 0.4,
                          }}
                        >
                          Soon
                        </Typography>
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

DocsSidebar.displayName = 'DocsSidebar';
