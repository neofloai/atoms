import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { ChatTopicPage } from './_components/ChatTopicPage';
import { topics } from './_components/topics';

const overview = topics[0];

export const metadata = {
  title: 'Agentic chat — Atoms',
  description: overview.summary.replace(/`/g, ''),
};

/** Where the chat runs full screen, outside the docs shell. */
const PLAYGROUND_HREF = '/chat/playground';

/**
 * The chat section's index: the overview topic, opened by the way to the
 * chat itself. It runs on a page of its own, the playground, where it has
 * the whole screen and the settings that change it.
 */
export default function ChatOverviewPage() {
  return (
    <ChatTopicPage
      topic={overview}
      liveFirst
      liveTitle="Try it"
      live={
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
            <Typography variant="body2" color="text.secondary">
              The whole chat on the mock backend from <code>@neofloai/atoms/chat/mock</code>: history, streaming, tool
              calls, approvals, charts and errors, with sample data. The playground gives it the full screen. Switch its
              layout, the row under each answer, the + menu and how fast it replies, and copy the code for what you see.
            </Typography>
            <Button href={PLAYGROUND_HREF} variant="contained">
              Open the playground
            </Button>
          </Stack>
        </Paper>
      }
    />
  );
}
