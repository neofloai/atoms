'use client';

import * as React from 'react';

import { AgenticChat, type Attachment, type ScopeGroup } from '@/src/chat';
import { chartBlock } from '@/src/chat/charts';
import { createMockAdapter } from '@/src/chat/mock';

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

/**
 * The whole chat on the mock backend, live on the overview page.
 *
 * Session storage rather than local: a reader's demo conversations follow
 * them between docs pages and are gone when the tab closes, so the page
 * never greets a returning reader with last week's test chats.
 */
export function ChatDemo() {
  const [mock] = React.useState(() => createMockAdapter());
  return (
    <AgenticChat
      adapter={mock}
      blocks={[chartBlock]}
      scope={{ groups: SCOPE_GROUPS }}
      attachments={{ upload: demoUpload, accept: '.pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.txt,.md', maxSize: 10 * 1024 * 1024 }}
      persistence={{ storage: 'session', scope: 'atoms-docs', persist: { history: true } }}
      // A real app hands the credential to its backend here (PUT /v1/connections/{sourceId}).
      onConnectionRequired={async ({ sourceId }) => {
        if (!sourceId) return false;
        await new Promise((resolve) => setTimeout(resolve, 600));
        mock.connect(sourceId);
        return true;
      }}
      // The standard has no feedback endpoint: a real app sends this to its own API.
      turnActions={{
        onFeedback: () => new Promise((resolve) => setTimeout(resolve, 300)),
        feedbackIssueTypes: [
          { id: 'wrong', label: 'Wrong or made-up numbers' },
          { id: 'missed', label: 'Didn’t answer the question' },
          { id: 'slow', label: 'Too slow' },
        ],
      }}
      composerProps={{
        footer:
          'Demo backend with sample data. Try the suggestions, or ask it to post, reconcile, chart, pick, fail, show a scan or search invoice processing.',
      }}
    />
  );
}
