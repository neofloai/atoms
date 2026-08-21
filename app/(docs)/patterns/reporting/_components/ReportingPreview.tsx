'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Card } from '@/src/components/Card';
import { CardContent } from '@/src/components/Card';
import { Chip } from '@/src/components/Chip';
import { Divider } from '@/src/components/Divider';
import { IconButton } from '@/src/components/IconButton';
import { MenuItem } from '@/src/components/MenuItem';
import { Navbar } from '@/src/components/Navbar';
import { LinearProgress } from '@/src/components/Progress';
import { Select } from '@/src/components/Select';
import { ToggleButton, ToggleButtonGroup } from '@/src/components/ToggleButton';
import { Tooltip } from '@/src/components/Tooltip';
import { border, icon, surface } from '@/src/tokens';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  InfoIcon,
  SidebarSimpleIcon,
} from '@/src/icons';

// The rail every screen in this app mounts, imported rather than redrawn.
// Its main menu already carries the `analytics` row this screen is, which is
// the row that has to read as selected here.
import { AppRail } from '../../../components/drawer/_components/AppRail';
import {
  AGENTS,
  COVERAGE_METRIC,
  Digits,
  ENTITIES,
  RANGES,
  SECTIONS,
  adoptionFor,
  breachesFor,
  comparisonLabel,
  coverageSummary,
  driversFor,
  formatDelta,
  formatValue,
  intentSplit,
  intentsFor,
  report,
  seriesFor,
  shareOfLeader,
} from './reportingRecord';

import type {
  AdoptionShare,
  DriverRow,
  IntentRow,
  Metric,
  RangeKey,
  Reported,
  Scope,
  Section,
} from './reportingRecord';

/** Tall enough for the three bands and the two panels under them. */
const FRAME_HEIGHT_PX = 900;

/** The band the filters sit in. The frame's own height. */
const BAND_HEIGHT_PX = 64;

/** Gap between cards in a row, and between the bands. */
const CARD_GAP = 2;
const SECTION_GAP = 5;

/**
 * The coverage card's width.
 *
 * The frame gives it 620 of 1288 because it holds a trend line. This one
 * holds the finding that line was drawn to deliver — which days broke the
 * floor — so it takes the narrower half and leaves the accuracy grid the
 * rest.
 */
const COVERAGE_CARD_WIDTH_PX = 380;

/** Bar heights: the frame's 8px row bar and its 12px summary bar. */
const BAR_HEIGHT_PX = 8;
const ADOPTION_BAR_HEIGHT_PX = 12;

/** The legend's dot, and the glyph beside every card title. */
const LEGEND_DOT_PX = 8;
const INFO_GLYPH_PX = 16;

/** The arrow inside a trend pill, sized to sit on a 13px label. */
const PILL_ARROW_PX = 12;

/**
 * Segment labels keep the case they are written in.
 *
 * `ToggleButton` uppercases its label, which is Material's default and right
 * for a word. It is wrong for a unit: `7d` and `30d` are a number and a
 * lowercase day, and `7D` / `30D` say something else. The rail's nav rows
 * turn the same transform off for the same kind of reason.
 */
const SEGMENT_CASE = { textTransform: 'none' } as const;

type SeriesRole = 'success' | 'information' | 'warning' | 'error';

/**
 * The four series colours, as roles rather than ramp values.
 *
 * The frame paints these segments `green/300`, `blue/300`, `yellow/300` and
 * `red/300`. Those are the light-mode values of `icon.<role>.accent`, which
 * is the same colour with a name and a dark-mode partner — so the roles are
 * what is used here, and the bars keep working when the page is inverted.
 *
 * The `applyStyles` callbacks are written out at each call site rather than
 * hoisted, so the theme argument stays inferred from `sx` and the snippet can
 * mirror this without importing a `Theme` type it has no route to.
 */
const SERIES = {
  success: icon.success.accent,
  information: icon.information.accent,
  warning: icon.warning.accent,
  error: icon.error.accent,
} as const;

/** The unfilled part of any bar on the screen. One token, one meaning. */
const TRACK = surface.default.defaultHover;

/**
 * The info glyph the frame draws on every card title, with something behind
 * it.
 *
 * The frame draws fourteen of these and defines none of them. A glyph that
 * explains nothing is decoration, and this is also the only place the
 * screen can say that three of its tiles are measured on a different window
 * from the one the band selects — so the tooltip is what makes the
 * evaluation-window tiles honest rather than merely stale.
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

InfoGlyph.displayName = 'InfoGlyph';

/**
 * The trend pill: the arrow says which way, the colour says whether that is
 * good.
 *
 * Those are two different questions and the frame answers them with one
 * mark, which is how it ends up drawing a down arrow on a rate that went up.
 * Here the arrow is the sign of the delta and nothing else, and the role
 * comes from the metric's own `better` — so a rising containment rate and a
 * rising failed-auth override rate both point up, and only one of them is
 * green.
 */
function TrendPill({
  reported,
  comparison,
}: {
  reported: Reported;
  comparison: string;
}) {
  const { improved, delta } = reported;
  const Arrow = delta > 0 ? ArrowUpIcon : ArrowDownIcon;

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

TrendPill.displayName = 'TrendPill';

/**
 * The figure, with its unit split off and set smaller.
 *
 * One treatment for all fourteen tiles, which is what lets a percentage, a
 * duration and a count of hours sit in one row without any of them reading
 * as a different kind of thing.
 */
function Figure({ reported }: { reported: Reported }) {
  const { figure, unit } = formatValue(reported);

  return (
    <Stack direction="row" sx={{ gap: 0.5, alignItems: 'baseline' }}>
      <Typography variant="h3" component="p">
        <Digits>{figure}</Digits>
      </Typography>
      <Typography variant="h4" component="span" color="text.secondary">
        {unit}
      </Typography>
    </Stack>
  );
}

Figure.displayName = 'Figure';

/** One tile. Title and glyph, the figure, then either a pill or a note. */
function MetricCard({
  reported,
  comparison,
}: {
  reported: Reported;
  comparison: string;
}) {
  const { metric } = reported;

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
            what the frame does on the accuracy trio. Otherwise
            `Intent-classification accuracy` wrapping to two lines would push
            its 95.2 a line below the 95.2 beside it, and two equal numbers
            would stop reading as equal. Where a pill or a note follows, that
            element is the one pinned to the bottom instead. */}
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

MetricCard.displayName = 'MetricCard';

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

SectionHeading.displayName = 'SectionHeading';

/**
 * A bar made of more than one part.
 *
 * `LinearProgress` draws one value against a track, which is every bar on
 * this screen except two: the adoption bar carries four shares of one
 * hundred, and an intent row carries what the agent answered beside what it
 * handed on. Both are compositions of the same track and the same role
 * fills rather than a second progress component — see the pattern notes for
 * the gap this leaves in the library.
 *
 * Widths come from the shares. Nothing here is measured off the frame, whose
 * own bars disagree with the numbers printed beside them — it draws a green
 * bar over half the track on a row labelled `0% auto`.
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

SegmentedBar.displayName = 'SegmentedBar';

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
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          <Digits>{value}</Digits>
        </Typography>
      ) : null}
    </Stack>
  );
}

LegendItem.displayName = 'LegendItem';

/**
 * The row every bar card is built from: a label, a figure, and a bar.
 *
 * One component for both cards, because both ask the same question of a row
 * — how much of this, against what — and drawing them twice would let the
 * two drift.
 */
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
        <Typography variant="body1" sx={{ fontWeight: 500, minWidth: 0 }} noWrap>
          {label}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          noWrap
          sx={{ flexShrink: 0 }}
        >
          <Digits>{value}</Digits>
        </Typography>
      </Stack>
      {children}
    </Stack>
  );
}

BarRow.displayName = 'BarRow';

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

PanelCard.displayName = 'PanelCard';

/**
 * The coverage card: the rate, and the days that broke the floor.
 *
 * The frame plots thirty points and labels the four under its rule. Atoms
 * ships no chart primitive and none is hand-drawn here — for the trend line
 * itself, reach for **Recharts** (recommended) and hand it the same series.
 * What is kept is the part the labels carried: which days failed and by how
 * much, which is the only thing on that chart anybody acts on.
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
      : (window[0]?.date ?? '');

  return (
    <Card
      sx={{
        width: COVERAGE_CARD_WIDTH_PX,
        flexShrink: 0,
        display: 'flex',
      }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" sx={{ gap: 1.5, alignItems: 'flex-start' }}>
          <Typography variant="h6" component="h4" sx={{ minWidth: 0 }}>
            {COVERAGE_METRIC.label}
          </Typography>
          <InfoGlyph help={COVERAGE_METRIC.help} />
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
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  <Digits>{day.rate.toFixed(1)}%</Digits>
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

CoverageCard.displayName = 'CoverageCard';

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

AdoptionCard.displayName = 'AdoptionCard';

/**
 * One intent row.
 *
 * A row with no queries in the window still renders. An intent that nobody
 * asked about is a fact about the window, and hiding it would make the card
 * shorter every time the range narrowed — the reader would have to notice an
 * absence to learn anything.
 */
function IntentBar({ row }: { row: IntentRow }) {
  const { auto, routed } = intentSplit(row);

  if (row.total === 0) {
    return (
      <BarRow label={row.label} value="none this window">
        <SegmentedBar
          height={BAR_HEIGHT_PX}
          label="No queries"
          segments={[]}
        />
      </BarRow>
    );
  }

  return (
    <BarRow
      label={row.label}
      value={
        String(row.autoShare) + '% auto · ' + String(row.total) + ' total'
      }
    >
      {/* The bar is the share the label prints, not the rounded query
          counts: `41 total` at `62% auto` rounds to 25 whole queries, which
          is 61% of 41 — and a bar a point off the number beside it is the
          exact disagreement this card exists to avoid. The counts are the
          same figure at a coarser resolution, so they go on the label a
          screen reader gets. */}
      <SegmentedBar
        height={BAR_HEIGHT_PX}
        label={
          String(auto) + ' auto-answered, ' + String(routed) + ' routed on'
        }
        segments={[
          { key: 'auto', share: row.autoShare, role: 'success' },
          { key: 'routed', share: 100 - row.autoShare, role: 'warning' },
        ]}
      />
    </BarRow>
  );
}

IntentBar.displayName = 'IntentBar';

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

DriverBar.displayName = 'DriverBar';

/**
 * The reporting screen: what the agent did, over a window you choose.
 *
 * ## It reports, and it does not act
 *
 * There is no `Proceed`, no `Reject`, no row that opens a record. That is
 * deliberate and it is the line between this screen and the invoice
 * processing workflow: the stages decide what happens to one invoice, and
 * this looks back at what happened to all of them. A control here that
 * changed something would put a decision on a page nobody reads twice.
 *
 * ## One band chooses the window, and everything under it re-reads
 *
 * Range, entity and agent are the only inputs. Every figure, every bar
 * width, every comparison label and the coverage summary are derived from
 * them on each render — which is what makes the band worth having, and what
 * stops a stale figure sitting under a changed heading.
 *
 * ## Three tiles do not follow the band, and say so
 *
 * The accuracy trio comes off an evaluation job with its own window. The
 * frame draws an info glyph on all fourteen cards and defines none of them;
 * those glyphs are where that difference is stated, rather than in a caption
 * no designer has drawn.
 */
export function ReportingPreview(): React.JSX.Element {
  const [collapsed, setCollapsed] = React.useState(true);
  const [range, setRange] = React.useState<RangeKey>('30d');
  const [entityKey, setEntityKey] = React.useState(ENTITIES[0].key);
  const [agentKey, setAgentKey] = React.useState(AGENTS[0].key);

  const entity: Scope =
    ENTITIES.find((item) => item.key === entityKey) ?? ENTITIES[0];
  const agent: Scope = AGENTS.find((item) => item.key === agentKey) ?? AGENTS[0];
  const days = RANGES.find((item) => item.key === range)?.days ?? 30;
  const comparison = comparisonLabel(range, days);

  const read = React.useCallback(
    (metric: Metric) => report(metric, range, entity, agent, days),
    [range, entity, agent, days]
  );

  const intents = intentsFor(range, entity, agent);
  const drivers = driversFor(range, entity, agent);
  const adoption = adoptionFor(range);

  const [performanceGrid, coverage] = [
    SECTIONS[1].metrics,
    read(COVERAGE_METRIC),
  ];

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
              onChange={(_, next: RangeKey | null) => {
                if (next !== null) setRange(next);
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
              onChange={(_, next: string | null) => {
                if (next !== null) setEntityKey(next);
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
            {/* Outcomes */}
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
              <Stack direction="row" sx={{ gap: CARD_GAP, alignItems: 'stretch' }}>
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

            {/* Security & accuracy */}
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

            {/* The two breakdowns, under no heading of their own — they
                answer "where did the work go" and "why", which is a question
                about all three bands above rather than a fourth band. */}
            <Stack direction="row" sx={{ gap: CARD_GAP, alignItems: 'stretch' }}>
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

ReportingPreview.displayName = 'ReportingPreview';
