'use client';

import * as React from 'react';

import { AgenticChat, type Attachment, type ScopeGroup } from '@/src/chat';
import { chartBlock } from '@/src/chat/charts';
import type { MockAdapter } from '@/src/chat/mock';

/** The workflow picker's catalogue in the demo. Shared with the gallery. */
export const SCOPE_GROUPS: ScopeGroup[] = [
  {
    id: 'ws_finance',
    label: 'Finance',
    items: [
      { id: 'ip', label: 'Invoice Processing' },
      { id: 'col', label: 'Collections' },
    ],
  },
  {
    id: 'ws_ap',
    label: 'Accounts Payable',
    items: [
      { id: 'ip', label: 'Invoice Processing' },
      { id: 'sa', label: 'Spend Analytics' },
    ],
  },
];

/** The line under the composer: what the demo is, and what to ask it. */
export const DEMO_FOOTER =
  'Demo backend with sample data. Try the suggestions, or ask it to post, reconcile, chart, pick, fail, show a scan or search invoice processing.';

const FEEDBACK_ISSUES = [
  { id: 'wrong', label: 'Wrong or made-up numbers' },
  { id: 'missed', label: 'Didn’t answer the question' },
  { id: 'slow', label: 'Too slow' },
];

/** Pretends to upload: reports progress for a second, then returns a local object URL. */
async function demoUpload(
  file: File,
  { signal, onProgress }: { signal: AbortSignal; onProgress: (p: number) => void }
): Promise<Attachment> {
  for (let i = 1; i <= 10; i++) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    onProgress(i / 10);
  }
  return { url: URL.createObjectURL(file), filename: file.name, content_type: file.type, size: file.size, meta: {} };
}

/** What the playground can switch. Each maps to one prop of `<AgenticChat>`. */
export interface ChatDemoSettings {
  navigation: 'header' | 'rail';
  history: boolean;
  /** The row under each answer. */
  turnActions: boolean;
  /** Thumbs up and down in that row, which need `onFeedback`. */
  feedback: boolean;
  /** The + menu; off brings back the paperclip and the workflow pill. */
  menu: boolean;
  attachments: boolean;
  footer: boolean;
}

export const DEFAULT_DEMO_SETTINGS: ChatDemoSettings = {
  navigation: 'rail',
  history: true,
  turnActions: true,
  feedback: true,
  menu: true,
  attachments: true,
  footer: true,
};

/**
 * The whole chat on the mock backend, as the playground configures it.
 *
 * `attachments` is read when the chat starts, so the playground remounts this
 * when it changes; every other setting applies live.
 */
export function ChatDemo({
  adapter,
  settings,
  onTitleChange,
}: {
  adapter: MockAdapter;
  settings: ChatDemoSettings;
  onTitleChange?: (title: string, conversationId: string | null) => void;
}) {
  return (
    <AgenticChat
      adapter={adapter}
      // The mock keeps the conversations itself, so the chat needs no cache of its own.
      persistence={false}
      blocks={[chartBlock]}
      scope={{ groups: SCOPE_GROUPS }}
      navigation={settings.navigation}
      history={settings.history}
      onTitleChange={onTitleChange}
      attachments={
        settings.attachments
          ? { upload: demoUpload, accept: '.pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.txt,.md', maxSize: 10 * 1024 * 1024 }
          : undefined
      }
      // A real app hands the credential to its backend here (PUT /v1/connections/{sourceId}).
      onConnectionRequired={async ({ sourceId }) => {
        if (!sourceId) return false;
        await new Promise((resolve) => setTimeout(resolve, 600));
        adapter.connect(sourceId);
        return true;
      }}
      turnActions={
        settings.turnActions
          ? settings.feedback
            ? {
                // The standard has no feedback endpoint: a real app sends this to its own API.
                onFeedback: () => new Promise((resolve) => setTimeout(resolve, 300)),
                feedbackIssueTypes: FEEDBACK_ISSUES,
              }
            : {}
          : false
      }
      composerProps={{
        menu: settings.menu ? undefined : false,
        footer: settings.footer ? DEMO_FOOTER : undefined,
      }}
    />
  );
}
