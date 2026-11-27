'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { Theme } from '@mui/material/styles';

import { ColorModeToggle } from '@/app/(docs)/_components/ColorModeToggle';
import {
  ChatDemo,
  DEFAULT_DEMO_SETTINGS,
  type ChatDemoSettings,
} from '@/app/(docs)/chat/_components/ChatDemo';
import { Box } from '@/src/components/Box';
import { Drawer } from '@/src/components/Drawer';
import { IconButton } from '@/src/components/IconButton';
import { Navbar, NavbarTitle } from '@/src/components/Navbar';
import { Stack } from '@/src/components/Stack';
import { Tooltip } from '@/src/components/Tooltip';
import { createMockAdapter } from '@/src/chat/mock';
import { ArrowLeftIcon, SlidersHorizontalIcon } from '@/src/icons';

import {
  PlaygroundSettings,
  REPLY_SPEEDS,
  type ReplySpeed,
} from './PlaygroundSettings';

/** Where the mock keeps its conversations, so they survive a reload and a change of speed. */
const CONVERSATIONS_KEY = 'atoms-chat-playground';
/** Where the settings are remembered, per browser. */
const SETTINGS_KEY = 'atoms-chat-playground:settings';

/** The app bar's title before the chat has one. */
const NEW_CHAT_TITLE = 'Ask Neo';

/** Width of the settings panel. */
const PANEL_WIDTH_PX = 320;

interface Saved {
  chat: ChatDemoSettings;
  speed: ReplySpeed;
}

const DEFAULTS: Saved = { chat: DEFAULT_DEMO_SETTINGS, speed: 'normal' };

function readSaved(): Saved {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULTS;
    const saved = JSON.parse(raw) as Partial<Saved>;
    return {
      chat: { ...DEFAULT_DEMO_SETTINGS, ...saved.chat },
      speed: saved.speed && saved.speed in REPLY_SPEEDS ? saved.speed : 'normal',
    };
  } catch {
    return DEFAULTS;
  }
}

/**
 * The settings, remembered per browser. A store rather than state so the
 * server renders the defaults and the browser what was saved, without a
 * mismatch: `useSyncExternalStore` reads each from its own snapshot. Held in
 * memory too, so the settings still change where storage is off.
 */
const settingsStore = (() => {
  let current: Saved | null = null;
  const listeners = new Set<() => void>();
  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    get(): Saved {
      current ??= readSaved();
      return current;
    },
    getServer: (): Saved => DEFAULTS,
    set(next: Saved) {
      current = next;
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      } catch {
        // Private mode or storage off: the settings just aren't remembered.
      }
      listeners.forEach((listener) => listener());
    },
  };
})();

/**
 * The chat playground: the app bar, the chat on the mock backend, and the
 * settings that drive it.
 *
 * The chat is laid out the way an app would host it — an app bar above it
 * whose title is the conversation on screen, through `onTitleChange` — so
 * the page shows the setup as well as the chat.
 */
export function ChatPlayground() {
  const router = useRouter();
  const { chat, speed } = React.useSyncExternalStore(
    settingsStore.subscribe,
    settingsStore.get,
    settingsStore.getServer
  );
  const setChat = (patch: Partial<ChatDemoSettings>) =>
    settingsStore.set({ speed, chat: { ...chat, ...patch } });
  const setSpeed = (next: ReplySpeed) => settingsStore.set({ chat, speed: next });

  // Bumped by Clear conversations, to start the chat over on the emptied backend.
  const [generation, setGeneration] = React.useState(0);
  // A new mock for each speed: its timing is fixed when it is created. The
  // conversations live under one key, so every mock sees the same ones.
  const adapter = React.useMemo(
    () =>
      createMockAdapter({
        speed: REPLY_SPEEDS[speed].ms,
        latency: speed === 'instant' ? 0 : undefined,
        persistKey: CONVERSATIONS_KEY,
      }),
    [speed]
  );

  const [title, setTitle] = React.useState(NEW_CHAT_TITLE);
  const onTitleChange = React.useCallback(
    (chatTitle: string, conversationId: string | null) =>
      setTitle(conversationId ? chatTitle : NEW_CHAT_TITLE),
    []
  );

  const compact = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const [wideOpen, setWideOpen] = React.useState(true);
  const [compactOpen, setCompactOpen] = React.useState(false);
  const panelOpen = compact ? compactOpen : wideOpen;
  const togglePanel = () =>
    compact ? setCompactOpen((open) => !open) : setWideOpen((open) => !open);

  const clearConversations = () => {
    adapter.reset();
    setTitle(NEW_CHAT_TITLE);
    setGeneration((g) => g + 1);
  };

  return (
    // Indexed for the docs search like any docs page, minus the mock chat's
    // own words: the search finds the playground by its title and settings.
    <Stack
      direction="row"
      data-pagefind-body
      sx={{ height: '100dvh', overflow: 'hidden' }}
    >
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Navbar>
          <Stack
            direction="row"
            sx={{ flex: 1, minWidth: 0, alignItems: 'center', gap: 2 }}
          >
            <Tooltip title="Back to the docs">
              <IconButton
                variant="secondary"
                appearance="text"
                size="sm"
                // IconButton's type has no `href`, so the router takes it back.
                onClick={() => router.push('/chat')}
                aria-label="Back to the docs"
              >
                <ArrowLeftIcon />
              </IconButton>
            </Tooltip>
            <NavbarTitle>{title}</NavbarTitle>
            <Box sx={{ flex: 1 }} />
            <ColorModeToggle />
            <Tooltip title={panelOpen ? 'Hide settings' : 'Show settings'}>
              <IconButton
                variant="secondary"
                appearance="text"
                size="sm"
                aria-label="Settings"
                aria-pressed={panelOpen}
                onClick={togglePanel}
              >
                <SlidersHorizontalIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Navbar>
        <Box data-pagefind-ignore sx={{ flex: 1, minHeight: 0 }}>
          {/* Attachments are read when the chat starts, so turning them on or
              off starts it again; the other settings apply as they change. */}
          <ChatDemo
            key={`${speed}-${chat.attachments}-${generation}`}
            adapter={adapter}
            settings={chat}
            onTitleChange={onTitleChange}
          />
        </Box>
      </Stack>
      <Drawer
        anchor="right"
        variant={compact ? 'temporary' : 'persistent'}
        open={panelOpen}
        onClose={() => setCompactOpen(false)}
        size={PANEL_WIDTH_PX}
      >
        <PlaygroundSettings
          settings={chat}
          onChange={setChat}
          speed={speed}
          onSpeedChange={setSpeed}
          onClearConversations={clearConversations}
          onClose={compact ? () => setCompactOpen(false) : undefined}
        />
      </Drawer>
    </Stack>
  );
}
