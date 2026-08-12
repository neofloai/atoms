'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
} from '@/src/components/Accordion';
import { Button } from '@/src/components/Button';
import { Chip } from '@/src/components/Chip';
import { PaperclipIcon } from '@/src/icons';

const BODY =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.';

const FAQS = [
  { id: 'shipping', title: 'Accordion 1' },
  { id: 'returns', title: 'Accordion 2' },
  { id: 'sizing', title: 'Accordion 3' },
  { id: 'care', title: 'Accordion 4' },
  { id: 'contact', title: 'Accordion 5' },
] as const;

function PreviewCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        {children}
      </Paper>
    </Stack>
  );
}

PreviewCard.displayName = 'PreviewCard';

/**
 * The design's 291px column, so every sample here measures against the
 * Figma frame rather than against the docs page width.
 */
function Frame({ children }: { children: React.ReactNode }) {
  return <Box sx={{ maxWidth: 291 }}>{children}</Box>;
}

Frame.displayName = 'Frame';

/** One labelled cell, so a row of samples reads without a legend. */
function Sample({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={1} sx={{ flex: 1, minWidth: 240 }}>
      {children}
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}

Sample.displayName = 'Sample';

/** The `stack` variant, controlled so only one row is open at a time. */
function OneAtATime() {
  const [open, setOpen] = React.useState<string | false>('returns');

  return (
    <Frame>
      {FAQS.map((faq) => (
        <Accordion
          key={faq.id}
          expanded={open === faq.id}
          onChange={(_, isExpanded) => setOpen(isExpanded ? faq.id : false)}
        >
          <AccordionSummary
            id={`${faq.id}-header`}
            aria-controls={`${faq.id}-panel`}
          >
            {faq.title}
          </AccordionSummary>
          <AccordionDetails>{BODY}</AccordionDetails>
        </Accordion>
      ))}
    </Frame>
  );
}

OneAtATime.displayName = 'OneAtATime';

export function AccordionShowcase() {
  return (
    <Stack spacing={5}>
      <PreviewCard
        title="The two states"
        description="Closed and open, exactly as the component set draws them: 16px padding all round, 8px between the title and the body, a 16px caret that rotates, and one hairline along the bottom edge."
      >
        <Stack direction="row" spacing={4} sx={{ flexWrap: 'wrap' }}>
          <Sample label="closed — 53px tall">
            <Frame>
              <Accordion>
                <AccordionSummary>Accordion 1</AccordionSummary>
                <AccordionDetails>{BODY}</AccordionDetails>
              </Accordion>
            </Frame>
          </Sample>
          <Sample label="open — 121px tall">
            <Frame>
              <Accordion defaultExpanded>
                <AccordionSummary>Accordion 1</AccordionSummary>
                <AccordionDetails>{BODY}</AccordionDetails>
              </Accordion>
            </Frame>
          </Sample>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="With an action row"
        description="The open-button variant. `AccordionActions` puts the buttons at the trailing edge, 16px under the body — the gap comes from the body's own bottom padding rather than from a rule about siblings."
      >
        <Frame>
          <Accordion defaultExpanded>
            <AccordionSummary>Accordion 1</AccordionSummary>
            <AccordionDetails>{BODY}</AccordionDetails>
            <AccordionActions>
              <Button variant="secondary" size="sm">
                Action
              </Button>
              <Button size="sm">Action</Button>
            </AccordionActions>
          </Accordion>
        </Frame>
      </PreviewCard>

      <PreviewCard
        title="A stack, one open at a time"
        description="Five items as plain siblings — no group component, because the design's stack has no gap and no shared chrome. This one is controlled from a single piece of state, so opening a row closes the last."
      >
        <OneAtATime />
      </PreviewCard>

      <PreviewCard
        title="Independent rows"
        description="The same five items uncontrolled. Each keeps its own state, so any number can be open at once — including none."
      >
        <Frame>
          {FAQS.slice(0, 3).map((faq) => (
            <Accordion key={faq.id}>
              <AccordionSummary>{faq.title}</AccordionSummary>
              <AccordionDetails>{BODY}</AccordionDetails>
            </Accordion>
          ))}
        </Frame>
      </PreviewCard>

      <PreviewCard
        title="What else can ride in the row"
        description="The summary is a flex row, so a count, a status, or a leading glyph composes into it. Nothing interactive, though — the row is already one button."
      >
        <Stack direction="row" spacing={4} sx={{ flexWrap: 'wrap' }}>
          <Sample label="a trailing count">
            <Frame>
              <Accordion>
                <AccordionSummary>
                  <Box component="span" sx={{ flex: 1 }}>
                    Attachments
                  </Box>
                  <Chip size="sm" variant="secondary" label="3" />
                </AccordionSummary>
                <AccordionDetails>
                  brief.pdf, wireframes.fig, notes.txt
                </AccordionDetails>
              </Accordion>
            </Frame>
          </Sample>
          <Sample label="a leading glyph, and no caret">
            <Frame>
              <Accordion>
                <AccordionSummary expandIcon={null}>
                  <PaperclipIcon size={16} style={{ marginRight: 8 }} />
                  Attachments
                </AccordionSummary>
                <AccordionDetails>
                  brief.pdf, wireframes.fig, notes.txt
                </AccordionDetails>
              </Accordion>
            </Frame>
          </Sample>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Long titles, and disabled rows"
        description="A title wraps inside the row rather than pushing the caret out of it. A disabled row stays visible and leaves the tab order — it renders a real disabled button, so it can never be focused and then found unresponsive."
      >
        <Stack direction="row" spacing={4} sx={{ flexWrap: 'wrap' }}>
          <Sample label="a title that wraps">
            <Frame>
              <Accordion>
                <AccordionSummary>
                  A summary long enough that it has to wrap onto a second
                  line inside the row
                </AccordionSummary>
                <AccordionDetails>{BODY}</AccordionDetails>
              </Accordion>
            </Frame>
          </Sample>
          <Sample label="disabled, closed and open">
            <Frame>
              <Accordion disabled>
                <AccordionSummary>Accordion 1</AccordionSummary>
                <AccordionDetails>{BODY}</AccordionDetails>
              </Accordion>
              <Accordion disabled defaultExpanded>
                <AccordionSummary>Accordion 2</AccordionSummary>
                <AccordionDetails>{BODY}</AccordionDetails>
              </Accordion>
            </Frame>
          </Sample>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Ending a group without a rule"
        description="Every item carries its hairline, including the last — faithful to the sheet, and right for a list that continues. One `sx` rule drops it where a group ends instead."
      >
        <Stack direction="row" spacing={4} sx={{ flexWrap: 'wrap' }}>
          <Sample label="as specced — three rules">
            <Frame>
              {FAQS.slice(0, 3).map((faq) => (
                <Accordion key={faq.id}>
                  <AccordionSummary>{faq.title}</AccordionSummary>
                  <AccordionDetails>{BODY}</AccordionDetails>
                </Accordion>
              ))}
            </Frame>
          </Sample>
          <Sample label="last rule dropped — two">
            <Frame>
              <Box
                sx={{
                  '& .MuiAccordion-root:last-of-type': {
                    borderBottom: 'none',
                  },
                }}
              >
                {FAQS.slice(0, 3).map((faq) => (
                  <Accordion key={faq.id}>
                    <AccordionSummary>{faq.title}</AccordionSummary>
                    <AccordionDetails>{BODY}</AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            </Frame>
          </Sample>
        </Stack>
      </PreviewCard>
    </Stack>
  );
}

AccordionShowcase.displayName = 'AccordionShowcase';
