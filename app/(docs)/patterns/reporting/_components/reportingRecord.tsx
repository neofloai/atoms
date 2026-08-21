'use client';

import { styled } from '@mui/material/styles';

/**
 * The record behind the reporting screen: what is measured, what it is
 * measured over, and every figure derived from those two things.
 *
 * ## Why a record module rather than numbers in the markup
 *
 * A reporting screen is the one screen where a hardcoded figure is
 * indistinguishable from a correct one — nothing on the page contradicts a
 * wrong number. So the numbers live here with the arithmetic that produces
 * them, and the components below read the result. Four things are derived
 * rather than stored, and each of them is a place the source frame
 * disagreed with itself:
 *
 *   1. **The trend pill's colour and its arrow.** The arrow is the sign of
 *      the change; the colour is whether that change is *good*, which
 *      depends on the metric. A rising containment rate is good, a rising
 *      failed-auth override rate is not, and both draw an up arrow.
 *   2. **Every bar's width**, from the number printed beside it.
 *   3. **Which points on the coverage chart carry a label** — the ones
 *      below the floor, and only those.
 *   4. **The comparison label** (`vs prev 30d`), from the selected window.
 *
 * ## Where the sample figures come from
 *
 * The `30d` column is the frame's own: 38% containment, 95.2 / 95.2 / 95.8
 * accuracy, 47m to resolve, 41h returned, and the seven intent rows and six
 * driver rows verbatim. The `today` and `7d` columns are authored beside
 * them, because a window is what an aggregate API is keyed by — there is no
 * arithmetic that turns a month into a day.
 *
 * Coverage is the exception and the reason the chart is real: an ingestion
 * monitor reports a rate per bucket, so `COVERAGE_SERIES` is thirty daily
 * rates and the headline is the mean of whichever slice the range asks for.
 * Its 30-day mean lands on the frame's 99.2%.
 *
 * Scope — the entity segments and the agent select — is a factor on top of
 * that: one authored column scaled per scope, which is a fixture device and
 * not how a deployment would answer. It is here because a control that
 * changes nothing teaches the wrong thing about the pattern.
 */

/** Tabular figures, so a number changing cannot shift the one beside it. */
const tabular = { fontVariantNumeric: 'tabular-nums' } as const;

/** A measured value. Every figure on the screen is one of these. */
export const Digits = styled('span')({ ...tabular });

/* ------------------------------------------------------------------ *
 * The two things a figure is scoped by
 * ------------------------------------------------------------------ */

export type RangeKey = 'today' | '7d' | '30d' | 'custom';

export interface Range {
  readonly key: RangeKey;
  readonly label: string;
  /** Days the window covers. `custom` resolves from the picked dates. */
  readonly days: number;
}

/**
 * The four segments the band draws. `Custom` carries the same 30 days as
 * `30d` until two dates are picked, which is what the segment is for — the
 * frame draws the segment and no picker, so the picker is added here rather
 * than leaving a control that cannot be used.
 */
export const RANGES: readonly Range[] = [
  { key: 'today', label: 'Today', days: 1 },
  { key: '7d', label: '7d', days: 7 },
  { key: '30d', label: '30d', days: 30 },
  { key: 'custom', label: 'Custom', days: 30 },
];

/**
 * Which set of figures a range reads. `custom` shares the 30-day column:
 * an arbitrary window has no authored column of its own, and inventing one
 * per date pair would make the picker look like it had data behind it.
 */
export type Column = 'today' | '7d' | '30d';

export function columnFor(range: RangeKey): Column {
  return range === 'custom' ? '30d' : range;
}

export interface Scope {
  readonly key: string;
  readonly label: string;
  /** Multiplies counted things — queries, hours, drivers. */
  readonly factor: number;
  /** Moves rates, in points. Clamped when applied. */
  readonly rateShift: number;
}

/**
 * The five entities the band draws, and the frame's selected one first.
 * `MY` is the authored column; the rest scale off it.
 */
export const ENTITIES: readonly Scope[] = [
  { key: 'MY', label: 'MY', factor: 1, rateShift: 0 },
  { key: 'SG', label: 'SG', factor: 0.62, rateShift: 1.1 },
  { key: 'HK', label: 'HK', factor: 0.41, rateShift: -0.7 },
  { key: 'ID', label: 'ID', factor: 0.28, rateShift: -2.4 },
  { key: 'PH', label: 'PH', factor: 0.19, rateShift: -1.5 },
];

/** The agents the workspace runs. The frame draws the first. */
export const AGENTS: readonly Scope[] = [
  { key: 'neoflo', label: 'Neoflo Agent', factor: 1, rateShift: 0 },
  { key: 'query', label: 'Vendor Query Agent', factor: 0.34, rateShift: -1.2 },
];

/* ------------------------------------------------------------------ *
 * Metrics
 * ------------------------------------------------------------------ */

export type MetricUnit = 'percent' | 'signedPercent' | 'minutes' | 'hours';

/** Which direction of travel is the good one. Decides the pill's colour. */
export type Better = 'higher' | 'lower';

/**
 * Which window a metric is measured over.
 *
 * `range` follows the band. `eval` does not: the three accuracy figures come
 * off a model-evaluation job that runs on its own fixed window, so they hold
 * still while the range moves. That is a real property of this kind of
 * screen rather than an omission, and it is why every tile carries an
 * explanation — the glyph the frame draws on all fourteen cards is the only
 * place the difference can be said without inventing visible copy.
 */
export type MetricWindow = 'range' | 'eval';

export interface Metric {
  readonly key: string;
  readonly label: string;
  /** What the tile means, and over what window. Shown on the info glyph. */
  readonly help: string;
  readonly unit: MetricUnit;
  readonly better: Better;
  readonly window: MetricWindow;
  /** Decimal places. `47m` and `95.2%` are both in the frame. */
  readonly decimals: number;
  /** A definition too short to need the glyph, printed under the figure. */
  readonly note?: string;
  /** Counted rather than rated, so scope scales it. */
  readonly counted?: boolean;
  /** Whether the tile draws a comparison pill. The frame draws six. */
  readonly compare?: boolean;
}

export interface Section {
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
  note: 'intake → suggestion',
};

const TIME_TO_RESOLVE: Metric = {
  key: 'timeToResolve',
  label: 'Time to Resolve',
  help: 'Median wait between a query arriving and it reaching a state nobody has to come back to.',
  unit: 'minutes',
  better: 'lower',
  window: 'range',
  decimals: 0,
  note: 'intake → terminal',
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

/**
 * The three bands, in the frame's order, and it is an order of consequence:
 * what the agent achieved, how well it works, and whether it is behaving.
 */
export const SECTIONS: readonly Section[] = [
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

/** The coverage tile is its own card, beside the performance grid. */
export const COVERAGE_METRIC = COVERAGE;

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
 * what `window: 'eval'` means made concrete: these three figures are not
 * keyed by the band, so there is nowhere for a per-range copy of them to sit
 * and drift.
 */
const EVAL_READINGS: Record<string, Reading> = {
  routingAccuracy: [95.2, 94.6],
  intentAccuracy: [95.2, 95.0],
  autoAnswerAccuracy: [95.8, 95.1],
};

/* ------------------------------------------------------------------ *
 * Coverage, the one real series
 * ------------------------------------------------------------------ */

export interface CoverageDay {
  readonly date: string;
  readonly rate: number;
}

/**
 * Thirty daily ingestion rates, oldest first.
 *
 * Four of them sit under the 97% floor — 95.7, 95.0, 94.4 and 95.4, the
 * four the frame labels on its trend line — and the other twenty-six are
 * the ordinary days that make the 30-day mean 99.2%. Nothing else on the
 * screen is a series, which is why nothing else re-derives from the range
 * this precisely.
 *
 * The dates are fixed rather than counted back from today, so the figures a
 * reader sees are the figures this file states.
 */
export const COVERAGE_DAYS: readonly CoverageDay[] = [
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
export const COVERAGE_FLOOR = 97;

/** The window's slice of the series, most recent `days` entries. */
export function seriesFor(days: number): readonly CoverageDay[] {
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
 * This is what the frame's trend line is drawn to show: it plots thirty
 * points and then labels exactly the four that broke the rule. The label is
 * the finding, so it is derived from the rule rather than annotated onto the
 * picture — a labelled point that is above the floor, or a breach with no
 * label, are both possible in a drawing and neither is possible here.
 *
 * Atoms ships no chart primitive, and one is not hand-drawn here. For the
 * trend line itself, use **Recharts** (recommended) and feed it this same
 * series; see the pattern's notes.
 */
export function breachesFor(days: number): readonly CoverageDay[] {
  return seriesFor(days)
    .filter((day) => day.rate < COVERAGE_FLOOR)
    .slice()
    .sort((left, right) => left.rate - right.rate);
}

/* ------------------------------------------------------------------ *
 * Reading a figure
 * ------------------------------------------------------------------ */

export interface Reported {
  readonly metric: Metric;
  readonly value: number;
  readonly previous: number;
  readonly delta: number;
  /** Whether the change is an improvement. `null` when there is no change. */
  readonly improved: boolean | null;
}

function clampRate(value: number): number {
  return Math.min(Math.max(value, 0), 100);
}

/**
 * One tile's figures, after the window and the scope.
 *
 * A counted metric scales; a rate shifts and is clamped; an `eval` metric
 * ignores the window but not the scope, because the evaluation job is run
 * per entity even though it is not run per window.
 */
export function report(
  metric: Metric,
  range: RangeKey,
  entity: Scope,
  agent: Scope,
  coverageDays: number
): Reported {
  const factor = entity.factor * agent.factor;
  const shift = entity.rateShift + agent.rateShift;

  const scale = (raw: number): number => {
    if (metric.key === 'coverage') return raw;
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
    return {
      metric,
      value,
      previous,
      delta: value - previous,
      improved: null,
    };
  }

  const reading =
    metric.window === 'eval'
      ? EVAL_READINGS[metric.key]
      : READINGS[columnFor(range)][metric.key];
  const value = scale(reading?.[0] ?? 0);
  const previous = scale(reading?.[1] ?? 0);
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
 * The value, with its unit split off so the unit can be set smaller.
 *
 * The frame draws every figure this way — a 36px number beside a 24px unit —
 * and it is the reason a percentage and a duration can share a row without
 * either of them looking like the other.
 */
export function formatValue(reported: Reported): {
  figure: string;
  unit: string;
} {
  const { metric, value } = reported;
  const magnitude = Math.abs(value).toFixed(metric.decimals);
  const sign = metric.unit === 'signedPercent' && value < 0 ? '−' : '';

  return {
    figure: sign + magnitude,
    unit:
      metric.unit === 'minutes' ? 'm' : metric.unit === 'hours' ? 'h' : '%',
  };
}

/** The pill's own text: the change, signed, in the metric's unit. */
export function formatDelta(reported: Reported): string {
  const { metric, delta } = reported;
  const sign = delta > 0 ? '+' : '−';
  const magnitude = Math.abs(delta).toFixed(
    metric.unit === 'hours' || metric.decimals === 0 ? 1 : metric.decimals
  );
  const trimmed = magnitude.endsWith('.0')
    ? magnitude.slice(0, -2)
    : magnitude;
  return sign + trimmed + (metric.unit === 'hours' ? 'h' : '%');
}

/**
 * What the pill is compared against, from the window rather than a string.
 *
 * The frame prints `vs prev 30d` on four tiles and `vs prior 30d` on two,
 * which is the same sentence twice; one wording, derived, cannot drift.
 */
export function comparisonLabel(range: RangeKey, days: number): string {
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
 * Ordered by how far the answer travelled from what the agent wrote, which
 * is why the roles run success → information → warning → error rather than
 * being four arbitrary series colours: the ladder is the reading.
 */
export interface AdoptionBand {
  readonly key: string;
  readonly label: string;
  readonly role: 'success' | 'information' | 'warning' | 'error';
}

export const ADOPTION_BANDS: readonly AdoptionBand[] = [
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

export interface AdoptionShare extends AdoptionBand {
  readonly share: number;
}

export function adoptionFor(range: RangeKey): readonly AdoptionShare[] {
  const column = ADOPTION[columnFor(range)];
  return ADOPTION_BANDS.map((band) => ({
    ...band,
    share: column[band.key] ?? 0,
  }));
}

/* ------------------------------------------------------------------ *
 * Automation by intent, and the reasons for routing
 * ------------------------------------------------------------------ */

/** One intent, and how much of it the agent finished. */
export interface IntentRow {
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
    { key: 'invoice-receipt', label: 'Invoice-receipt', total: 2, autoShare: 100 },
    { key: 'tax-certificate', label: 'Tax certificate', total: 1, autoShare: 100 },
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
    { key: 'invoice-receipt', label: 'Invoice-receipt', total: 13, autoShare: 92 },
    { key: 'tax-certificate', label: 'Tax certificate', total: 8, autoShare: 88 },
    { key: 'bank-change', label: 'Bank change', total: 3, autoShare: 0 },
    { key: 'dispute', label: 'Dispute', total: 10, autoShare: 0 },
  ],
  '30d': [
    { key: 'payment-status', label: 'Payment Status', total: 184, autoShare: 71 },
    {
      key: 'payment-breakdown',
      label: 'Payment breakdown',
      total: 41,
      autoShare: 62,
    },
    { key: 'document', label: 'Document request', total: 73, autoShare: 55 },
    { key: 'invoice-receipt', label: 'Invoice-receipt', total: 55, autoShare: 88 },
    { key: 'tax-certificate', label: 'Tax certificate', total: 34, autoShare: 82 },
    { key: 'bank-change', label: 'Bank change', total: 11, autoShare: 0 },
    { key: 'dispute', label: 'Dispute', total: 42, autoShare: 0 },
  ],
};

/**
 * The intent rows for the window and scope.
 *
 * Totals are counted, so scope scales them and they round to whole queries;
 * the auto share is a rate, so it does not. A row can round to nothing,
 * which is the reason the row still renders — an intent with no queries in
 * the window is a fact about the window, not a row to hide.
 */
export function intentsFor(
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
export function intentSplit(row: IntentRow): {
  auto: number;
  routed: number;
} {
  const auto = Math.round((row.total * row.autoShare) / 100);
  return { auto, routed: row.total - auto };
}

/**
 * Why a query went to a person. Counted, so scope scales it.
 *
 * `GRN not posted in the ERP` is the frame's `GRN not posted in SAP`: the
 * house rule is to name the system by its role, since the same reason
 * arrives from whichever ERP a deployment runs.
 */
export interface DriverRow {
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

export function driversFor(
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
 * be unreadable. The leader fills the track and the rest are read off it.
 */
export function shareOfLeader(
  count: number,
  rows: readonly DriverRow[]
): number {
  const leader = rows.reduce((most, row) => Math.max(most, row.count), 0);
  return leader === 0 ? 0 : (count / leader) * 100;
}

/* ------------------------------------------------------------------ *
 * The coverage summary
 * ------------------------------------------------------------------ */

/**
 * The sentence the coverage card leads with, from the window's own days.
 *
 * Three cases, and each of them is a different thing to say: no days broke
 * the floor, some did, or the window is one day long and there is no trend
 * to describe at all.
 */
export function coverageSummary(days: number): string {
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
