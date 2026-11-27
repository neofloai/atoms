import { ChatPlayground } from './_components/ChatPlayground';

export const metadata = {
  title: 'Chat playground — Atoms',
  description:
    'The whole agentic chat on the mock backend, full screen: switch its layout, the row under each answer, the + menu and how fast it replies, and copy the code for what you see.',
};

/**
 * The chat on a page of its own, outside the docs shell: an app bar that
 * names the chat on screen, the chat filling the rest, and a settings panel
 * beside it. Linked from the chat overview and the docs sidebar.
 */
export default function ChatPlaygroundPage() {
  return <ChatPlayground />;
}
