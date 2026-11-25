import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import NextLink from '@/app/_lib/Link';
import { GuideMarkdown } from './GuideMarkdown';
import { neighbours, topicHref, type ChatTopic } from './topics';

/** Who a page is for, said under its title so a backend reader knows they are in the right place. */
const AUDIENCE: Record<ChatTopic['audience'], string> = {
  app: 'Chat',
  backend: 'Chat · for backend teams',
};

/** Inline code in a summary, which the header renders as plain text. */
function withCode(text: string): React.ReactNode[] {
  return text.split(/(`[^`]+`)/g).map((part, index) =>
    part.startsWith('`') ? <code key={index}>{part.slice(1, -1)}</code> : part
  );
}

export interface ChatTopicPageProps {
  topic: ChatTopic;
  /**
   * Live UI shown with the guide — the demo on the overview, the gallery
   * on the blocks page. Rendered under its own heading, `liveTitle`.
   */
  live?: React.ReactNode;
  liveTitle?: string;
  liveDescription?: string;
  /** Show the live part above the guide rather than after it. */
  liveFirst?: boolean;
}

/**
 * One chat guide topic as a docs page: the header every docs page has,
 * the topic's Markdown, optional live UI, and the way on.
 */
export function ChatTopicPage({ topic, live, liveTitle, liveDescription, liveFirst }: ChatTopicPageProps) {
  const { previous, next } = neighbours(topic.slug);

  const liveSection = live ? (
    <Stack spacing={2}>
      {liveTitle && (
        <Stack spacing={0.5}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
            {liveTitle}
          </Typography>
          {liveDescription && (
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 760 }}>
              {withCode(liveDescription)}
            </Typography>
          )}
        </Stack>
      )}
      {live}
    </Stack>
  ) : null;

  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            {AUDIENCE[topic.audience]}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            {topic.slug === 'overview' ? 'Agentic chat' : topic.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760 }}>
            {withCode(topic.summary)}
          </Typography>
        </Stack>

        <Divider />

        {liveFirst && liveSection}

        <GuideMarkdown>{topic.body}</GuideMarkdown>

        {!liveFirst && liveSection}

        <Divider />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          {previous ? (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, flex: 1, maxWidth: 360 }}>
              <Typography variant="caption" color="text.secondary">
                Previous
              </Typography>
              <Link component={NextLink} href={topicHref(previous.slug)} sx={{ display: 'block', fontWeight: 600 }}>
                {previous.title}
              </Link>
            </Paper>
          ) : (
            <span />
          )}
          {next && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, flex: 1, maxWidth: 360, textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary">
                Next
              </Typography>
              <Link component={NextLink} href={topicHref(next.slug)} sx={{ display: 'block', fontWeight: 600 }}>
                {next.title}
              </Link>
            </Paper>
          )}
        </Box>
      </Stack>
    </Container>
  );
}
