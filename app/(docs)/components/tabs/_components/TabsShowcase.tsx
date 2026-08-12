'use client';

import * as React from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Tab, Tabs } from '@/src/components/Tabs';

const REGIONS = [
  'North America',
  'South America',
  'Europe',
  'Middle East',
  'Africa',
  'South Asia',
  'South East Asia',
  'Oceania',
] as const;

const SECTIONS = ['Profile', 'Notifications', 'Security'] as const;

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
 * The whole pattern, panels included — the part `Tabs` does not ship, so
 * the docs had better show it. `hidden` keeps the inactive panels in the
 * DOM rather than unmounting them, so their state survives a switch.
 */
function AccountSections() {
  const [tab, setTab] = React.useState('overview');

  const panels = {
    overview: 'Plan, usage, and the two invoices due this month.',
    members: 'Eleven people, three of them pending an invitation.',
    billing: 'Card ending 4242, next charge on the first.',
  } as const;

  return (
    <Stack spacing={2}>
      <Tabs
        value={tab}
        onChange={(_, next: string) => setTab(next)}
        aria-label="Account sections"
      >
        {Object.keys(panels).map((key) => (
          <Tab
            key={key}
            value={key}
            label={key[0].toUpperCase() + key.slice(1)}
            id={`tab-${key}`}
            aria-controls={`panel-${key}`}
          />
        ))}
      </Tabs>
      {Object.entries(panels).map(([key, copy]) => (
        <Typography
          key={key}
          role="tabpanel"
          id={`panel-${key}`}
          aria-labelledby={`tab-${key}`}
          hidden={tab !== key}
          tabIndex={0}
          variant="body2"
          color="text.secondary"
        >
          {copy}
        </Typography>
      ))}
    </Stack>
  );
}

AccountSections.displayName = 'AccountSections';

/** Counts, which is the Figma `tag` axis. */
function InvoiceStatus() {
  const [status, setStatus] = React.useState('all');

  return (
    <Tabs
      value={status}
      onChange={(_, next: string) => setStatus(next)}
      aria-label="Invoice status"
    >
      <Tab label="All" value="all" count={48} />
      <Tab
        label="Open"
        value="open"
        count={12}
        aria-label="Open, 12 invoices"
      />
      <Tab label="Paid" value="paid" count={36} />
      <Tab label="Void" value="void" count={0} />
    </Tabs>
  );
}

InvoiceStatus.displayName = 'InvoiceStatus';

/** More tabs than fit, so the row scrolls and the carets appear. */
function ScrollableRegions() {
  const [region, setRegion] = React.useState<string>(REGIONS[0]);

  return (
    <Tabs
      value={region}
      onChange={(_, next: string) => setRegion(next)}
      variant="scrollable"
      scrollButtons
      allowScrollButtonsMobile
      aria-label="Regions"
      sx={{ maxWidth: 420 }}
    >
      {REGIONS.map((r) => (
        <Tab key={r} label={r} value={r} />
      ))}
    </Tabs>
  );
}

ScrollableRegions.displayName = 'ScrollableRegions';

/** Three tabs sharing the width, as on a phone. */
function ReportPeriod() {
  const [period, setPeriod] = React.useState('week');

  return (
    <Tabs
      value={period}
      onChange={(_, next: string) => setPeriod(next)}
      variant="fullWidth"
      aria-label="Report period"
      sx={{ maxWidth: 320 }}
    >
      <Tab label="Day" value="day" />
      <Tab label="Week" value="week" />
      <Tab label="Month" value="month" />
    </Tabs>
  );
}

ReportPeriod.displayName = 'ReportPeriod';

/** Not a Figma cell — the derived vertical treatment. */
function VerticalSettings() {
  const [section, setSection] = React.useState<string>(SECTIONS[0]);

  return (
    <Tabs
      orientation="vertical"
      value={section}
      onChange={(_, next: string) => setSection(next)}
      aria-label="Settings sections"
      sx={{ width: 200 }}
    >
      {SECTIONS.map((s) => (
        <Tab
          key={s}
          label={s}
          value={s}
          count={s === 'Notifications' ? 3 : undefined}
        />
      ))}
    </Tabs>
  );
}

VerticalSettings.displayName = 'VerticalSettings';

/** Both disabled cells: one tab off, and the whole bar off. */
function DisabledStates() {
  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Tabs value="build" aria-label="Deployment stages">
          <Tab label="Build" value="build" />
          <Tab label="Tests" value="tests" count={4} />
          <Tab label="Release" value="release" disabled />
        </Tabs>
        <Typography variant="caption" color="text.secondary">
          one tab disabled
        </Typography>
      </Stack>
      <Stack spacing={1}>
        <Tabs value="all" disabled aria-label="Invoice status, loading">
          <Tab label="All" value="all" count={48} />
          <Tab label="Open" value="open" count={12} />
          <Tab label="Paid" value="paid" />
        </Tabs>
        <Typography variant="caption" color="text.secondary">
          the whole bar disabled — the Figma `enabled` axis, which dims the
          indicator and moves the count pill to the neutral role
        </Typography>
      </Stack>
    </Stack>
  );
}

DisabledStates.displayName = 'DisabledStates';

/**
 * Selection with nothing selected. Worth showing because `value={false}`
 * is the only way to say it — an undefined `value` makes MUI fall back to
 * child indexes and warn.
 */
function NothingSelected() {
  return (
    <Tabs value={false} aria-label="Filters, none applied">
      <Tab label="Overdue" value="overdue" />
      <Tab label="Draft" value="draft" />
      <Tab label="Sent" value="sent" />
    </Tabs>
  );
}

NothingSelected.displayName = 'NothingSelected';

export function TabsShowcase() {
  return (
    <Stack spacing={5}>
      <PreviewCard
        title="A bar and its panels"
        description="The whole pattern. Tabs renders the tab list; the panels are plain elements wired to it with role, id, and aria-labelledby."
      >
        <AccountSections />
      </PreviewCard>

      <PreviewCard
        title="With counts"
        description="The Figma tag axis, rendered as the same Chip size=&quot;sm&quot; the design nests here."
      >
        <InvoiceStatus />
      </PreviewCard>

      <PreviewCard
        title="Too many to fit"
        description="variant=&quot;scrollable&quot; lets the row scroll rather than wrap. The carets are the house Phosphor pair."
      >
        <ScrollableRegions />
      </PreviewCard>

      <PreviewCard
        title="Filling a narrow bar"
        description="variant=&quot;fullWidth&quot;, for three or four tabs on a phone."
      >
        <ReportPeriod />
      </PreviewCard>

      <PreviewCard
        title="Down the side"
        description="Not drawn in Figma. The rule moves to the inline edge, the 12px gap moves with it, and the labels left-align — every colour and size unchanged."
      >
        <VerticalSettings />
      </PreviewCard>

      <PreviewCard
        title="Unavailable"
        description="A single tab, and the whole bar."
      >
        <DisabledStates />
      </PreviewCard>

      <PreviewCard
        title="Nothing selected"
        description="value={false} is how you say it — leaving value undefined makes MUI fall back to child indexes."
      >
        <NothingSelected />
      </PreviewCard>
    </Stack>
  );
}

TabsShowcase.displayName = 'TabsShowcase';
