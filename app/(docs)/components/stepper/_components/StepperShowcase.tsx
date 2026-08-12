'use client';

import * as React from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Button } from '@/src/components/Button';
import {
  Step,
  StepCollapse,
  StepContent,
  StepLabel,
  Stepper,
} from '@/src/components/Stepper';

/** The copy Figma uses in every cell, so the previews read as the sheet does. */
const BLURB =
  'For each ad campaign that you create, control how much you are willing to spend.';

const WIZARD_STEPS = [
  { label: 'Campaign settings', detail: BLURB },
  { label: 'Ad group', detail: 'Choose who sees the ads in this campaign.' },
  { label: 'Review', detail: 'Check the budget and publish.' },
] as const;

const HIDDEN_EVENTS = [
  'Budget raised to 240 a day',
  'Creative swapped',
  'Audience narrowed to South Asia',
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
 * Figma's own sample composition (node 3663:40755): two done steps with
 * content, a collapse row, then a not-done header and the last step.
 *
 * Held at 266px, the width the component set is drawn at, so the
 * description wraps where the sheet wraps it.
 */
function CampaignTimeline() {
  const [open, setOpen] = React.useState(false);

  return (
    <Stepper activeStep={-1} sx={{ maxWidth: 266 }}>
      <Step expanded completed>
        <StepLabel>Stepper Header</StepLabel>
        <StepContent>
          <Stack spacing={2}>
            <span>{BLURB}</span>
            <Stack direction="row" spacing={1}>
              <Button size="sm">Action</Button>
              <Button size="sm" variant="secondary">
                Action
              </Button>
            </Stack>
          </Stack>
        </StepContent>
      </Step>

      <Step expanded completed>
        <StepLabel>Stepper Header</StepLabel>
        <StepContent>{BLURB}</StepContent>
      </Step>

      <Step>
        <StepCollapse
          expanded={open}
          count={HIDDEN_EVENTS.length}
          onChange={(_unused, next) => setOpen(next)}
        />
      </Step>

      {open &&
        HIDDEN_EVENTS.map((event) => (
          <Step key={event} expanded completed>
            <StepLabel>{event}</StepLabel>
          </Step>
        ))}

      <Step>
        <StepLabel>Stepper Header</StepLabel>
      </Step>

      <Step expanded>
        <StepLabel>Last Step</StepLabel>
        <StepContent>Some description step here</StepContent>
      </Step>
    </Stepper>
  );
}

CampaignTimeline.displayName = 'CampaignTimeline';

/** MUI's own shape: one description at a time, driven by `activeStep`. */
function CampaignWizard() {
  const [step, setStep] = React.useState(0);
  const isLast = step === WIZARD_STEPS.length - 1;

  return (
    <Stepper activeStep={step} sx={{ maxWidth: 360 }}>
      {WIZARD_STEPS.map((wizardStep, index) => (
        <Step key={wizardStep.label}>
          <StepLabel>{wizardStep.label}</StepLabel>
          <StepContent>
            <Stack spacing={2}>
              <span>{wizardStep.detail}</span>
              <Stack direction="row" spacing={1}>
                <Button
                  size="sm"
                  onClick={() => setStep(isLast ? 0 : index + 1)}
                >
                  {isLast ? 'Start over' : 'Continue'}
                </Button>
                {index > 0 && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setStep(index - 1)}
                  >
                    Back
                  </Button>
                )}
              </Stack>
            </Stack>
          </StepContent>
        </Step>
      ))}
    </Stepper>
  );
}

CampaignWizard.displayName = 'CampaignWizard';

/**
 * The `done` / `not-done` axis on the three content cells, side by side the
 * way the component set draws them. Nothing moves but the dot and the line.
 */
function StateGrid() {
  const columns = [
    { caption: 'done', done: true },
    { caption: 'not-done', done: false },
  ] as const;

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4}>
      {columns.map((column) => (
        <Stack key={column.caption} spacing={1} sx={{ flex: 1, minWidth: 0 }}>
          <Stepper activeStep={-1} sx={{ maxWidth: 266 }}>
            <Step expanded completed={column.done}>
              <StepLabel>Stepper Header</StepLabel>
              <StepContent>
                <Stack spacing={2}>
                  <span>{BLURB}</span>
                  <Stack direction="row" spacing={1}>
                    <Button size="sm">Action</Button>
                    <Button size="sm" variant="secondary">
                      Action
                    </Button>
                  </Stack>
                </Stack>
              </StepContent>
            </Step>
            <Step expanded completed={column.done}>
              <StepLabel>Stepper Header</StepLabel>
              <StepContent>{BLURB}</StepContent>
            </Step>
            <Step completed={column.done}>
              <StepLabel>Stepper Header</StepLabel>
            </Step>
            <Step expanded completed={column.done}>
              <StepLabel>Last Step</StepLabel>
              <StepContent>Some description step here</StepContent>
            </Step>
          </Stepper>
          <Typography variant="caption" color="text.secondary">
            {column.caption}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}

StateGrid.displayName = 'StateGrid';

/** Both collapse cells, which encode collapsed against expanded. */
function CollapseStates() {
  const [open, setOpen] = React.useState(false);

  return (
    <Stack spacing={3} sx={{ maxWidth: 266 }}>
      <Stepper activeStep={-1}>
        <Step completed>
          <StepLabel>Campaign created</StepLabel>
        </Step>
        <Step>
          <StepCollapse
            expanded={open}
            count={HIDDEN_EVENTS.length}
            onChange={(_unused, next) => setOpen(next)}
          />
        </Step>
        {open &&
          HIDDEN_EVENTS.map((event) => (
            <Step key={event} completed>
              <StepLabel>{event}</StepLabel>
            </Step>
          ))}
        <Step expanded>
          <StepLabel>Publish</StepLabel>
          <StepContent>Waiting on review.</StepContent>
        </Step>
      </Stepper>
      <Typography variant="caption" color="text.secondary">
        the row folds the steps between it and the next one — click it
      </Typography>
    </Stack>
  );
}

CollapseStates.displayName = 'CollapseStates';

/** The one state the sheet does not draw. */
function FailedStep() {
  return (
    <Stepper activeStep={1} sx={{ maxWidth: 266 }}>
      <Step expanded>
        <StepLabel>Payment authorised</StepLabel>
      </Step>
      <Step expanded>
        <StepLabel error optional="Card declined">
          Payment captured
        </StepLabel>
      </Step>
      <Step expanded>
        <StepLabel>Receipt sent</StepLabel>
      </Step>
    </Stepper>
  );
}

FailedStep.displayName = 'FailedStep';

/** `connector={null}` — the markers and the margin, without the rule. */
function NoConnector() {
  const regions = [
    { name: 'North America', live: true },
    { name: 'Europe', live: true },
    { name: 'South Asia', live: false },
  ];

  return (
    <Stepper activeStep={-1} connector={null} sx={{ maxWidth: 266 }}>
      {regions.map((region) => (
        <Step key={region.name} completed={region.live}>
          <StepLabel>{region.name}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}

NoConnector.displayName = 'NoConnector';

/** Not a Figma cell — the derived horizontal treatment. */
function HorizontalRun() {
  return (
    <Stepper activeStep={1} orientation="horizontal">
      <Step>
        <StepLabel>Build</StepLabel>
      </Step>
      <Step>
        <StepLabel>Test</StepLabel>
      </Step>
      <Step>
        <StepLabel>Release</StepLabel>
      </Step>
    </Stepper>
  );
}

HorizontalRun.displayName = 'HorizontalRun';

export function StepperShowcase() {
  return (
    <Stack spacing={5}>
      <PreviewCard
        title="A timeline"
        description="Figma's sample composition, at the 266px the set is drawn at. activeStep={-1} hands the states over to each step, and expanded keeps every description open."
      >
        <CampaignTimeline />
      </PreviewCard>

      <PreviewCard
        title="A wizard"
        description="MUI's own shape, unchanged: activeStep drives every state and only the active step shows its content."
      >
        <CampaignWizard />
      </PreviewCard>

      <PreviewCard
        title="Done and not done"
        description="The state axis across the three content cells. The header keeps the same ink and weight in both columns — only the dot and the line move."
      >
        <StateGrid />
      </PreviewCard>

      <PreviewCard
        title="Folding a run"
        description="The collapse cell: a vertical ellipsis where the dot goes and a bare primary-ink label beside it, on the same 28px margin as every other row."
      >
        <CollapseStates />
      </PreviewCard>

      <PreviewCard
        title="A step that failed"
        description="Not drawn in Figma. The dot takes the house error fill and the header its caption ink; the line is unaffected."
      >
        <FailedStep />
      </PreviewCard>

      <PreviewCard
        title="Dots with no line"
        description="connector={null} keeps the markers and the margin. For a dense list where the rule is more ink than the rows can carry."
      >
        <NoConnector />
      </PreviewCard>

      <PreviewCard
        title="Across the page"
        description="Not drawn in Figma either. Same dot, same 2px line, same type — the vertical set turned on its side."
      >
        <HorizontalRun />
      </PreviewCard>
    </Stack>
  );
}

StepperShowcase.displayName = 'StepperShowcase';
