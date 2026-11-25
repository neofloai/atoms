import Paper from '@mui/material/Paper';

import { ChatDemo } from './_components/ChatDemo';
import { ChatTopicPage } from './_components/ChatTopicPage';
import { topics } from './_components/topics';

const overview = topics[0];

export const metadata = {
  title: 'Agentic chat — Atoms',
  description: overview.summary.replace(/`/g, ''),
};

/** Tall enough for a streamed answer with a table under the greeting. */
const DEMO_HEIGHT_PX = 680;

/**
 * The chat section's index: the overview topic, opened by the chat itself
 * running on the mock backend — the fastest answer to "what does this do"
 * is to ask it something.
 */
export default function ChatOverviewPage() {
  return (
    <ChatTopicPage
      topic={overview}
      liveFirst
      liveTitle="Try it"
      liveDescription="The whole chat on the mock backend from @neofloai/atoms/chat/mock — history, streaming, tool calls, approvals, charts and errors, with sample data. Switch the docs to dark mode and it follows."
      live={
        <Paper variant="outlined" data-pagefind-ignore sx={{ height: DEMO_HEIGHT_PX, borderRadius: 2, overflow: 'hidden' }}>
          <ChatDemo />
        </Paper>
      }
    />
  );
}
