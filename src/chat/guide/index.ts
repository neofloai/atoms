/**
 * The chat guide: one Markdown file per topic beside this module, listed
 * here with what a reader or an agent needs to pick it.
 *
 * Written once and read in two places. `scripts/generate.ts` reads each
 * topic's file into `data/chat.json`; the docs site renders every topic
 * from there under `/chat/<slug>`, and the MCP `get_chat` tool serves the
 * same text. A topic changed here is changed in both, which is the point —
 * a chat integration written from the MCP and one written from the docs
 * should never disagree.
 *
 * The order of `CHAT_TOPICS` is the order of the docs sidebar and of the
 * `get_chat` index: using the chat first, then the pages for backend
 * teams.
 *
 * Bodies are Markdown without a title (the page and the tool add it).
 * Link between topics as `/chat/<slug>` or `/chat/<slug>#anchor`; the docs
 * render those as site links and `get_chat` rewrites them into the topic
 * to request.
 */

export type ChatTopicAudience = 'app' | 'backend';

export interface ChatTopicMeta {
  /** URL segment under `/chat`, file name, and the `get_chat` topic id. */
  readonly slug: string;
  readonly title: string;
  /** One sentence: what the topic answers. Shown on the docs page and in search. */
  readonly summary: string;
  /**
   * Words someone would search for that the title does not carry. Read by
   * `search_docs`, so "copilot" or "approval card" lands on the right page.
   */
  readonly keywords: readonly string[];
  /** Who reads it: the app team integrating the UI, or the backend team serving it. */
  readonly audience: ChatTopicAudience;
}

export const CHAT_TOPICS: readonly ChatTopicMeta[] = [
  {
    slug: 'overview',
    title: 'Overview',
    summary:
      'A complete agentic chat on Atoms: streaming answers, history, human-in-the-loop decisions, tool activity, tables, charts and your own cards, against any backend on the Neoflo chat standard.',
    keywords: [
      'chat',
      'agentic chat',
      'assistant',
      'ai assistant',
      'copilot',
      'chatbot',
      'ask neo',
      'conversation',
      'AgenticChat',
      'install',
      'quick start',
      'server rendering',
      'use client',
    ],
    audience: 'app',
  },
  {
    slug: 'configuration',
    title: 'Configuration',
    summary:
      'Every option of `<AgenticChat>` and the REST adapter, driving the chat from anywhere in your app, and adapting a backend that does not follow the standard.',
    keywords: [
      'options',
      'props',
      'adapter',
      'createRestAdapter',
      'auth',
      'headers',
      'token',
      'runtime',
      'createChatRuntime',
      'ChatAdapter',
      'legacy backend',
      'workflow context',
      'attachments',
      'upload',
    ],
    audience: 'app',
  },
  {
    slug: 'blocks',
    title: 'Blocks',
    summary:
      'The built-in blocks an answer is made of — text, thinking, tool calls, tables, sources, approvals, choices, errors, files, images, plans and charts — and how a block finds its renderer.',
    keywords: [
      'block',
      'text',
      'markdown',
      'thinking',
      'reasoning',
      'tool call',
      'table',
      'sources',
      'citations',
      'approval',
      'choice',
      'artifact',
      'image',
      'plan',
      'chart',
      'charts',
      'recharts',
    ],
    audience: 'app',
  },
  {
    slug: 'custom-blocks',
    title: 'Custom blocks',
    summary:
      'Register your own card with `defineBlock`, build it from the kit so it looks native, stream into it, and route its clicks into your app.',
    keywords: [
      'defineBlock',
      'custom card',
      'card',
      'BlockShell',
      'KeyValueList',
      'kit',
      'onAction',
      'actions.emit',
      'applyDelta',
    ],
    audience: 'app',
  },
  {
    slug: 'customizing',
    title: 'Customizing the UI',
    summary:
      'Replace parts of `<AgenticChat>` through slots, lay it out yourself, how the empty chat and its suggested prompts behave, add controls to the composer with `ComposerPicker`, and change any string.',
    keywords: [
      'slots',
      'components',
      'Welcome',
      'welcome screen',
      'empty chat',
      'greeting',
      'suggested prompts',
      'remove suggestion',
      'composer',
      'ComposerPicker',
      'model picker',
      'tools picker',
      'labels',
      'copy',
      'translation',
      'layout',
      'theming',
    ],
    audience: 'app',
  },
  {
    slug: 'persistence',
    title: 'History and persistence',
    summary:
      'The history panel, and what the chat remembers on the device: where it is stored, what is kept, and clearing it on logout.',
    keywords: [
      'history',
      'conversations',
      'chat history',
      'useConversations',
      'persistence',
      'localStorage',
      'sessionStorage',
      'StorageAdapter',
      'logout',
      'drafts',
    ],
    audience: 'app',
  },
  {
    slug: 'hitl',
    title: 'Human-in-the-loop',
    summary:
      'Approval and choice cards that pause a turn until someone decides, and how to write a decision card of your own.',
    keywords: [
      'hitl',
      'human in the loop',
      'approval',
      'approval card',
      'checkpoint',
      'useHitl',
      'decision',
      'pause',
      'resume',
    ],
    audience: 'app',
  },
  {
    slug: 'headless',
    title: 'Headless',
    summary:
      'The engine and its React bindings with no styling — provider, primitives, hooks and parsers — for a layout the styled components cannot express.',
    keywords: [
      'headless',
      'primitives',
      'hooks',
      'ChatProvider',
      'Thread',
      'Composer',
      'Message',
      'useThread',
      'useComposer',
      'useMessages',
      'custom chat',
    ],
    audience: 'app',
  },
  {
    slug: 'mock',
    title: 'Mock backend',
    summary:
      'An in-memory backend on the standard, for building UI before the API exists, for tests and for demos.',
    keywords: [
      'mock',
      'createMockAdapter',
      'scenarios',
      'fake backend',
      'demo',
      'testing',
      'tests',
      'vitest',
    ],
    audience: 'app',
  },
  {
    slug: 'troubleshooting',
    title: 'Troubleshooting',
    summary:
      'Symptoms and their fixes: a chat with no height, the wrong theme, unsupported content, cards that do nothing, a 401 loop, missing controls.',
    keywords: [
      'troubleshooting',
      'not working',
      'error',
      'problem',
      'fix',
      'unsupported content',
      'interrupted',
      '401',
    ],
    audience: 'app',
  },
  {
    slug: 'backend-contract',
    title: 'Backend contract',
    summary:
      'For backend teams: the endpoints, the auth and identity rules, the config, the event stream, errors, cancel and retries the chat expects.',
    keywords: [
      'backend',
      'api',
      'endpoints',
      'rest',
      'sse',
      'stream',
      'events',
      'error codes',
      'error envelope',
      'config',
      'suggestion icons',
      'capabilities',
      'cancel',
      'chat standard',
      'schema',
      'protocol',
    ],
    audience: 'backend',
  },
  {
    slug: 'block-contracts',
    title: 'Block contracts',
    summary:
      'The payload of every built-in block type with the aliases the parsers accept, and the rules for a product’s own blocks.',
    keywords: [
      'block payload',
      'json',
      'payload',
      'tool_use',
      'tool_result',
      'checkpoint',
      'fallback_text',
      'product blocks',
    ],
    audience: 'backend',
  },
  {
    slug: 'conformance',
    title: 'Checking a backend',
    summary:
      'A check that calls a backend the way the chat will and reports every gap against the standard. Run it in CI against dev or staging.',
    keywords: ['conformance', 'conformance check', 'validate backend', 'test backend', 'ci'],
    audience: 'backend',
  },
  {
    slug: 'schema-gaps',
    title: 'Schema gaps',
    summary:
      'What revision 1.2 of the chat standard settled, what is still open, and what the chat does about each open point today.',
    keywords: ['schema gaps', 'open questions', 'revision', 'protocol version', 'standard'],
    audience: 'backend',
  },
];

/**
 * Words for the chat itself — not for any one part of it. `get_component`
 * answers these with a pointer to `get_chat` instead of "not found".
 * Deliberately narrow: "table" or "chart" asked of `get_component` is a
 * dashboard question, and sending it to the chat would be wrong.
 */
export const CHAT_ALIASES: readonly string[] = [
  'chat',
  'agentic chat',
  'chat ui',
  'chat panel',
  'chat window',
  'chatbot',
  'assistant',
  'ai assistant',
  'copilot',
  'ask neo',
];
