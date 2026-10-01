'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Typography from '@mui/material/Typography';
import NextLink from '@/app/_lib/Link';
import { MagnifyingGlassIcon } from '@/src/icons';

/**
 * Where `scripts/build-search-index.mjs` writes the Pagefind bundle. It
 * is a static file served from `public/`, loaded at runtime rather than
 * bundled, so the index always matches the build that produced it.
 */
const PAGEFIND_URL = '/pagefind/pagefind.js';
const MAX_PAGES = 8;
const MAX_SECTIONS = 2;

interface PagefindSubResult {
  title: string;
  url: string;
  excerpt: string;
}

interface PagefindResultData {
  url: string;
  excerpt: string;
  meta: { title?: string };
  sub_results: PagefindSubResult[];
}

interface PagefindSearch {
  results: { data: () => Promise<PagefindResultData> }[];
}

/** The slice of Pagefind's browser API this dialog uses. */
interface Pagefind {
  init: () => Promise<void>;
  /** Resolves `null` when a newer call has superseded this one. */
  debouncedSearch: (term: string, options?: object, timeout?: number) => Promise<PagefindSearch | null>;
}

let pagefindPromise: Promise<Pagefind> | null = null;

/** Loads Pagefind once per page view; a failed load is retried on the next search. */
function loadPagefind(): Promise<Pagefind> {
  pagefindPromise ??= import(/* webpackIgnore: true */ /* turbopackIgnore: true */ PAGEFIND_URL)
    .then(async (pagefind: Pagefind) => {
      await pagefind.init();
      return pagefind;
    })
    .catch((error: unknown) => {
      pagefindPromise = null;
      throw error;
    });
  return pagefindPromise;
}

interface SearchItem {
  url: string;
  title: string;
  excerpt: string;
  /** Set on a section hit: it renders indented under its page. */
  isSection: boolean;
}

/** One row per page, followed by its best-matching sections. */
function toItems(pages: PagefindResultData[]): SearchItem[] {
  return pages.flatMap((page) => {
    const sections = page.sub_results
      .filter((sub) => sub.url.includes('#'))
      .slice(0, MAX_SECTIONS);
    return [
      { url: page.url, title: page.meta.title ?? page.url, excerpt: page.excerpt, isSection: false },
      ...sections.map((sub) => ({ url: sub.url, title: sub.title, excerpt: sub.excerpt, isSection: true })),
    ];
  });
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", '#x27': "'" };

function decodeEntities(text: string): string {
  return text.replace(/&(amp|lt|gt|quot|#39|#x27);/g, (_, name: string) => ENTITIES[name]);
}

/**
 * Renders a Pagefind excerpt without `dangerouslySetInnerHTML`. Excerpts
 * are escaped text with `<mark>` around the matched words and no other
 * markup, so splitting on the tags alternates plain and matched runs.
 */
function Excerpt({ html }: { html: string }) {
  return html.split(/<\/?mark>/).map((part, i) =>
    i % 2 === 1 ? (
      <Box
        key={i}
        component="mark"
        sx={{ bgcolor: 'transparent', color: 'text.primary', fontWeight: 600 }}
      >
        {decodeEntities(part)}
      </Box>
    ) : (
      decodeEntities(part)
    )
  );
}

Excerpt.displayName = 'Excerpt';

type Status = 'idle' | 'loading' | 'ready' | 'unavailable';

function subscribeToNothing(): () => void {
  return () => undefined;
}

/** The open-search shortcut as this platform writes it; `null` on the server. */
function useShortcutLabel(): string | null {
  return React.useSyncExternalStore(
    subscribeToNothing,
    () => (/Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘K' : 'Ctrl K'),
    () => null
  );
}

/**
 * Docs-site search: a top-bar trigger (and Cmd/Ctrl+K) that opens a
 * dialog querying the Pagefind index built from the prerendered pages.
 * Nothing is registered per page — whatever the build renders inside the
 * shell's main slot is searchable.
 *
 * The index only exists after `npm run build`, so under `npm run dev`
 * the dialog says so instead of returning nothing.
 */
export function DocsSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [status, setStatus] = React.useState<Status>('idle');
  const [items, setItems] = React.useState<SearchItem[]>([]);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const shortcut = useShortcutLabel();
  const itemRefs = React.useRef<(HTMLElement | null)[]>([]);
  // Bumped on every keystroke, so a slow answer to an older query is dropped.
  const requestRef = React.useRef(0);

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsOpen((open) => !open);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  React.useEffect(() => {
    itemRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  function handleOpen() {
    setIsOpen(true);
    // Start fetching the index while the dialog animates in.
    loadPagefind().catch(() => undefined);
  }

  function handleClose() {
    setIsOpen(false);
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    const request = ++requestRef.current;
    const term = value.trim();
    if (!term) {
      setStatus('idle');
      setItems([]);
      return;
    }

    setStatus((current) => (current === 'ready' ? current : 'loading'));
    loadPagefind()
      .then((pagefind) => pagefind.debouncedSearch(term, {}, 150))
      .then(async (search) => {
        if (!search || request !== requestRef.current) return;
        const pages = await Promise.all(search.results.slice(0, MAX_PAGES).map((result) => result.data()));
        if (request !== requestRef.current) return;
        setItems(toItems(pages));
        setActiveIndex(0);
        setStatus('ready');
      })
      .catch(() => {
        if (request === requestRef.current) setStatus('unavailable');
      });
  }

  function handleInputKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (items.length === 0) return;
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((index) => (index + step + items.length) % items.length);
    } else if (event.key === 'Enter' && items[activeIndex]) {
      event.preventDefault();
      router.push(items[activeIndex].url);
      setIsOpen(false);
    }
  }

  let message: string | null = null;
  if (status === 'idle') message = 'Search components, patterns, tokens and guides.';
  else if (status === 'loading') message = 'Searching…';
  else if (status === 'unavailable')
    message =
      process.env.NODE_ENV === 'development'
        ? 'The search index is written by `npm run build`. Run it once, then reload.'
        : 'Search is unavailable right now.';
  else if (items.length === 0) message = `No results for “${query.trim()}”.`;

  return (
    <>
      <IconButton
        aria-label="Search docs"
        size="small"
        onClick={handleOpen}
        sx={{ display: { md: 'none' } }}
      >
        <MagnifyingGlassIcon size={18} />
      </IconButton>
      <ButtonBase
        onClick={handleOpen}
        sx={{
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          gap: 1,
          width: 240,
          px: 1.5,
          py: 0.75,
          mr: 1,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1.5,
          color: 'text.secondary',
          justifyContent: 'flex-start',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <MagnifyingGlassIcon size={16} />
        <Typography variant="body2" sx={{ flex: 1, textAlign: 'left' }}>
          Search docs
        </Typography>
        {shortcut && (
          <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>
            {shortcut}
          </Typography>
        )}
      </ButtonBase>

      <Dialog
        open={isOpen}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        sx={{ '& .MuiDialog-container': { alignItems: 'flex-start' } }}
        slotProps={{ paper: { sx: { mt: { xs: 2, md: 10 }, borderRadius: 2 } } }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            color: 'text.secondary',
          }}
        >
          <MagnifyingGlassIcon size={18} />
          <InputBase
            autoFocus
            fullWidth
            placeholder="Search docs"
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            onKeyDown={handleInputKeyDown}
            inputProps={{ 'aria-label': 'Search docs' }}
            sx={{ fontSize: 16, color: 'text.primary' }}
          />
        </Box>

        {message ? (
          <Typography variant="body2" color="text.secondary" sx={{ px: 2.5, py: 3 }}>
            {message}
          </Typography>
        ) : (
          <List dense sx={{ maxHeight: '60vh', overflowY: 'auto', p: 1 }}>
            {items.map((item, index) => (
              <ListItemButton
                key={item.url}
                ref={(node: HTMLElement | null) => {
                  itemRefs.current[index] = node;
                }}
                component={NextLink}
                href={item.url}
                onNavigate={handleClose}
                selected={index === activeIndex}
                onMouseMove={() => setActiveIndex(index)}
                sx={{
                  display: 'block',
                  borderRadius: 1.5,
                  py: 1,
                  ...(item.isSection && { ml: 2, borderLeft: '1px solid', borderColor: 'divider', borderRadius: 0 }),
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {item.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  <Excerpt html={item.excerpt} />
                </Typography>
              </ListItemButton>
            ))}
          </List>
        )}
      </Dialog>
    </>
  );
}

DocsSearch.displayName = 'DocsSearch';
