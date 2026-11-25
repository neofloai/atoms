import chat from '@/data/chat.json';

import type { ChatTopicMeta } from '@/src/chat/guide';

/**
 * The chat guide as the docs render it: read from `data/chat.json`, the
 * same file the MCP `get_chat` tool serves, so a page and a tool answer
 * cannot disagree. `npm run generate` writes it from `src/chat/guide/`.
 */
export interface ChatTopic extends ChatTopicMeta {
  readonly body: string;
}

export const topics = chat.topics as readonly ChatTopic[];

/** The page a topic lives on — the overview is the section's index. */
export function topicHref(slug: string): string {
  return slug === topics[0]?.slug ? '/chat' : `/chat/${slug}`;
}

export function topicBySlug(slug: string): ChatTopic | undefined {
  return topics.find((topic) => topic.slug === slug);
}

/** The topics either side of this one, in sidebar order. */
export function neighbours(slug: string): { previous?: ChatTopic; next?: ChatTopic } {
  const index = topics.findIndex((topic) => topic.slug === slug);
  return { previous: topics[index - 1], next: topics[index + 1] };
}
