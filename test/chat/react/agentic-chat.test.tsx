import { NeofloThemeProvider } from '@/src/theme/ThemeProvider';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AgenticChat, defaultLabels, defineBlock, suggestionGlyph, useHitl, type ChatAction } from '@/src/chat/index';
import { SparkleIcon, TrayIcon } from '@/src/icons/glyphs';
import { createMockAdapter } from '@/src/chat/mock';

/** The composer's textarea. It moves from the welcome to the dock on the first send, so query it fresh. */
const composerInput = () => screen.getByRole('textbox', { name: 'Message' }) as HTMLTextAreaElement;

function renderChat(props: Partial<React.ComponentProps<typeof AgenticChat>> = {}) {
  const adapter = props.adapter ?? createMockAdapter({ latency: 0, speed: 0 });
  return render(
    <NeofloThemeProvider defaultMode="light">
      <div style={{ height: 800 }}>
        <AgenticChat adapter={adapter} persistence={false} refreshOnFocus={false} {...props} />
      </div>
    </NeofloThemeProvider>,
  );
}

describe('<AgenticChat>', () => {
  it('shows the server greeting and suggested prompts, then answers a suggestion', async () => {
    renderChat();
    expect(await screen.findByText('Hey! What can I help you dig into today?')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'What is waiting on me?' }));
    // The user's turn shows the prompt text, not the chip label.
    expect(await screen.findByText('Which invoices are still waiting on me?')).toBeTruthy();
    expect(await screen.findByText(/Four are waiting on you/, undefined, { timeout: 4000 })).toBeTruthy();
    // The text streams in first; the table and sources blocks come after it.
    expect(await screen.findByText('Held invoices', undefined, { timeout: 4000 })).toBeTruthy();
    expect(screen.getByText('search_invoices')).toBeTruthy();
    expect(await screen.findByText('3 sources', undefined, { timeout: 4000 })).toBeTruthy();
  });

  it('sends on Enter but not on Shift+Enter, and clears the composer', async () => {
    renderChat();
    const input = (await screen.findByRole('textbox', { name: 'Message' })) as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: 'first line' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    expect(input.value).toBe('first line');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(await screen.findByText('first line')).toBeTruthy();
    // The welcome's composer gave way to the docked one, which is empty and has the focus.
    await waitFor(() => expect(composerInput()).not.toBe(input));
    expect(composerInput().value).toBe('');
    expect(document.activeElement).toBe(composerInput());
  });

  it('opens on the welcome with the composer under the greeting, and docks it once a message goes out', async () => {
    const { container } = renderChat();
    await screen.findByText('Hey! What can I help you dig into today?');
    expect(container.querySelector('[data-placement="welcome"]')).toBeTruthy();
    expect(container.querySelector('[data-placement="docked"]')).toBeNull();
    expect(composerInput().placeholder).toBe('How can I help you today?');
    expect(composerInput().rows).toBe(3);
    // At rest the card is the input and the +; send appears once there is text.
    expect(screen.queryByRole('button', { name: 'Send' })).toBeNull();
    fireEvent.change(composerInput(), { target: { value: 'hello there' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    await waitFor(() => expect(container.querySelector('[data-placement="docked"]')).toBeTruthy());
    expect(container.querySelector('[data-placement="welcome"]')).toBeNull();
    expect(composerInput().placeholder).toBe('Ask anything');
    expect(composerInput().rows).toBe(1);
  });

  it('removes a suggested prompt with its ×, and keeps it removed in the next chat', async () => {
    renderChat();
    const list = await screen.findByRole('list', { name: 'Suggested prompts' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(6);
    fireEvent.click(screen.getByRole('button', { name: 'Remove “Post the held invoices”' }));
    expect(screen.queryByRole('button', { name: 'Post the held invoices' })).toBeNull();
    expect(within(list).getAllByRole('listitem')).toHaveLength(5);
    // The × went with its row, so focus moves to the row that took its place.
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Which vendor is slowest?' })));

    fireEvent.change(composerInput(), { target: { value: 'hello there' } });
    fireEvent.keyDown(composerInput(), { key: 'Enter' });
    await waitFor(() => expect(screen.queryByRole('list', { name: 'Suggested prompts' })).toBeNull());
    fireEvent.click(screen.getByRole('button', { name: 'New chat' }));
    const next = await screen.findByRole('list', { name: 'Suggested prompts' });
    expect(within(next).getAllByRole('listitem')).toHaveLength(5);
    expect(screen.queryByRole('button', { name: 'Post the held invoices' })).toBeNull();
  });

  it("draws a prompt's icon from the list, and sparkle for none or a name it doesn't know", () => {
    expect(suggestionGlyph('inbox')).toBe(TrayIcon);
    expect(suggestionGlyph(undefined)).toBe(SparkleIcon);
    expect(suggestionGlyph('rocket')).toBe(SparkleIcon);
    expect(suggestionGlyph('toString')).toBe(SparkleIcon);
  });

  it('puts ask-again and the time under the newest answer, and no feedback without onFeedback', async () => {
    renderChat();
    fireEvent.change(await screen.findByRole('textbox', { name: 'Message' }), { target: { value: 'hello there' } });
    fireEvent.keyDown(composerInput(), { key: 'Enter' });
    const again = await screen.findByRole('button', { name: 'Ask again' }, { timeout: 4000 });
    expect(screen.getByText('just now')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Good response' })).toBeNull();
    fireEvent.click(again);
    // The question goes out again as a new turn.
    await waitFor(() => expect(screen.getAllByText('hello there')).toHaveLength(2));
  });

  it('sends thumbs up at once and thumbs down through its dialog, then thanks the user', async () => {
    const onFeedback = vi.fn();
    renderChat({
      turnActions: { onFeedback, feedbackIssueTypes: [{ id: 'wrong', label: 'Wrong numbers' }] },
    });
    fireEvent.change(await screen.findByRole('textbox', { name: 'Message' }), { target: { value: 'hello there' } });
    fireEvent.keyDown(composerInput(), { key: 'Enter' });
    const good = await screen.findByRole('button', { name: 'Good response' }, { timeout: 4000 });
    fireEvent.click(good);
    expect(onFeedback).toHaveBeenLastCalledWith(expect.objectContaining({ rating: 'good', messageId: expect.any(String) }));
    expect(await screen.findByText('Thanks for the feedback!')).toBeTruthy();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Good response' }).getAttribute('aria-pressed')).toBe('true'));

    fireEvent.click(screen.getByRole('button', { name: 'Bad response' }));
    const dialog = await screen.findByRole('dialog', { name: /Give negative feedback/ });
    fireEvent.change(within(dialog).getByRole('textbox', { name: /Please provide details/ }), { target: { value: ' Totals are off ' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Submit' }));
    await waitFor(() =>
      expect(onFeedback).toHaveBeenLastCalledWith(expect.objectContaining({ rating: 'bad', details: 'Totals are off' })),
    );
    expect(onFeedback.mock.lastCall?.[0]).not.toHaveProperty('issueType');
  });

  it('hides the row under answers with turnActions={false}', async () => {
    renderChat({ turnActions: false });
    fireEvent.change(await screen.findByRole('textbox', { name: 'Message' }), { target: { value: 'hello there' } });
    fireEvent.keyDown(composerInput(), { key: 'Enter' });
    await waitFor(() => expect(screen.getAllByText(/./).length).toBeGreaterThan(0));
    await new Promise((r) => setTimeout(r, 300));
    expect(screen.queryByRole('button', { name: 'Ask again' })).toBeNull();
    expect(screen.queryByText('just now')).toBeNull();
  });

  it('says when an answer was given in words', () => {
    const now = new Date('2026-11-26T12:00:00Z');
    const ago = (ms: number) => defaultLabels.timeAgo(new Date(now.getTime() - ms), now);
    expect(ago(20_000)).toBe('just now');
    expect(ago(60_000)).toBe('1 min ago');
    expect(ago(40 * 60_000)).toBe('40 mins ago');
    expect(ago(3 * 3_600_000)).toBe('3 hrs ago');
    expect(ago(30 * 3_600_000)).toBe('Yesterday');
    expect(ago(4 * 86_400_000)).toBe('4 days ago');
  });

  it('puts New chat, History and Search on a rail with navigation="rail", and opens history in its place', async () => {
    renderChat({ navigation: 'rail', railFooter: <button type="button">Help</button> });
    await screen.findByRole('textbox', { name: 'Message' });
    // No header bar: the app shows the title.
    expect(screen.queryByRole('banner')).toBeNull();
    expect(screen.getByRole('button', { name: 'Help' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Search chats' }));
    const search = await screen.findByRole('searchbox', { name: 'Search chats' });
    await waitFor(() => expect(document.activeElement).toBe(search));
    expect(screen.queryByRole('button', { name: 'Search chats' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Hide chat history' }));
    expect(await screen.findByRole('button', { name: 'Search chats' })).toBeTruthy();
  });

  it("tells the app the conversation's title as it changes, for its app bar", async () => {
    const onTitleChange = vi.fn();
    renderChat({ navigation: 'rail', onTitleChange });
    await waitFor(() => expect(onTitleChange).toHaveBeenCalledWith('New chat', null));
    // The server makes the chat before anyone types; it is still a new chat, with no id to report.
    await screen.findByText('Hey! What can I help you dig into today?');
    expect(onTitleChange).not.toHaveBeenCalledWith('New chat', expect.any(String));
    fireEvent.change(await screen.findByRole('textbox', { name: 'Message' }), { target: { value: 'hello there' } });
    fireEvent.keyDown(composerInput(), { key: 'Enter' });
    // The backend names the chat when the first answer ends.
    await waitFor(() => expect(onTitleChange).toHaveBeenLastCalledWith('Hello there', expect.any(String)), { timeout: 4000 });
  });

  it('shows a footer given as a function only where it asks to: here, under a conversation', async () => {
    renderChat({ composerProps: { footer: (placement) => (placement === 'docked' ? 'Check the numbers.' : null) } });
    await screen.findByText('Hey! What can I help you dig into today?');
    expect(screen.queryByText('Check the numbers.')).toBeNull();
    fireEvent.change(composerInput(), { target: { value: 'hello there' } });
    fireEvent.keyDown(composerInput(), { key: 'Enter' });
    expect(await screen.findByText('Check the numbers.')).toBeTruthy();
  });

  it('takes "Jump to latest" away once the thread fits its view, and fills it', async () => {
    // jsdom lays nothing out: the sizes and the resizes are stood in for.
    const resized: ((entries: []) => void)[] = [];
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: (entries: []) => void) {
          resized.push(callback);
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    try {
      renderChat();
      await screen.findByText('Hey! What can I help you dig into today?');
      const thread = screen.getByRole('log');
      const lay = (scrollHeight: number) =>
        Object.defineProperties(thread, {
          scrollHeight: { value: scrollHeight, configurable: true },
          clientHeight: { value: 500, configurable: true },
        });
      const resize = () => act(() => resized.forEach((callback) => callback([])));
      const jump = () => screen.queryByRole('button', { name: defaultLabels.jumpToLatest });

      // Scrolled to the top of a long chat.
      lay(2000);
      fireEvent.scroll(thread);
      const button = await screen.findByRole('button', { name: defaultLabels.jumpToLatest });
      // Filled, so the thread doesn't show through it.
      expect(getComputedStyle(button).backgroundColor).not.toMatch(/^(transparent|rgba\(0, 0, 0, 0\))$/);

      // The thread grows with the reader still up it: the button stays.
      lay(2400);
      resize();
      expect(jump()).toBeTruthy();

      // A new or shorter chat: it fits the view, and nothing scrolled.
      lay(500);
      resize();
      expect(jump()).toBeNull();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('does not send while an IME composition is in progress', async () => {
    renderChat();
    const input = (await screen.findByRole('textbox', { name: 'Message' })) as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: 'にほん' } });
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(input.value).toBe('にほん');
  });

  it('runs the approval HITL flow: pause, block the composer, approve, continue', async () => {
    renderChat();
    const input = (await screen.findByRole('textbox', { name: 'Message' })) as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: 'Post the held invoices to NetSuite' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    const approve = await screen.findByRole('button', { name: 'Post all four' }, { timeout: 4000 });
    await waitFor(() => expect(composerInput().disabled).toBe(true));
    expect(composerInput().placeholder).toBe('Respond to the card above to continue');
    await waitFor(() => expect((approve as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(approve);
    expect(await screen.findByText('Approved', undefined, { timeout: 4000 })).toBeTruthy();
    expect(await screen.findByText(/VB-2231/, undefined, { timeout: 4000 })).toBeTruthy();
    await waitFor(() => expect(composerInput().disabled).toBe(false));
  });

  it('renders custom blocks and routes emit() to onAction', async () => {
    const onAction = vi.fn<(a: ChatAction) => void>();
    const invoiceCard = defineBlock<{ number: string }>({
      type: 'invoice_card',
      parse: (b) => ({ number: String(b.number) }),
      render: ({ data, actions }) => (
        <button type="button" onClick={() => actions.emit('open_invoice', data)}>
          Open {data.number}
        </button>
      ),
    });
    const adapter = createMockAdapter({
      latency: 0,
      speed: 0,
      includeDefaultScenarios: false,
      scenarios: [
        {
          name: 'card',
          match: () => true,
          run: async (w) => {
            await w.block({ type: 'invoice_card', category: 'ui', number: 'INV-1042' });
          },
        },
      ],
    });
    renderChat({ adapter, blocks: [invoiceCard], onAction });
    const input = await screen.findByRole('textbox', { name: 'Message' });
    fireEvent.change(input, { target: { value: 'show me the invoice' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.click(await screen.findByRole('button', { name: 'Open INV-1042' }, { timeout: 4000 }));
    expect(onAction).toHaveBeenCalledWith(expect.objectContaining({ name: 'open_invoice', payload: { number: 'INV-1042' } }));
  });

  it('isolates a crashing block behind an error boundary', async () => {
    const boom = defineBlock({
      type: 'boom',
      render: () => {
        throw new Error('kaboom');
      },
    });
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const adapter = createMockAdapter({
      latency: 0,
      speed: 0,
      includeDefaultScenarios: false,
      scenarios: [
        {
          name: 'boom',
          match: () => true,
          run: async (w) => {
            await w.block({ type: 'boom', category: 'ui' });
            await w.text('Still here.');
          },
        },
      ],
    });
    renderChat({ adapter, blocks: [boom] });
    const input = await screen.findByRole('textbox', { name: 'Message' });
    fireEvent.change(input, { target: { value: 'go' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(await screen.findByText('This part of the answer couldn’t be displayed.', undefined, { timeout: 4000 })).toBeTruthy();
    expect(await screen.findByText('Still here.')).toBeTruthy();
    spy.mockRestore();
  });

  it('lets a custom card answer a checkpoint through useHitl', async () => {
    function Consent() {
      const hitl = useHitl();
      return (
        <button type="button" disabled={!hitl.canSubmit} onClick={() => void hitl.submit({ agreed: true })}>
          {hitl.isResolved ? 'Thanks' : 'I agree'}
        </button>
      );
    }
    const consent = defineBlock({ type: 'consent', render: Consent });
    let seen: unknown;
    const adapter = createMockAdapter({
      latency: 0,
      speed: 0,
      includeDefaultScenarios: false,
      scenarios: [
        {
          name: 'consent',
          match: () => true,
          run: async (w) => {
            await w.pause({
              block: { type: 'consent', category: 'hitl' },
              onResume: async (next, decision) => {
                seen = decision;
                await next.text('Recorded.');
              },
            });
          },
        },
      ],
    });
    renderChat({ adapter, blocks: [consent] });
    const input = await screen.findByRole('textbox', { name: 'Message' });
    fireEvent.change(input, { target: { value: 'start' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    const btn = (await screen.findByRole('button', { name: 'I agree' }, { timeout: 4000 })) as HTMLButtonElement;
    await waitFor(() => expect(btn.disabled).toBe(false));
    fireEvent.click(btn);
    expect(await screen.findByText('Recorded.', undefined, { timeout: 4000 })).toBeTruthy();
    expect(seen).toEqual({ agreed: true });
    expect(screen.getByRole('button', { name: 'Thanks' })).toBeTruthy();
  });

  it('lists history, and renames a chat through the menu and dialog', async () => {
    const adapter = createMockAdapter({
      latency: 0,
      speed: 0,
      seed: [
        {
          conversation_id: 'c1',
          title: 'Acme Q3 invoice review',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          archived: false,
          messages: [
            {
              message_id: 'm',
              conversation_id: 'c1',
              role: 'user',
              content: [{ id: 'b', type: 'text', category: 'content', text: 'hi' }],
              created_at: new Date().toISOString(),
            },
          ],
        },
      ],
    });
    renderChat({ adapter });
    // jsdom has no layout, so the chat is in its compact mode: open the history overlay.
    fireEvent.click(await screen.findByRole('button', { name: 'Show chat history' }));
    const nav = await screen.findByRole('navigation', { name: 'History' });
    expect(await within(nav).findByText('Acme Q3 invoice review')).toBeTruthy();
    fireEvent.click(within(nav).getByRole('button', { name: 'More actions for Acme Q3 invoice review' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Rename' }));
    const dialog = await screen.findByRole('dialog');
    const field = within(dialog).getByRole('textbox');
    fireEvent.change(field, { target: { value: 'Acme review (done)' } });
    await act(async () => {
      fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
    });
    expect(await within(nav).findByText('Acme review (done)')).toBeTruthy();
  });
});
