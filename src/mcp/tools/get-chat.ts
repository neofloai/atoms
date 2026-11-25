import { z } from 'zod';

import { compareVersionStrings } from '@/src/release/version';
import { loadChat, loadRelease } from '../data-loader';
import { compact, scoreMatch, STRONG_MATCH } from '../lookup';
import { gateVersion, installedVersionSchema } from '../version-gate';

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ChatManifest, ChatTopicData, ReleaseManifest } from '../types';
import type { VersionGate } from '../version-gate';

/**
 * The first release with `@neofloai/atoms/chat` in it.
 *
 * The version gate alone is not enough here. It passes a project that is
 * merely `behind` — its code still runs there — and for a component that
 * is true. For the chat it is not: on anything older than this the whole
 * subpath is missing, so every snippet fails at its first import.
 */
export const CHAT_SINCE = '4.3.0';

/** Languages whose fences are Atoms code an agent would paste. */
const PASTEABLE = /```(?:tsx|ts|jsx|js|typescript|javascript)\n[\s\S]*?```/g;

/**
 * Finds the topic a caller asked for: by slug or title in any case or
 * spacing ("custom blocks", "Custom-Blocks"), then by the words a topic
 * carries ("approval" is `hitl`, "localStorage" is `persistence`).
 */
function resolveTopic(
  requested: string | undefined,
  topics: readonly ChatTopicData[]
): ChatTopicData | undefined {
  if (!requested?.trim()) return topics[0];
  const wanted = compact(requested);
  const direct = topics.find(
    (topic) => compact(topic.slug) === wanted || compact(topic.title) === wanted
  );
  if (direct) return direct;

  let best: { topic: ChatTopicData; score: number } | undefined;
  for (const topic of topics) {
    const score = scoreMatch(requested, {
      name: topic.title,
      keywords: [topic.slug, ...topic.keywords],
      summary: topic.summary,
    });
    if (score > (best?.score ?? 0)) best = { topic, score };
  }
  return best && best.score >= STRONG_MATCH ? best.topic : undefined;
}

/**
 * Turns the guide's site links into the call that fetches them. The docs
 * render `/chat/hitl` as a link; an agent reading this response has no
 * site, it has this tool.
 */
function rewriteLinks(body: string): string {
  return body
    .replace(/\[([^\]]+)\]\(\/chat\/([a-z-]+)(#[^)]*)?\)/g, (_m, text: string, slug: string) => `${text} (\`get_chat\` topic \`${slug}\`)`)
    .replace(/\[([^\]]+)\]\(\/chat\/?\)/g, (_m, text: string) => `${text} (\`get_chat\` topic \`overview\`)`);
}

/**
 * Whether this response may carry code, and what to say instead when not.
 *
 * Backend topics are always served whole: their blocks are JSON payloads,
 * SSE frames and shell commands — the wire format, which no Atoms version
 * changes. App topics go through the shared gate, then through the one
 * check the shared gate cannot make (see `CHAT_SINCE`).
 */
function chatGate(
  topic: ChatTopicData,
  gate: VersionGate,
  release: ReleaseManifest
): { blocked: boolean; notice: string } {
  if (topic.audience === 'backend') return { blocked: false, notice: '' };
  if (gate.blocked) return { blocked: true, notice: gate.notice };

  const installed = gate.check.resolved;
  if (installed && (compareVersionStrings(installed, CHAT_SINCE) ?? 0) < 0) {
    return {
      blocked: true,
      notice: [
        `## Withheld: Atoms ${installed} has no chat`,
        '',
        `\`@neofloai/atoms/chat\` first shipped in ${CHAT_SINCE}. On ${installed} the subpath does not exist, so every import below would fail before anything renders. The guidance is all here; the code is held back.`,
        '',
        'Tell the user the chat needs a newer Atoms, show them the upgrade, and wait for them to take it:',
        '',
        '```bash',
        release.commands.upgrade,
        '```',
        '',
        `Then call \`get_chat\` again with the new \`installedVersion\`. Do not rebuild the chat from \`Card\`, \`TextField\` and \`Typography\` to avoid the upgrade.`,
      ].join('\n'),
    };
  }
  return { blocked: false, notice: gate.notice };
}

function topicIndex(chat: ChatManifest, current: ChatTopicData): string {
  const line = (topic: ChatTopicData) =>
    `- \`${topic.slug}\`${topic.slug === current.slug ? ' (this one)' : ''} — ${topic.summary}`;
  return [
    '## Topics',
    '',
    '**Building with the chat**',
    '',
    ...chat.topics.filter((topic) => topic.audience === 'app').map(line),
    '',
    '**For the backend team**',
    '',
    ...chat.topics.filter((topic) => topic.audience === 'backend').map(line),
  ].join('\n');
}

/**
 * Registers the `get_chat` tool: the guide to `@neofloai/atoms/chat`, one
 * topic per call, from the same Markdown the docs site renders.
 */
export function registerGetChat(server: McpServer): void {
  server.registerTool(
    'get_chat',
    {
      title: 'Get chat guide',
      description:
        'Returns the guide to the Atoms agentic chat, `@neofloai/atoms/chat`: `<AgenticChat>`, a complete chat with streaming answers, history, human-in-the-loop approvals, tool activity, tables, charts and custom cards, against any backend on the Neoflo chat standard. Call it whenever the user wants a chat, an AI assistant, a copilot or an "Ask Neo" panel — never compose one from Card, TextField and Typography. With no `topic` it returns the overview (install, the quick start, the entry points, how it talks to the backend) and the list of topics. Pass a topic for one part: configuration, blocks, custom-blocks, customizing, persistence, hitl, headless, mock, troubleshooting; or, for the team building the backend, backend-contract, block-contracts, conformance, schema-gaps. Returns markdown. Pass `installedVersion`: the chat first ships in @neofloai/atoms 4.3.0, and code examples are withheld until the installed version is known to have it.',
      inputSchema: {
        topic: z
          .string()
          .optional()
          .describe(
            'A topic slug ("hitl", "custom-blocks", "backend-contract") or the words for it ("approval card", "chat history", "mock backend"). Omit for the overview.'
          ),
        installedVersion: installedVersionSchema,
      },
    },
    async ({ topic: requested, installedVersion }) => {
      const [chat, gate, release] = await Promise.all([
        loadChat(),
        gateVersion(installedVersion),
        loadRelease(),
      ]);
      const topic = resolveTopic(requested, chat.topics);

      if (!topic) {
        return {
          content: [
            {
              type: 'text',
              text: [
                `No chat topic matches "${requested}".`,
                '',
                topicIndex(chat, chat.topics[0]),
                '',
                '`search_docs` takes the user\'s own words if none of these is it.',
              ].join('\n'),
            },
          ],
        };
      }

      const verdict = chatGate(topic, gate, release);
      const body = rewriteLinks(
        verdict.blocked
          ? topic.body.replace(PASTEABLE, '_Code withheld — see the notice above._')
          : topic.body
      );

      // The overview is the first call for most agents, so it carries the
      // one fact every later answer depends on: where the chat imports
      // from. The rest of the topics assume it.
      const lead =
        topic.slug === chat.topics[0].slug
          ? [
              `The chat is a module of Atoms rather than a component: import it from \`${chat.entries[0]}\` (the UI and the engine under it), with ${chat.entries
                .slice(1)
                .map((entry) => `\`${entry}\``)
                .join(', ')} for the server-safe engine, the chart blocks and the mock backend. \`get_component\` does not cover its parts; this tool does.`,
            ]
          : [];

      const sections = [
        `# Chat: ${topic.title}`,
        topic.summary,
        ...lead,
        ...(verdict.notice ? [verdict.notice] : []),
        body,
        topicIndex(chat, topic),
      ];

      return { content: [{ type: 'text', text: sections.join('\n\n') }] };
    }
  );
}
