/**
 * The reporting pattern, as a page a consumer can paste.
 *
 * Kept in its own file for the same reason `extractionCode` and
 * `matchingCode` are: it is one long string with short metadata around it,
 * and `get_pattern` promises "the full page layout code" rather than an
 * excerpt.
 *
 * What is left to the reader is the aggregate an API returns — the readings
 * table, the daily coverage series, the intent and driver rows. Everything
 * that is layout, and every derivation that turns those numbers into a
 * figure, an arrow, a colour and a bar width, is here.
 *
 * No chart is drawn. Atoms ships no chart primitive and hand-rolling one
 * costs the axes, the tooltip and the empty state that get asked for a week
 * later; for a plotted series the house recommendation is Recharts, fed the
 * same array the text beside it reads. The coverage card carries what a floor
 * line is drawn to deliver instead — which days broke the floor.
 *
 * The string carries no backticks and no interpolation on purpose: a bare
 * backtick in it would terminate the literal, and a `${` would be read as a
 * substitution rather than as code. The snippet concatenates with `+` for the
 * same reason.
 */
export const reportingCode = `'use client';

import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
  MenuItem,
  Navbar,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@neofloai/atoms';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  InfoIcon,
  SidebarSimpleIcon,
} from '@neofloai/atoms/icons';
import { border, icon, surface } from '@neofloai/atoms/tokens';

// The rail every screen in the app mounts. Its main menu already carries the
// Analytics row this screen is, which is the row that has to read as selected.
import { AppRail } from './AppRail';

/* ------------------------------------------------------------------ *
 * Geometry
 * ------------------------------------------------------------------ */

const FRAME_HEIGHT_PX = 900;

/** The band the filters sit in. */
const BAND_HEIGHT_PX = 64;

const CARD_GAP = 2;
const SECTION_GAP = 5;

/**
 * The coverage card's width. It holds the finding a trend line is drawn to
 * deliver rather than the line, so it takes the narrower half and leaves the
 * accuracy grid the rest.
 */
const COVERAGE_CARD_WIDTH_PX = 380;

const BAR_HEIGHT_PX = 8;
const ADOPTION_BAR_HEIGHT_PX = 12;
const LEGEND_DOT_PX = 8;
const INFO_GLYPH_PX = 16;
const PILL_ARROW_PX = 12;

/**
 * Segment labels keep the case they are written in.
 *
 * ToggleButton uppercases its label, which is Material's default and right
 * for a word. It is wrong for a unit: 7d and 30d are a number and a
 * lowercase day, and 7D / 30D say something else.
 */
const SEGMENT_CASE = { textTransform: 'none' } as const;

/** Tabular figures, so a number changing cannot shift the one beside it. */
const DIGITS = { fontVariantNumeric: 'tabular-nums' } as const;

/* ------------------------------------------------------------------ *
 * Series colour, from the role rather than from the ramp
 * ------------------------------------------------------------------ */

type SeriesRole = 'success' | 'information' | 'warning' | 'error';

/**
 * The four series colours, as roles rather than ramp values.
 *
 * icon.<role>.accent is the saturated fill of a role and carries a dark-mode
 * partner, which a raw hex does not. The theme callbacks are
 * written out at each call site rather than hoisted into a helper, so the
 * theme argument stays inferred and nothing has to import a Theme type.
 */
const SERIES = {
  success: icon.success.accent,
  information: icon.information.accent,
  warning: icon.warning.accent,
  error: icon.error.accent,
} as const;

/** The unfilled part of any bar on the screen. One token, one meaning. */
const TRACK = surface.default.defaultHover;

/* ------------------------------------------------------------------ *
 * The two things a figure is scoped by
 * ------------------------------------------------------------------ */

type RangeKey = 'today' | '7d' | '30d' | 'custom';

interface Range {
  readonly key: RangeKey;
  readonly label: string;
  readonly days: number;
}

const RANGES: readonly Range[] = [
  { key: 'today', label: 'Today', days: 1 },
  { key: '7d', label: '7d', days: 7 },
  { key: '30d', label: '30d', days: 30 },
  { key: 'custom', label: 'Custom', days: 30 },
];

/** Which authored column a range reads. */
type Column = 'today' | '7d' | '30d';

function columnFor(range: RangeKey): Column {
  return range === 'custom' ? '30d' : range;
}

interface Scope {
  readonly key: string;
  readonly label: string;
  /** Multiplies counted things. */
  readonly factor: number;
  /** Moves rates, in points. Clamped when applied. */
  readonly rateShift: number;
}

const ENTITIES: readonly Scope[] = [
  { key: 'MY', label: 'MY', factor: 1, rateShift: 0 },
  { key: 'SG', label: 'SG', factor: 0.62, rateShift: 1.1 },
  { key: 'HK', label: 'HK', factor: 0.41, rateShift: -0.7 },
  { key: 'ID', label: 'ID', factor: 0.28, rateShift: -2.4 },
  { key: 'PH', label: 'PH', factor: 0.19, rateShift: -1.5 },
];

const AGENTS: readonly Scope[] = [
  { key: 'neoflo', label: 'Neoflo Agent', factor: 1, rateShift: 0 },
  { key: 'query', label: 'Vendor Query Agent', factor: 0.34, rateShift: -1.2 },
];

/* ------------------------------------------------------------------ *
 * Metrics
 * ------------------------------------------------------------------ */

type MetricUnit = 'percent' | 'signedPercent' | 'minutes' | 'hours';

/** Which direction of travel is the good one. Decides the pill's colour. */
type Better = 'higher' | 'lower';

/**
 * Which window a metric is measured over.
 *
 * 'range' follows the band. 'eval' does not: accuracy figures come off a
 * model-evaluation job with its own fixed window, so they hold still while
 * the range moves. Every tile carries an explanation for that reason.
 */
type MetricWindow = 'range' | 'eval';

interface Metric {
  readonly key: string;
  readonly label: string;
  readonly help: string;
  readonly unit: MetricUnit;
  readonly better: Better;
  readonly window: MetricWindow;
  readonly decimals: number;
  readonly note?: string;
  /** Counted rather than rated, so scope scales it. */
  readonly counted?: boolean;
  /** Whether the tile draws a comparison pill. */
  readonly compare?: boolean;
}

interface Section {
  readonly key: string;
  readonly title: string;
  readonly caption: string;
  readonly metrics: readonly Metric[];
}

const CONTAINMENT: Metric = {
  key: 'containment',
  label: 'Containment rate',
  help: 'Share of vendor queries the agent finished on its own, with no person touching them, over the selected window.',
  unit: 'percent',
  better: 'higher',
  window: 'range',
  decimals: 0,
  compare: true,
};

const ASSIST_VALUE: Metric = {
  key: 'assistValue',
  label: 'Assist value',
  help: 'Change in the value of the queries the agent helped with but did not finish, against the window before this one.',
  unit: 'signedPercent',
  better: 'higher',
  window: 'range',
  decimals: 0,
  compare: true,
};

const ROUTING_ACCURACY: Metric = {
  key: 'routingAccuracy',
  label: 'Routing accuracy',
  help: 'Share of queries sent to the right queue, sampled by the evaluation job. Measured on the evaluation window, so it holds still while the range changes.',
  unit: 'percent',
  better: 'higher',
  window: 'eval',
  decimals: 1,
};

const INTENT_ACCURACY: Metric = {
  key: 'intentAccuracy',
  label: 'Intent-classification accuracy',
  help: 'Share of queries given the right intent, sampled by the evaluation job. Measured on the evaluation window, so it holds still while the range changes.',
  unit: 'percent',
  better: 'higher',
  window: 'eval',
  decimals: 1,
};

const AUTO_ANSWER_ACCURACY: Metric = {
  key: 'autoAnswerAccuracy',
  label: 'Auto-answer accuracy',
  help: 'Share of auto-sent answers a reviewer agreed with, sampled by the evaluation job. Measured on the evaluation window, so it holds still while the range changes.',
  unit: 'percent',
  better: 'higher',
  window: 'eval',
  decimals: 1,
};

const TIME_TO_AI: Metric = {
  key: 'timeToAiResponse',
  label: 'Time to AI response',
  help: 'Median wait between a query arriving and the agent having a draft answer ready.',
  unit: 'minutes',
  better: 'lower',
  window: 'range',
  decimals: 1,
  note: 'intake to suggestion',
};

const TIME_TO_RESOLVE: Metric = {
  key: 'timeToResolve',
  label: 'Time to Resolve',
  help: 'Median wait between a query arriving and it reaching a state nobody has to come back to.',
  unit: 'minutes',
  better: 'lower',
  window: 'range',
  decimals: 0,
  note: 'intake to terminal',
};

const RE_ASK_RATE: Metric = {
  key: 'reAskRate',
  label: 'Re-ask rate',
  help: 'Share of answered queries where the vendor wrote back asking the same thing again.',
  unit: 'percent',
  better: 'lower',
  window: 'range',
  decimals: 1,
  note: 'vendors replying again',
};

const COVERAGE: Metric = {
  key: 'coverage',
  label: 'Coverage / ingestion rate',
  help: 'Share of vendor mail the agent read without failing. The floor is the level below which a day is investigated.',
  unit: 'percent',
  better: 'higher',
  window: 'range',
  decimals: 1,
};

const SENTIMENT_ROUTING: Metric = {
  key: 'sentimentRouting',
  label: 'Sentiment-routing rate',
  help: 'Share of queries handed to a person because the vendor sounded unhappy, not because the agent could not answer.',
  unit: 'percent',
  better: 'lower',
  window: 'range',
  decimals: 1,
  compare: true,
};

const WHITELIST_COVERAGE: Metric = {
  key: 'whitelistCoverage',
  label: 'Whitelist coverage',
  help: 'Share of incoming mail from a sender already on the vendor registry. Mail from anywhere else is never answered automatically.',
  unit: 'percent',
  better: 'higher',
  window: 'range',
  decimals: 1,
  compare: true,
};

const HOURS_RETURNED: Metric = {
  key: 'hoursReturned',
  label: 'Hours returned / cost saved',
  help: 'Hours of handling the agent took off the team over the selected window, from the queries it finished on its own.',
  unit: 'hours',
  better: 'higher',
  window: 'range',
  decimals: 0,
  counted: true,
  compare: true,
};

const FAILED_AUTH_OVERRIDE: Metric = {
  key: 'failedAuthOverride',
  label: 'Failed-auth override rate',
  help: 'Share of failed sender checks a person waved through anyway. The one figure here that is a control being bypassed rather than a control working.',
  unit: 'percent',
  better: 'lower',
  window: 'range',
  decimals: 1,
  compare: true,
};

/** Three bands, in an order of consequence: achieved, works, behaving. */
const SECTIONS: readonly Section[] = [
  {
    key: 'outcomes',
    title: 'Outcomes',
    caption: 'Automation and time savings this month',
    metrics: [CONTAINMENT, ASSIST_VALUE],
  },
  {
    key: 'performance',
    title: 'Performance',
    caption: 'Speed, accuracy, and quality',
    metrics: [
      ROUTING_ACCURACY,
      INTENT_ACCURACY,
      AUTO_ANSWER_ACCURACY,
      TIME_TO_AI,
      TIME_TO_RESOLVE,
      RE_ASK_RATE,
    ],
  },
  {
    key: 'security',
    title: 'Security & accuracy',
    caption: 'Signals that the system is behaving safely',
    metrics: [
      SENTIMENT_ROUTING,
      WHITELIST_COVERAGE,
      HOURS_RETURNED,
      FAILED_AUTH_OVERRIDE,
    ],
  },
];

/**
 * Value and the window before it, per metric per column.
 *
 * The pair is the point: a delta that is stored can disagree with the two
 * figures it sits between, and one that is subtracted cannot.
 */
type Reading = readonly [value: number, previous: number];

const READINGS: Record<Column, Record<string, Reading>> = {
  today: {
    containment: [44, 39],
    assistValue: [-14, -15],
    timeToAiResponse: [1.7, 2.0],
    timeToResolve: [39, 46],
    reAskRate: [4.6, 5.2],
    sentimentRouting: [7.9, 6.8],
    whitelistCoverage: [92.8, 94.9],
    hoursReturned: [1.4, 1.2],
    failedAuthOverride: [4.4, 3.1],
  },
  '7d': {
    containment: [41, 36],
    assistValue: [-19, -17],
    timeToAiResponse: [1.9, 2.2],
    timeToResolve: [44, 49],
    reAskRate: [5.1, 5.6],
    sentimentRouting: [7.2, 6.4],
    whitelistCoverage: [93.4, 95.8],
    hoursReturned: [9.6, 8.4],
    failedAuthOverride: [3.8, 2.4],
  },
  '30d': {
    containment: [38, 33],
    assistValue: [-22, -18],
    timeToAiResponse: [2.1, 2.4],
    timeToResolve: [47, 52],
    reAskRate: [5.4, 5.9],
    sentimentRouting: [6.8, 5.9],
    whitelistCoverage: [94.1, 96.2],
    hoursReturned: [41, 36],
    failedAuthOverride: [3.2, 1.1],
  },
};

/**
 * The evaluation job's window. One table rather than one per range, which is
 * what window: 'eval' means made concrete: these three figures are not keyed
 * by the band, so there is nowhere for a per-range copy of them to sit and
 * drift.
 */
const EVAL_READINGS: Record<string, Reading> = {
  routingAccuracy: [95.2, 94.6],
  intentAccuracy: [95.2, 95.0],
  autoAnswerAccuracy: [95.8, 95.1],
};

/* ------------------------------------------------------------------ *
 * Coverage, the one real series
 * ------------------------------------------------------------------ */

interface CoverageDay {
  readonly date: string;
  readonly rate: number;
}

/**
 * Thirty daily ingestion rates, oldest first. Four sit under the floor; the
 * other twenty-six make the 30-day mean 99.2%.
 *
 * This is the array to hand a Recharts LineChart. It is also what the text
 * beside the chart reads, so the picture and the sentence cannot disagree.
 */
const COVERAGE_DAYS: readonly CoverageDay[] = [
  { date: '23 Jul', rate: 95.7 },
  { date: '24 Jul', rate: 99.9 },
  { date: '25 Jul', rate: 100 },
  { date: '26 Jul', rate: 99.8 },
  { date: '27 Jul', rate: 99.6 },
  { date: '28 Jul', rate: 100 },
  { date: '29 Jul', rate: 95.0 },
  { date: '30 Jul', rate: 99.7 },
  { date: '31 Jul', rate: 99.9 },
  { date: '01 Aug', rate: 100 },
  { date: '02 Aug', rate: 99.8 },
  { date: '03 Aug', rate: 99.6 },
  { date: '04 Aug', rate: 99.9 },
  { date: '05 Aug', rate: 100 },
  { date: '06 Aug', rate: 94.4 },
  { date: '07 Aug', rate: 99.8 },
  { date: '08 Aug', rate: 99.9 },
  { date: '09 Aug', rate: 100 },
  { date: '10 Aug', rate: 99.7 },
  { date: '11 Aug', rate: 99.8 },
  { date: '12 Aug', rate: 100 },
  { date: '13 Aug', rate: 99.9 },
  { date: '14 Aug', rate: 99.6 },
  { date: '15 Aug', rate: 99.8 },
  { date: '16 Aug', rate: 100 },
  { date: '17 Aug', rate: 95.4 },
  { date: '18 Aug', rate: 99.9 },
  { date: '19 Aug', rate: 100 },
  { date: '20 Aug', rate: 99.8 },
  { date: '21 Aug', rate: 99.7 },
];

/** The level below which a day gets investigated. */
const COVERAGE_FLOOR = 97;

function seriesFor(days: number): readonly CoverageDay[] {
  const span = Math.min(Math.max(Math.round(days), 1), COVERAGE_DAYS.length);
  return COVERAGE_DAYS.slice(COVERAGE_DAYS.length - span);
}

function mean(values: readonly CoverageDay[]): number {
  if (values.length === 0) return 0;
  return values.reduce((total, day) => total + day.rate, 0) / values.length;
}

/**
 * The days in the window that fell under the floor, worst first.
 *
 * The label is the finding, so it is derived from the rule rather than
 * annotated onto a picture — a labelled point that is above the floor, and a
 * breach with no label, are both possible in a drawing and neither is
 * possible here.
 */
function breachesFor(days: number): readonly CoverageDay[] {
  return seriesFor(days)
    .filter((day) => day.rate < COVERAGE_FLOOR)
    .slice()
    .sort((left, right) => left.rate - right.rate);
}

/** Three cases, and each of them is a different thing to say. */
function coverageSummary(days: number): string {
  const window = seriesFor(days);
  const breaches = breachesFor(days);
  const floor = String(COVERAGE_FLOOR) + '%';

  if (window.length === 1) {
    return (
      'One day in the window' +
      (breaches.length > 0
        ? ', and it fell under the ' + floor + ' floor'
        : ', above the ' + floor + ' floor')
    );
  }

  if (breaches.length === 0) {
    return (
      'All ' + String(window.length) + ' days held above the ' + floor + ' floor'
    );
  }

  return (
    String(breaches.length) +
    ' of ' +
    String(window.length) +
    ' days fell under the ' +
    floor +
    ' floor'
  );
}

/* ------------------------------------------------------------------ *
 * Reading a figure
 * ------------------------------------------------------------------ */

interface Reported {
  readonly metric: Metric;
  readonly value: number;
  readonly previous: number;
  readonly delta: number;
  /** Whether the change is an improvement. null when there is no change. */
  readonly improved: boolean | null;
}

function clampRate(value: number): number {
  return Math.min(Math.max(value, 0), 100);
}

/**
 * One tile's figures, after the window and the scope.
 *
 * A counted metric scales; a rate shifts and is clamped; an eval metric
 * ignores the window but not the scope, because the evaluation job is run per
 * entity even though it is not run per window.
 */
function report(
  metric: Metric,
  range: RangeKey,
  entity: Scope,
  agent: Scope,
  coverageDays: number
): Reported {
  const factor = entity.factor * agent.factor;
  const shift = entity.rateShift + agent.rateShift;

  const scale = (raw: number): number => {
    if (metric.counted) return raw * factor;
    if (metric.unit === 'percent') return clampRate(raw + shift);
    return raw;
  };

  // Coverage is the one figure scope does not move, because it is the one
  // series the record actually holds: the headline is the mean of the days
  // listed in the card under it. Shifting the mean and not the days would put
  // a 96.8% headline over a list that says every day held above 97.
  if (metric.key === 'coverage') {
    const slice = seriesFor(coverageDays);
    const before = COVERAGE_DAYS.slice(
      Math.max(0, COVERAGE_DAYS.length - slice.length * 2),
      COVERAGE_DAYS.length - slice.length
    );
    const value = mean(slice);
    const previous = before.length > 0 ? mean(before) : value;
    return { metric, value, previous, delta: value - previous, improved: null };
  }

  const reading =
    metric.window === 'eval'
      ? EVAL_READINGS[metric.key]
      : READINGS[columnFor(range)][metric.key];
  const value = scale(reading ? reading[0] : 0);
  const previous = scale(reading ? reading[1] : 0);
  const delta = value - previous;
  const rounded = Number(delta.toFixed(metric.decimals + 1));

  return {
    metric,
    value,
    previous,
    delta,
    improved:
      rounded === 0 ? null : metric.better === 'higher' ? delta > 0 : delta < 0,
  };
}

/**
 * The value, with its unit split off so the unit can be set smaller. One
 * treatment for all fourteen tiles, which is what lets a percentage, a
 * duration and a count of hours share a row.
 */
function formatValue(reported: Reported): { figure: string; unit: string } {
  const metric = reported.metric;
  const magnitude = Math.abs(reported.value).toFixed(metric.decimals);
  const sign =
    metric.unit === 'signedPercent' && reported.value < 0 ? '−' : '';

  return {
    figure: sign + magnitude,
    unit: metric.unit === 'minutes' ? 'm' : metric.unit === 'hours' ? 'h' : '%',
  };
}

/** The pill's own text: the change, signed, in the metric's unit. */
function formatDelta(reported: Reported): string {
  const metric = reported.metric;
  const sign = reported.delta > 0 ? '+' : '−';
  const magnitude = Math.abs(reported.delta).toFixed(
    metric.unit === 'hours' || metric.decimals === 0 ? 1 : metric.decimals
  );
  const trimmed = magnitude.endsWith('.0') ? magnitude.slice(0, -2) : magnitude;
  return sign + trimmed + (metric.unit === 'hours' ? 'h' : '%');
}

/**
 * What the pill is compared against, from the window rather than a string.
 * One derived label cannot drift into two wordings for one sentence.
 */
function comparisonLabel(range: RangeKey, days: number): string {
  if (range === 'today') return 'vs prev day';
  if (range === 'custom') return 'vs prev ' + String(Math.round(days)) + 'd';
  return 'vs prev ' + range;
}

/* ------------------------------------------------------------------ *
 * Suggestion adoption
 * ------------------------------------------------------------------ */

/**
 * What happened to the agent's drafts, as four shares of one hundred.
 *
 * Ordered by how far the answer travelled from what the agent wrote, which is
 * why the roles run success to error rather than being four arbitrary series
 * colours: the ladder is the reading.
 */
interface AdoptionBand {
  readonly key: string;
  readonly label: string;
  readonly role: SeriesRole;
}

const ADOPTION_BANDS: readonly AdoptionBand[] = [
  { key: 'verbatim', label: 'Verbatim', role: 'success' },
  { key: 'trivial', label: 'Trivially edited', role: 'information' },
  { key: 'substantive', label: 'Substantively edited', role: 'warning' },
  { key: 'replaced', label: 'Replaced', role: 'error' },
];

const ADOPTION: Record<Column, Record<string, number>> = {
  today: { verbatim: 51, trivial: 25, substantive: 16, replaced: 8 },
  '7d': { verbatim: 48, trivial: 26, substantive: 17, replaced: 9 },
  '30d': { verbatim: 46, trivial: 27, substantive: 18, replaced: 9 },
};

interface AdoptionShare extends AdoptionBand {
  readonly share: number;
}

function adoptionFor(range: RangeKey): readonly AdoptionShare[] {
  const column = ADOPTION[columnFor(range)];
  return ADOPTION_BANDS.map((band) => ({
    ...band,
    share: column[band.key] || 0,
  }));
}

/* ------------------------------------------------------------------ *
 * Automation by intent, and the reasons for routing
 * ------------------------------------------------------------------ */

interface IntentRow {
  readonly key: string;
  readonly label: string;
  readonly total: number;
  readonly autoShare: number;
}

const INTENTS: Record<Column, readonly IntentRow[]> = {
  today: [
    { key: 'payment-status', label: 'Payment Status', total: 6, autoShare: 83 },
    {
      key: 'payment-breakdown',
      label: 'Payment breakdown',
      total: 1,
      autoShare: 100,
    },
    { key: 'document', label: 'Document request', total: 3, autoShare: 67 },
    {
      key: 'invoice-receipt',
      label: 'Invoice-receipt',
      total: 2,
      autoShare: 100,
    },
    {
      key: 'tax-certificate',
      label: 'Tax certificate',
      total: 1,
      autoShare: 100,
    },
    { key: 'bank-change', label: 'Bank change', total: 0, autoShare: 0 },
    { key: 'dispute', label: 'Dispute', total: 1, autoShare: 0 },
  ],
  '7d': [
    { key: 'payment-status', label: 'Payment Status', total: 43, autoShare: 74 },
    {
      key: 'payment-breakdown',
      label: 'Payment breakdown',
      total: 10,
      autoShare: 70,
    },
    { key: 'document', label: 'Document request', total: 17, autoShare: 59 },
    {
      key: 'invoice-receipt',
      label: 'Invoice-receipt',
      total: 13,
      autoShare: 92,
    },
    { key: 'tax-certificate', label: 'Tax certificate', total: 8, autoShare: 88 },
    { key: 'bank-change', label: 'Bank change', total: 3, autoShare: 0 },
    { key: 'dispute', label: 'Dispute', total: 10, autoShare: 0 },
  ],
  '30d': [
    {
      key: 'payment-status',
      label: 'Payment Status',
      total: 184,
      autoShare: 71,
    },
    {
      key: 'payment-breakdown',
      label: 'Payment breakdown',
      total: 41,
      autoShare: 62,
    },
    { key: 'document', label: 'Document request', total: 73, autoShare: 55 },
    {
      key: 'invoice-receipt',
      label: 'Invoice-receipt',
      total: 55,
      autoShare: 88,
    },
    {
      key: 'tax-certificate',
      label: 'Tax certificate',
      total: 34,
      autoShare: 82,
    },
    { key: 'bank-change', label: 'Bank change', total: 11, autoShare: 0 },
    { key: 'dispute', label: 'Dispute', total: 42, autoShare: 0 },
  ],
};

/**
 * The intent rows for the window and scope.
 *
 * Totals are counted, so scope scales them; the auto share is a rate, so it
 * does not. A row can round to nothing, which is the reason the row still
 * renders — an intent with no queries in the window is a fact about the
 * window, not a row to hide.
 */
function intentsFor(
  range: RangeKey,
  entity: Scope,
  agent: Scope
): readonly IntentRow[] {
  const factor = entity.factor * agent.factor;
  return INTENTS[columnFor(range)].map((row) => ({
    ...row,
    total: Math.round(row.total * factor),
  }));
}

/** Auto-answered against routed on, in whole queries that sum to the total. */
function intentSplit(row: IntentRow): { auto: number; routed: number } {
  const auto = Math.round((row.total * row.autoShare) / 100);
  return { auto, routed: row.total - auto };
}

/**
 * Why a query went to a person. Counted, so scope scales it.
 *
 * The ERP is named by its role rather than by product, since the same reason
 * arrives from whichever one a deployment runs.
 */
interface DriverRow {
  readonly key: string;
  readonly label: string;
  readonly count: number;
}

const DRIVERS: Record<Column, readonly DriverRow[]> = {
  today: [
    { key: 'grn', label: 'GRN not posted in the ERP', count: 2 },
    { key: 'po-under', label: 'PO under-received', count: 1 },
    { key: 'wht', label: 'Invoice missing WHT cert', count: 1 },
    { key: 'run-delay', label: 'Payment run delay', count: 1 },
    { key: 'duplicate', label: 'Duplicate invoice submission', count: 0 },
    { key: 'registry', label: 'Sender not in registry', count: 0 },
  ],
  '7d': [
    { key: 'grn', label: 'GRN not posted in the ERP', count: 14 },
    { key: 'po-under', label: 'PO under-received', count: 9 },
    { key: 'wht', label: 'Invoice missing WHT cert', count: 8 },
    { key: 'run-delay', label: 'Payment run delay', count: 6 },
    { key: 'duplicate', label: 'Duplicate invoice submission', count: 4 },
    { key: 'registry', label: 'Sender not in registry', count: 3 },
  ],
  '30d': [
    { key: 'grn', label: 'GRN not posted in the ERP', count: 58 },
    { key: 'po-under', label: 'PO under-received', count: 41 },
    { key: 'wht', label: 'Invoice missing WHT cert', count: 33 },
    { key: 'run-delay', label: 'Payment run delay', count: 27 },
    { key: 'duplicate', label: 'Duplicate invoice submission', count: 19 },
    { key: 'registry', label: 'Sender not in registry', count: 14 },
  ],
};

function driversFor(
  range: RangeKey,
  entity: Scope,
  agent: Scope
): readonly DriverRow[] {
  const factor = entity.factor * agent.factor;
  return DRIVERS[columnFor(range)].map((row) => ({
    ...row,
    count: Math.round(row.count * factor),
  }));
}

/**
 * A ranked bar's share of its track: the row against the largest row, not
 * against the total.
 *
 * Against the total, six reasons that between them explain everything would
 * each draw a stub, and the ranking — the only thing the card is for — would
 * be unreadable.
 */
function shareOfLeader(count: number, rows: readonly DriverRow[]): number {
  const leader = rows.reduce((most, row) => Math.max(most, row.count), 0);
  return leader === 0 ? 0 : (count / leader) * 100;
}

/* ------------------------------------------------------------------ *
 * Pieces
 * ------------------------------------------------------------------ */

/**
 * The info glyph on every card title, with something behind it.
 *
 * A glyph that explains nothing is decoration, and this is also the only
 * place the screen can say that three of its tiles are measured on a
 * different window from the one the band selects.
 */
function InfoGlyph({ help }: { help: string }) {
  return (
    <Tooltip title={help}>
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          flexShrink: 0,
          color: 'text.secondary',
          cursor: 'help',
        }}
      >
        <InfoIcon size={INFO_GLYPH_PX} />
      </Box>
    </Tooltip>
  );
}

/**
 * The trend pill: the arrow says which way, the colour says whether that is
 * good.
 *
 * Two different questions. The arrow is the sign of the delta and nothing
 * else; the role comes from the metric's own better — so a rising containment
 * rate and a rising failed-auth override rate both point up, and only one of
 * them is green.
 */
function TrendPill({
  reported,
  comparison,
}: {
  reported: Reported;
  comparison: string;
}) {
  const improved = reported.improved;
  const Arrow = reported.delta > 0 ? ArrowUpIcon : ArrowDownIcon;

  return (
    <Stack direction="row" sx={{ gap: 1, alignItems: 'center', mt: 'auto' }}>
      <Chip
        size="sm"
        variant={
          improved === null ? 'secondary' : improved ? 'success' : 'error'
        }
        icon={improved === null ? undefined : <Arrow size={PILL_ARROW_PX} />}
        label={improved === null ? 'No change' : formatDelta(reported)}
      />
      <Typography variant="body1" color="text.secondary" noWrap>
        {comparison}
      </Typography>
    </Stack>
  );
}

/** The figure, with its unit split off and set smaller. */
function Figure({ reported }: { reported: Reported }) {
  const parts = formatValue(reported);

  return (
    <Stack direction="row" sx={{ gap: 0.5, alignItems: 'baseline' }}>
      <Typography variant="h3" component="p" sx={DIGITS}>
        {parts.figure}
      </Typography>
      <Typography variant="h4" component="span" color="text.secondary">
        {parts.unit}
      </Typography>
    </Stack>
  );
}

/** One tile. Title and glyph, the figure, then either a pill or a note. */
function MetricCard({
  reported,
  comparison,
}: {
  reported: Reported;
  comparison: string;
}) {
  const metric = reported.metric;

  return (
    <Card sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
      <CardContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          minWidth: 0,
        }}
      >
        <Stack direction="row" sx={{ gap: 1.5, alignItems: 'flex-start' }}>
          <Typography variant="h6" component="h4" sx={{ minWidth: 0 }}>
            {metric.label}
          </Typography>
          <InfoGlyph help={metric.help} />
        </Stack>

        {/* A tile with nothing under its figure bottom-aligns it, which is
            the right call for the accuracy trio. Otherwise a title that
            wraps to two lines would push its figure a line below the figure
            beside it, and two equal numbers would stop reading as equal.
            Where a pill or a note follows, that element is pinned instead. */}
        <Box sx={{ mt: metric.compare || metric.note ? 0 : 'auto' }}>
          <Figure reported={reported} />
        </Box>

        {metric.compare ? (
          <TrendPill reported={reported} comparison={comparison} />
        ) : null}

        {metric.note ? (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 'auto' }}>
            {metric.note}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}

/** A band's heading: what it is, and what it is for. */
function SectionHeading({ section }: { section: Section }) {
  return (
    <Box>
      <Typography variant="h4" component="h3">
        {section.title}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {section.caption}
      </Typography>
    </Box>
  );
}

/**
 * A bar made of more than one part.
 *
 * LinearProgress draws one value against a track, which is every bar here
 * except two: the adoption bar carries four shares of one hundred, and an
 * intent row carries what the agent answered beside what it handed on. Both
 * are compositions of the same track and the same role fills.
 *
 * Widths come from the shares, so a bar and the label beside it are two
 * renderings of one number and cannot disagree.
 */
function SegmentedBar({
  segments,
  height,
  label,
}: {
  segments: readonly { key: string; share: number; role: SeriesRole }[];
  height: number;
  label: string;
}) {
  return (
    <Box
      role="img"
      aria-label={label}
      sx={[
        {
          display: 'flex',
          height,
          width: '100%',
          borderRadius: 100,
          overflow: 'hidden',
        },
        (theme) => ({
          backgroundColor: TRACK.light,
          ...theme.applyStyles('dark', { backgroundColor: TRACK.dark }),
        }),
      ]}
    >
      {segments
        .filter((segment) => segment.share > 0)
        .map((segment) => (
          <Box
            key={segment.key}
            sx={[
              { width: segment.share + '%' },
              (theme) => ({
                backgroundColor: SERIES[segment.role].light,
                ...theme.applyStyles('dark', {
                  backgroundColor: SERIES[segment.role].dark,
                }),
              }),
            ]}
          />
        ))}
    </Box>
  );
}

/** A legend entry: the series dot, its name, and its share. */
function LegendItem({
  role,
  label,
  value,
}: {
  role: SeriesRole;
  label: string;
  value?: string;
}) {
  return (
    <Stack direction="row" sx={{ gap: 1, alignItems: 'center', minWidth: 0 }}>
      <Box
        sx={[
          {
            width: LEGEND_DOT_PX,
            height: LEGEND_DOT_PX,
            borderRadius: '50%',
            flexShrink: 0,
          },
          (theme) => ({
            backgroundColor: SERIES[role].light,
            ...theme.applyStyles('dark', {
              backgroundColor: SERIES[role].dark,
            }),
          }),
        ]}
      />
      <Typography variant="body1" color="text.secondary" noWrap>
        {label}
      </Typography>
      {value ? (
        <Typography variant="body1" sx={{ ...DIGITS, fontWeight: 500 }}>
          {value}
        </Typography>
      ) : null}
    </Stack>
  );
}

/** The row every bar card is built from: a label, a figure, and a bar. */
function BarRow({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <Stack sx={{ gap: 1 }}>
      <Stack
        direction="row"
        sx={{ gap: 1, alignItems: 'baseline', justifyContent: 'space-between' }}
      >
        <Typography
          variant="body1"
          sx={{ fontWeight: 500, minWidth: 0 }}
          noWrap
        >
          {label}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          noWrap
          sx={{ ...DIGITS, flexShrink: 0 }}
        >
          {value}
        </Typography>
      </Stack>
      {children}
    </Stack>
  );
}

/** A card with a title, a sub-title, and rows of bars under it. */
function PanelCard({
  title,
  caption,
  help,
  children,
  footer,
}: {
  title: string;
  caption: string;
  help: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Card sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
      <CardContent sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" sx={{ gap: 1.5, alignItems: 'flex-start' }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" component="h4">
              {title}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {caption}
            </Typography>
          </Box>
          <InfoGlyph help={help} />
        </Stack>

        <Stack sx={{ gap: 2, mt: 2.5 }}>{children}</Stack>

        {footer ? <Box sx={{ mt: 2.5 }}>{footer}</Box> : null}
      </CardContent>
    </Card>
  );
}

/**
 * The coverage card: the rate, and the days that broke the floor.
 *
 * No chart is drawn. For the trend line, reach for Recharts and hand it
 * COVERAGE_DAYS:
 *
 *   <ResponsiveContainer height={160}>
 *     <LineChart data={seriesFor(days)}>
 *       <XAxis dataKey="date" />
 *       <YAxis domain={[94, 100]} />
 *       <ReferenceLine y={COVERAGE_FLOOR} strokeDasharray="4 4" />
 *       <Line dataKey="rate" dot={false} />
 *     </LineChart>
 *   </ResponsiveContainer>
 *
 * What is kept here is the part the labels on that line carried: which days
 * failed and by how much, which is the only thing on the chart anybody acts
 * on.
 */
function CoverageCard({
  reported,
  days,
}: {
  reported: Reported;
  days: number;
}) {
  const breaches = breachesFor(days);
  const window = seriesFor(days);
  const span =
    window.length > 1
      ? window[0].date + ' – ' + window[window.length - 1].date
      : window.length === 1
        ? window[0].date
        : '';

  return (
    <Card
      sx={{ width: COVERAGE_CARD_WIDTH_PX, flexShrink: 0, display: 'flex' }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" sx={{ gap: 1.5, alignItems: 'flex-start' }}>
          <Typography variant="h6" component="h4" sx={{ minWidth: 0 }}>
            {COVERAGE.label}
          </Typography>
          <InfoGlyph help={COVERAGE.help} />
        </Stack>

        <Box sx={{ mt: 1.5 }}>
          <Figure reported={reported} />
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          {coverageSummary(days)}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {breaches.length > 0 ? (
          <Stack sx={{ gap: 1 }}>
            {breaches.map((day) => (
              <Stack
                key={day.date}
                direction="row"
                sx={{ gap: 1, justifyContent: 'space-between' }}
              >
                <Typography variant="body1" color="text.secondary">
                  {day.date}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ ...DIGITS, fontWeight: 500 }}
                >
                  {day.rate.toFixed(1) + '%'}
                </Typography>
              </Stack>
            ))}
          </Stack>
        ) : (
          <Typography variant="body1" color="text.secondary">
            Nothing to investigate in this window.
          </Typography>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>
          {span}
        </Typography>
      </CardContent>
    </Card>
  );
}

/** Suggestion adoption: four shares of one hundred, on one bar. */
function AdoptionCard({ bands }: { bands: readonly AdoptionShare[] }) {
  return (
    <Card sx={{ display: 'flex' }}>
      <CardContent sx={{ flex: 1 }}>
        <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center' }}>
          <Typography variant="h6" component="h4">
            Suggestion adoption
          </Typography>
          <InfoGlyph help="What happened to the answers the agent drafted: sent as written, tidied, rewritten, or thrown away. Ordered by how far the sent answer travelled from the draft." />
        </Stack>

        <Box sx={{ mt: 2.5 }}>
          <SegmentedBar
            height={ADOPTION_BAR_HEIGHT_PX}
            label={bands
              .map((band) => band.label + ' ' + String(band.share) + '%')
              .join(', ')}
            segments={bands.map((band) => ({
              key: band.key,
              share: band.share,
              role: band.role,
            }))}
          />
        </Box>

        <Stack
          direction="row"
          sx={{ gap: 2, mt: 2.5, justifyContent: 'space-between' }}
        >
          {bands.map((band) => (
            <LegendItem
              key={band.key}
              role={band.role}
              label={band.label + ' :'}
              value={String(band.share) + '%'}
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

/**
 * One intent row.
 *
 * A row with no queries in the window still renders. An intent nobody asked
 * about is a fact about the window, and hiding it would make the card shorter
 * every time the range narrowed.
 */
function IntentBar({ row }: { row: IntentRow }) {
  const split = intentSplit(row);

  if (row.total === 0) {
    return (
      <BarRow label={row.label} value="none this window">
        <SegmentedBar height={BAR_HEIGHT_PX} label="No queries" segments={[]} />
      </BarRow>
    );
  }

  return (
    <BarRow
      label={row.label}
      value={String(row.autoShare) + '% auto · ' + String(row.total) + ' total'}
    >
      {/* The bar is the share the label prints, not the rounded query
          counts: 41 total at 62% auto rounds to 25 whole queries, which is
          61% of 41 — and a bar a point off the number beside it is the exact
          disagreement this card exists to avoid. The counts are the same
          figure at a coarser resolution, so they go on the label a screen
          reader gets. */}
      <SegmentedBar
        height={BAR_HEIGHT_PX}
        label={
          String(split.auto) +
          ' auto-answered, ' +
          String(split.routed) +
          ' routed on'
        }
        segments={[
          { key: 'auto', share: row.autoShare, role: 'success' },
          { key: 'routed', share: 100 - row.autoShare, role: 'warning' },
        ]}
      />
    </BarRow>
  );
}

/** One reason for routing, against the leading reason. */
function DriverBar({
  row,
  rows,
}: {
  row: DriverRow;
  rows: readonly DriverRow[];
}) {
  return (
    <BarRow label={row.label} value={String(row.count)}>
      <LinearProgress
        variant="determinate"
        color="information"
        value={shareOfLeader(row.count, rows)}
        aria-label={row.label}
        sx={{ height: BAR_HEIGHT_PX, borderRadius: 100 }}
      />
    </BarRow>
  );
}

/* ------------------------------------------------------------------ *
 * The screen
 * ------------------------------------------------------------------ */

/**
 * The reporting screen: what the agent did, over a window you choose.
 *
 * ## It reports, and it does not act
 *
 * No Proceed, no Reject, no row that opens a record. That is the line between
 * this screen and the stages of a workflow: the stages decide what happens to
 * one invoice, and this looks back at what happened to all of them. A control
 * here that changed something would be pressed by whoever happened to be
 * reading.
 *
 * ## One band chooses the window, and everything under it re-reads
 *
 * Range, entity and agent are the only inputs. Every figure, every bar width,
 * every comparison label and the coverage summary are derived from them on
 * each render — which is what stops a stale figure sitting under a changed
 * heading. A reporting screen is the one screen where a hardcoded number is
 * indistinguishable from a correct one.
 *
 * ## Three tiles do not follow the band, and say so
 *
 * The accuracy trio comes off an evaluation job with its own window. The info
 * glyph on every card title is where that is stated.
 */
export function ReportingScreen() {
  const [collapsed, setCollapsed] = React.useState(true);
  const [range, setRange] = React.useState<RangeKey>('30d');
  const [entityKey, setEntityKey] = React.useState(ENTITIES[0].key);
  const [agentKey, setAgentKey] = React.useState(AGENTS[0].key);

  const entity = ENTITIES.find((item) => item.key === entityKey) || ENTITIES[0];
  const agent = AGENTS.find((item) => item.key === agentKey) || AGENTS[0];
  const selectedRange = RANGES.find((item) => item.key === range);
  const days = selectedRange ? selectedRange.days : 30;
  const comparison = comparisonLabel(range, days);

  const read = React.useCallback(
    (metric: Metric) => report(metric, range, entity, agent, days),
    [range, entity, agent, days]
  );

  const intents = intentsFor(range, entity, agent);
  const drivers = driversFor(range, entity, agent);
  const adoption = adoptionFor(range);
  const performanceGrid = SECTIONS[1].metrics;
  const coverage = read(COVERAGE);

  return (
    <Stack
      direction="row"
      sx={{
        height: FRAME_HEIGHT_PX,
        overflow: 'hidden',
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <AppRail collapsed={collapsed} active="analytics" />

      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Navbar>
          <IconButton
            variant="secondary"
            appearance="text"
            size="sm"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setCollapsed((previous) => !previous)}
          >
            <SidebarSimpleIcon />
          </IconButton>
        </Navbar>

        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <Box sx={{ px: 6, pt: 5, pb: 3 }}>
            <Typography variant="h3" component="h2">
              Analytics
            </Typography>
          </Box>

          {/* The band is the screen's only input, so it stays put while the
              bands under it scroll — a window you cannot see is a window you
              will forget you chose. */}
          <Stack
            direction="row"
            sx={(theme) => ({
              position: 'sticky',
              top: 0,
              zIndex: 1,
              px: 6,
              gap: 1.75,
              minHeight: BAND_HEIGHT_PX,
              alignItems: 'center',
              backgroundColor: surface.layers.card1.light,
              borderTop: '1px solid',
              borderBottom: '1px solid',
              borderColor: border.layers.card2.light,
              ...theme.applyStyles('dark', {
                backgroundColor: surface.layers.card1.dark,
                borderColor: border.layers.card2.dark,
              }),
            })}
          >
            <Typography variant="body1" sx={{ flexShrink: 0 }}>
              Range
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="sm"
              value={range}
              onChange={(_, next) => {
                if (next !== null) setRange(next as RangeKey);
              }}
              aria-label="Reporting window"
            >
              {RANGES.map((item) => (
                <ToggleButton key={item.key} value={item.key} sx={SEGMENT_CASE}>
                  {item.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <Typography variant="body1" sx={{ flexShrink: 0, ml: 1 }}>
              Entity
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="sm"
              value={entityKey}
              onChange={(_, next) => {
                if (next !== null) setEntityKey(next as string);
              }}
              aria-label="Entity"
            >
              {ENTITIES.map((item) => (
                <ToggleButton key={item.key} value={item.key} sx={SEGMENT_CASE}>
                  {item.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <Box sx={{ flex: 1 }} />

            <Select
              value={agentKey}
              onChange={(event) => setAgentKey(String(event.target.value))}
              aria-label="Agent"
              sx={{ width: 200, flexShrink: 0 }}
            >
              {AGENTS.map((item) => (
                <MenuItem key={item.key} value={item.key}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </Stack>

          <Stack sx={{ px: 6, py: 5, gap: SECTION_GAP }}>
            <Stack sx={{ gap: 2.5 }}>
              <SectionHeading section={SECTIONS[0]} />
              <Stack direction="row" sx={{ gap: CARD_GAP }}>
                {SECTIONS[0].metrics.map((metric) => (
                  <MetricCard
                    key={metric.key}
                    reported={read(metric)}
                    comparison={comparison}
                  />
                ))}
              </Stack>
            </Stack>

            {/* Performance: the accuracy and timing grid, the coverage card
                beside it, and the adoption bar under both. */}
            <Stack sx={{ gap: 2.5 }}>
              <SectionHeading section={SECTIONS[1]} />
              <Stack
                direction="row"
                sx={{ gap: CARD_GAP, alignItems: 'stretch' }}
              >
                <Stack sx={{ flex: 1, minWidth: 0, gap: CARD_GAP }}>
                  <Stack direction="row" sx={{ gap: CARD_GAP, flex: 1 }}>
                    {performanceGrid.slice(0, 3).map((metric) => (
                      <MetricCard
                        key={metric.key}
                        reported={read(metric)}
                        comparison={comparison}
                      />
                    ))}
                  </Stack>
                  <Stack direction="row" sx={{ gap: CARD_GAP, flex: 1 }}>
                    {performanceGrid.slice(3).map((metric) => (
                      <MetricCard
                        key={metric.key}
                        reported={read(metric)}
                        comparison={comparison}
                      />
                    ))}
                  </Stack>
                </Stack>
                <CoverageCard reported={coverage} days={days} />
              </Stack>
              <AdoptionCard bands={adoption} />
            </Stack>

            <Stack sx={{ gap: 2.5 }}>
              <SectionHeading section={SECTIONS[2]} />
              <Stack direction="row" sx={{ gap: CARD_GAP }}>
                {SECTIONS[2].metrics.map((metric) => (
                  <MetricCard
                    key={metric.key}
                    reported={read(metric)}
                    comparison={comparison}
                  />
                ))}
              </Stack>
            </Stack>

            {/* The two breakdowns, under no heading of their own — they answer
                where the work went and why, which is a question about all
                three bands above rather than a fourth band. */}
            <Stack
              direction="row"
              sx={{ gap: CARD_GAP, alignItems: 'stretch' }}
            >
              <PanelCard
                title="Automation by intent type"
                caption="Share auto-answered against routed to the helpdesk"
                help="Every query the agent classified in this window, grouped by what it was about. The bar is what the agent finished beside what it handed on."
                footer={
                  <Stack direction="row" sx={{ gap: 4 }}>
                    <LegendItem role="success" label="Auto-answered" />
                    <LegendItem role="warning" label="Routed to the helpdesk" />
                  </Stack>
                }
              >
                {intents.map((row) => (
                  <IntentBar key={row.key} row={row} />
                ))}
              </PanelCard>

              <PanelCard
                title="Driver analysis — why we routed"
                caption="Top reasons in this window"
                help="Why a query needed a person. Each bar is that reason against the leading one, so the ranking is readable even when one reason dominates."
              >
                {drivers.map((row) => (
                  <DriverBar key={row.key} row={row} rows={drivers} />
                ))}
              </PanelCard>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Stack>
  );
}
`;
