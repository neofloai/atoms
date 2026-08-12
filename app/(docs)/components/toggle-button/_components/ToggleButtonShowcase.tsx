'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Divider } from '@/src/components/Divider';
import { IconButton } from '@/src/components/IconButton';
import {
  ToggleButton,
  ToggleButtonGroup,
} from '@/src/components/ToggleButton';
import {
  CaretDownIcon,
  CursorIcon,
  EraserIcon,
  GridFourIcon,
  ListIcon,
  PencilSimpleIcon,
  PushPinIcon,
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  TextBIcon,
  TextItalicIcon,
  TextUnderlineIcon,
} from '@/src/icons';
import { border, elevation, radius, spacing, surface } from '@/src/tokens';

import type { ToggleButtonColor } from '@/src/components/ToggleButton';

/** Every colour role, in the order the props table lists them. */
const COLORS: readonly ToggleButtonColor[] = [
  'secondary',
  'primary',
  'success',
  'error',
  'warning',
  'information',
];

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

/** One labelled cell, so a row of samples reads without a legend. */
function Sample({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={1} sx={{ alignItems: 'flex-start', minWidth: 96 }}>
      {children}
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}

Sample.displayName = 'Sample';

/**
 * The floating toolbar from node 3763:5099 — the design's own sample
 * composition. Two groups so alignment and formatting keep separate
 * selections, a `Divider` between them, and the surface, radius, shadow,
 * padding and gap taken from the tokens the frame binds.
 *
 * The frame's padding is `Scale/50` — 2px, which has no rung on the
 * component spacing ladder, so it stays a literal — and the 1px border
 * comes out of it, exactly as every component here reserves its own
 * border. Figma paints the stroke inside the 2px band, so 1px of padding
 * plus a 1px border reproduces both the visible gap and the frame's 36px
 * height. Without the subtraction the bar renders 38px.
 */
function FloatingToolbar() {
  const [align, setAlign] = React.useState<string>('left');
  const [marks, setMarks] = React.useState<string[]>(['bold', 'underline']);

  return (
    <Box
      sx={(theme) => ({
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${spacing.component.xxs}px`,
        padding: '1px',
        borderRadius: `${radius.sm}px`,
        border: '1px solid',
        boxShadow: elevation.small,
        backgroundColor: surface.layers.card1.light,
        borderColor: border.layers.card1.light,
        ...theme.applyStyles('dark', {
          backgroundColor: surface.layers.card1.dark,
          borderColor: border.layers.card1.dark,
        }),
      })}
    >
      <ToggleButtonGroup
        exclusive
        size="sm"
        appearance="text"
        value={align}
        onChange={(_, next: string | null) => next && setAlign(next)}
        aria-label="Text alignment"
      >
        <ToggleButton value="left" aria-label="Align left">
          <TextAlignLeftIcon />
        </ToggleButton>
        <ToggleButton value="center" aria-label="Align centre">
          <TextAlignCenterIcon />
        </ToggleButton>
        <ToggleButton value="right" aria-label="Align right">
          <TextAlignRightIcon />
        </ToggleButton>
      </ToggleButtonGroup>

      {/* Full height, no inset: the frame's rule (node 3763:5150) is 32px
          tall, exactly as tall as the toggles beside it. */}
      <Divider orientation="vertical" flexItem />

      <ToggleButtonGroup
        size="sm"
        appearance="text"
        value={marks}
        onChange={(_, next: string[]) => setMarks(next)}
        aria-label="Text formatting"
      >
        <ToggleButton value="bold" aria-label="Bold">
          <TextBIcon />
        </ToggleButton>
        <ToggleButton value="italic" aria-label="Italic">
          <TextItalicIcon />
        </ToggleButton>
        <ToggleButton value="underline" aria-label="Underline">
          <TextUnderlineIcon />
        </ToggleButton>
      </ToggleButtonGroup>

      {/* A caret opens a menu rather than staying pressed, so it is an
          IconButton — the one item in the Figma sample that is not a
          toggle. */}
      <IconButton
        variant="secondary"
        appearance="text"
        size="sm"
        aria-label="More text options"
      >
        <CaretDownIcon />
      </IconButton>
    </Box>
  );
}

FloatingToolbar.displayName = 'FloatingToolbar';

/** Live rendering of every ToggleButton axis: selection, colour, size, appearance. */
export function ToggleButtonShowcase() {
  const [align, setAlign] = React.useState<string | null>('center');
  const [marks, setMarks] = React.useState<string[]>(['bold']);
  const [view, setView] = React.useState<string>('list');
  const [pinned, setPinned] = React.useState(false);
  const [period, setPeriod] = React.useState<string>('week');
  const [tool, setTool] = React.useState<string>('draw');
  const [dense, setDense] = React.useState<string | null>('sm');
  const [roleSelection, setRoleSelection] = React.useState<
    Record<string, string[]>
  >(() => Object.fromEntries(COLORS.map((color) => [color, ['on']])));

  return (
    <Stack spacing={4}>
      <PreviewCard
        title="Two selection models"
        description="`exclusive` makes the buttons alternatives and `value` a single item — press the selected one again and you get `null`. Without it they are independent and `value` is an array. That one prop is the whole difference between a segmented control and a toolbar."
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={4}
          sx={{ flexWrap: 'wrap', rowGap: 3 }}
        >
          <Sample label={`exclusive — ${align ?? 'null'}`}>
            <ToggleButtonGroup
              exclusive
              value={align}
              onChange={(_, next: string | null) => setAlign(next)}
              aria-label="Text alignment"
            >
              <ToggleButton value="left" aria-label="Align left">
                <TextAlignLeftIcon />
              </ToggleButton>
              <ToggleButton value="center" aria-label="Align centre">
                <TextAlignCenterIcon />
              </ToggleButton>
              <ToggleButton value="right" aria-label="Align right">
                <TextAlignRightIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Sample>
          <Sample label={`multiple — [${marks.join(', ')}]`}>
            <ToggleButtonGroup
              value={marks}
              onChange={(_, next: string[]) => setMarks(next)}
              aria-label="Text formatting"
            >
              <ToggleButton value="bold" aria-label="Bold">
                <TextBIcon />
              </ToggleButton>
              <ToggleButton value="italic" aria-label="Italic">
                <TextItalicIcon />
              </ToggleButton>
              <ToggleButton value="underline" aria-label="Underline">
                <TextUnderlineIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Sample>
          <Sample label={`always one — ${view}`}>
            <ToggleButtonGroup
              exclusive
              value={view}
              onChange={(_, next: string | null) => next && setView(next)}
              aria-label="Result layout"
            >
              <ToggleButton value="list" aria-label="List">
                <ListIcon />
              </ToggleButton>
              <ToggleButton value="grid" aria-label="Grid">
                <GridFourIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Sample>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="On its own, and with a label"
        description="A single toggle needs no group: `selected` is yours to pass and `value` is only there for `onChange` to hand back. Children are arbitrary, so a word works as well as a glyph — and a labelled toggle needs no `aria-label`."
      >
        <Stack
          direction="row"
          spacing={4}
          sx={{ flexWrap: 'wrap', rowGap: 3, alignItems: 'flex-start' }}
        >
          <Sample label={pinned ? 'selected' : 'unselected'}>
            <ToggleButton
              value="pinned"
              selected={pinned}
              onChange={() => setPinned(!pinned)}
              aria-label="Pin this thread"
            >
              <PushPinIcon />
            </ToggleButton>
          </Sample>
          <Sample label="labelled">
            <ToggleButtonGroup
              exclusive
              value={period}
              onChange={(_, next: string | null) => next && setPeriod(next)}
              aria-label="Period"
            >
              <ToggleButton value="day">Day</ToggleButton>
              <ToggleButton value="week">Week</ToggleButton>
              <ToggleButton value="month">Month</ToggleButton>
            </ToggleButtonGroup>
          </Sample>
          <Sample label="glyph and label">
            <ToggleButton
              value="grid"
              selected={view === 'grid'}
              onChange={() => setView(view === 'grid' ? 'list' : 'grid')}
            >
              <GridFourIcon />
              Grid
            </ToggleButton>
          </Sample>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Colour roles"
        description="`color` reaches the selected state only — an unselected toggle is neutral whatever it says, which is MUI's own behaviour. Only `secondary` is drawn in Figma; the other five borrow the fill-and-ink pairing a selected Chip already uses."
      >
        <Stack spacing={3}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ flexWrap: 'wrap', rowGap: 3, alignItems: 'flex-start' }}
          >
            {COLORS.map((color) => (
              <Sample key={color} label={color}>
                <ToggleButtonGroup
                  color={color}
                  value={roleSelection[color]}
                  onChange={(_, next: string[]) =>
                    setRoleSelection((prev) => ({ ...prev, [color]: next }))
                  }
                  aria-label={`Example, ${color}`}
                >
                  <ToggleButton value="on" aria-label={`${color}, selected`}>
                    <TextBIcon />
                  </ToggleButton>
                  <ToggleButton value="off" aria-label={`${color}, unselected`}>
                    <TextItalicIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Sample>
            ))}
          </Stack>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Sizes and chrome"
        description="Two sizes — a 36px box with a 20px glyph, or 32px with 16px. `appearance` is the Figma `border` axis: `outline` draws the hairline, `text` draws none and is for toggles sitting on a surface that already has an edge."
      >
        <Stack spacing={3}>
          <Stack
            direction="row"
            spacing={4}
            sx={{ flexWrap: 'wrap', rowGap: 3, alignItems: 'flex-start' }}
          >
            <Sample label="md — 36px">
              <ToggleButtonGroup
                exclusive
                value={dense}
                onChange={(_, next: string | null) => next && setDense(next)}
                aria-label="Density, md"
              >
                <ToggleButton value="md" aria-label="Comfortable">
                  <ListIcon />
                </ToggleButton>
                <ToggleButton value="sm" aria-label="Compact">
                  <GridFourIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </Sample>
            <Sample label="sm — 32px">
              <ToggleButtonGroup
                exclusive
                size="sm"
                value={dense}
                onChange={(_, next: string | null) => next && setDense(next)}
                aria-label="Density, sm"
              >
                <ToggleButton value="md" aria-label="Comfortable">
                  <ListIcon />
                </ToggleButton>
                <ToggleButton value="sm" aria-label="Compact">
                  <GridFourIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </Sample>
            <Sample label="text — standalone">
              <ToggleButton
                value="pinned"
                appearance="text"
                selected
                aria-label="Pinned"
              >
                <PushPinIcon />
              </ToggleButton>
            </Sample>
            <Sample label="sx — pill corners">
              <ToggleButton
                value="pinned"
                selected
                sx={{ borderRadius: '9999px' }}
                aria-label="Pinned, pill"
              >
                <PushPinIcon />
              </ToggleButton>
            </Sample>
            <Sample label="text — grouped, 4px apart">
              <ToggleButtonGroup
                appearance="text"
                value={['bold']}
                aria-label="Example, borderless group"
              >
                <ToggleButton value="bold" aria-label="Bold">
                  <TextBIcon />
                </ToggleButton>
                <ToggleButton value="italic" aria-label="Italic">
                  <TextItalicIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </Sample>
          </Stack>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Stacked, and filling the width"
        description={
          '`orientation="vertical"` for a rail beside a canvas; the shared borders and squared corners follow the axis. `fullWidth` splits the container between the buttons.'
        }
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={4}
          sx={{ alignItems: 'flex-start' }}
        >
          <ToggleButtonGroup
            orientation="vertical"
            exclusive
            value={tool}
            onChange={(_, next: string | null) => next && setTool(next)}
            aria-label="Tool"
          >
            <ToggleButton value="select" aria-label="Select">
              <CursorIcon />
            </ToggleButton>
            <ToggleButton value="draw" aria-label="Draw">
              <PencilSimpleIcon />
            </ToggleButton>
            <ToggleButton value="erase" aria-label="Erase">
              <EraserIcon />
            </ToggleButton>
          </ToggleButtonGroup>
          <Box sx={{ flex: 1, minWidth: 0, maxWidth: 420 }}>
            <ToggleButtonGroup
              fullWidth
              exclusive
              value={period}
              onChange={(_, next: string | null) => next && setPeriod(next)}
              aria-label="Period, full width"
            >
              <ToggleButton value="day">Day</ToggleButton>
              <ToggleButton value="week">Week</ToggleButton>
              <ToggleButton value="month">Month</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="A floating toolbar"
        description="The sample composition from the design file, live. Borderless toggles on a card that already carries the border and the shadow, 4px apart, with a Divider between the two groups — and the caret rendered as an IconButton, since it opens a menu rather than staying pressed."
      >
        <FloatingToolbar />
      </PreviewCard>

      <PreviewCard
        title="Disabled"
        description="A disabled toggle that is still selected keeps a fill, so “on but unavailable” and “off but unavailable” stay different. `disabled` on the group reaches every child."
      >
        <Stack
          direction="row"
          spacing={4}
          sx={{ flexWrap: 'wrap', rowGap: 3, alignItems: 'flex-start' }}
        >
          <Sample label="off, disabled">
            <ToggleButton value="a" disabled aria-label="Unavailable, off">
              <TextBIcon />
            </ToggleButton>
          </Sample>
          <Sample label="on, disabled">
            <ToggleButton
              value="b"
              disabled
              selected
              aria-label="Unavailable, on"
            >
              <TextBIcon />
            </ToggleButton>
          </Sample>
          <Sample label="whole group">
            <ToggleButtonGroup
              disabled
              value={['center']}
              aria-label="Example, disabled group"
            >
              <ToggleButton value="left" aria-label="Align left">
                <TextAlignLeftIcon />
              </ToggleButton>
              <ToggleButton value="center" aria-label="Align centre">
                <TextAlignCenterIcon />
              </ToggleButton>
              <ToggleButton value="right" aria-label="Align right">
                <TextAlignRightIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Sample>
        </Stack>
      </PreviewCard>
    </Stack>
  );
}

ToggleButtonShowcase.displayName = 'ToggleButtonShowcase';
