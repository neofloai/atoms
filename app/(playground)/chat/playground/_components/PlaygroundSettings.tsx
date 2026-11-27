'use client';

import * as React from 'react';

import { CodeBlock } from '@/app/(docs)/_components/CodeBlock';
import type { ChatDemoSettings } from '@/app/(docs)/chat/_components/ChatDemo';
import { Box } from '@/src/components/Box';
import { Button } from '@/src/components/Button';
import { Divider } from '@/src/components/Divider';
import { IconButton } from '@/src/components/IconButton';
import { Stack } from '@/src/components/Stack';
import { Switch } from '@/src/components/Switch';
import { ToggleButton, ToggleButtonGroup } from '@/src/components/ToggleButton';
import { Typography } from '@/src/components/Typography';
import { ThumbsDownIcon, ThumbsUpIcon, XIcon } from '@/src/icons';

/** How fast the mock streams its answers: the delay between words. */
export const REPLY_SPEEDS = {
  instant: { label: 'Instant', ms: 0 },
  fast: { label: 'Fast', ms: 10 },
  normal: { label: 'Normal', ms: 28 },
  slow: { label: 'Slow', ms: 60 },
} as const;

export type ReplySpeed = keyof typeof REPLY_SPEEDS;

/** The `<AgenticChat>` for the settings on screen, as an app would write it. */
export function codeFor(s: ChatDemoSettings): string {
  const lines = ['<AgenticChat', '  adapter={adapter}', '  blocks={[chartBlock]}', '  scope={{ groups: workflows }}'];
  if (s.navigation === 'rail') lines.push('  navigation="rail"');
  if (!s.history) lines.push('  history={false}');
  if (!s.turnActions) lines.push('  turnActions={false}');
  else if (s.feedback) lines.push('  turnActions={{ onFeedback: sendFeedback }}');
  if (s.attachments) lines.push('  attachments={{ upload: uploadFile }}');
  const composer: string[] = [];
  if (!s.menu) composer.push('menu: false');
  if (s.footer) composer.push("footer: 'Neo can make mistakes. Check important numbers.'");
  if (composer.length) lines.push(`  composerProps={{ ${composer.join(', ')} }}`);
  lines.push('  onTitleChange={(title) => setAppBarTitle(title)}', '/>');
  return lines.join('\n');
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Stack spacing={1.5} component="section" aria-label={title}>
      <Typography variant="body2" weight="medium" color="text.secondary">
        {title}
      </Typography>
      {children}
    </Stack>
  );
}

/** A label with its control at the row's end. */
function Row({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
      <Typography variant="body1" component="div">
        {label}
      </Typography>
      {children}
    </Stack>
  );
}

export interface PlaygroundSettingsProps {
  settings: ChatDemoSettings;
  onChange: (patch: Partial<ChatDemoSettings>) => void;
  speed: ReplySpeed;
  onSpeedChange: (speed: ReplySpeed) => void;
  onClearConversations: () => void;
  /** Shown as × when the panel floats over the chat. */
  onClose?: () => void;
}

/** The settings panel: what the chat shows, how the mock replies, and the code for it. */
export function PlaygroundSettings({
  settings,
  onChange,
  speed,
  onSpeedChange,
  onClearConversations,
  onClose,
}: PlaygroundSettingsProps) {
  const toggle = (key: keyof ChatDemoSettings, label: string) => (
    <Switch
      checked={settings[key] as boolean}
      onChange={(_, checked) => onChange({ [key]: checked })}
      aria-label={label}
    />
  );

  return (
    <Stack sx={{ height: '100%', overflowY: 'auto' }}>
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', px: 2, minHeight: 48 }}
      >
        <Typography variant="body0" weight="medium" component="h2">
          Settings
        </Typography>
        {onClose ? (
          <IconButton variant="secondary" appearance="text" size="sm" aria-label="Close settings" onClick={onClose}>
            <XIcon />
          </IconButton>
        ) : null}
      </Stack>
      <Divider />
      <Stack spacing={3} sx={{ p: 2 }}>
        <Section title="Layout">
          <Row label="Navigation">
            <ToggleButtonGroup
              appearance="segmented"
              exclusive
              value={settings.navigation}
              onChange={(_, next: ChatDemoSettings['navigation'] | null) => next && onChange({ navigation: next })}
              aria-label="Navigation"
            >
              <ToggleButton value="header">Header</ToggleButton>
              <ToggleButton value="rail">Rail</ToggleButton>
            </ToggleButtonGroup>
          </Row>
          <Row label="History">{toggle('history', 'History')}</Row>
        </Section>

        <Section title="Under each answer">
          <Row label="Actions row">{toggle('turnActions', 'Actions row')}</Row>
          {settings.turnActions ? (
            <Row
              label={
                // The glyphs the chat draws on the buttons themselves, so the row names what it shows.
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <ThumbsUpIcon size={16} aria-hidden />
                  <ThumbsDownIcon size={16} aria-hidden />
                  <span>Feedback</span>
                </Stack>
              }
            >
              {toggle('feedback', 'Feedback')}
            </Row>
          ) : null}
        </Section>

        <Section title="Composer">
          <Row label="+ menu">{toggle('menu', '+ menu')}</Row>
          <Row label="Attachments">{toggle('attachments', 'Attachments')}</Row>
          <Row label="Line under it">{toggle('footer', 'Line under it')}</Row>
        </Section>

        <Section title="Mock backend">
          {/* Four options don't fit beside a label at this width: the group gets its own line. */}
          <Stack spacing={1}>
            <Typography variant="body1">Reply speed</Typography>
            <ToggleButtonGroup
              appearance="segmented"
              exclusive
              value={speed}
              onChange={(_, next: ReplySpeed | null) => next && onSpeedChange(next)}
              aria-label="Reply speed"
            >
              {(Object.keys(REPLY_SPEEDS) as ReplySpeed[]).map((key) => (
                <ToggleButton key={key} value={key}>
                  {REPLY_SPEEDS[key].label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>
          <Box>
            <Button variant="secondary" appearance="outline" size="sm" onClick={onClearConversations}>
              Clear conversations
            </Button>
          </Box>
        </Section>

        <Section title="Code">
          <CodeBlock>{codeFor(settings)}</CodeBlock>
        </Section>
      </Stack>
    </Stack>
  );
}
