import { notFound } from 'next/navigation';

import { ChatGallery, type GallerySection } from '../_components/ChatGallery';
import { ChatTopicPage } from '../_components/ChatTopicPage';
import { topicBySlug, topics } from '../_components/topics';

/**
 * Every chat topic but the overview, which is `/chat` itself. One route
 * rather than a file per topic because a topic is Markdown with no layout
 * of its own — the guide in `src/chat/guide/` decides what a page says.
 */
export function generateStaticParams() {
  return topics.slice(1).map((topic) => ({ topic: topic.slug }));
}

/** A slug that is not a topic is a 404, not a render attempt. */
export const dynamicParams = false;

interface Params {
  params: Promise<{ topic: string }>;
}

export async function generateMetadata({ params }: Params) {
  const topic = topicBySlug((await params).topic);
  return topic
    ? { title: `${topic.title} — Chat — Atoms`, description: topic.summary.replace(/`/g, '') }
    : {};
}

/** Topics that show their parts live under the guide text. */
const GALLERIES: Partial<Record<string, { section: GallerySection; title: string; description: string }>> = {
  blocks: {
    section: 'blocks',
    title: 'Every block, live',
    description:
      'Rendered from fixtures through the same registry an answer uses: each built-in block streaming, waiting, decided and failed.',
  },
  customizing: {
    section: 'shell',
    title: 'The shell parts, live',
    description:
      'The parts `<AgenticChat>` is composed of, each usable on its own inside a `ChatProvider`: the composer at rest, with attachments and with your own pickers, the turn, the run status and the welcome screen.',
  },
  persistence: {
    section: 'history',
    title: 'The history panel, live',
    description: 'Search, date groups, and rename, archive and delete from each row’s menu.',
  },
};

export default async function ChatTopicRoute({ params }: Params) {
  const topic = topicBySlug((await params).topic);
  if (!topic || topic.slug === topics[0].slug) notFound();

  const gallery = GALLERIES[topic.slug];
  return (
    <ChatTopicPage
      topic={topic}
      live={gallery ? <ChatGallery section={gallery.section} /> : undefined}
      liveTitle={gallery?.title}
      liveDescription={gallery?.description}
    />
  );
}
