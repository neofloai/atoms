'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import { Alert } from '@/src/components/Alert';
import { Button } from '@/src/components/Button';
import { Chip } from '@/src/components/Chip';
import { Collapse } from '@/src/components/Collapse';
import { Fade } from '@/src/components/Fade';
import { Grow } from '@/src/components/Grow';
import { Slide } from '@/src/components/Slide';
import { Zoom } from '@/src/components/Zoom';

import type { SlideDirection } from '@/src/components/Slide';

/**
 * Live previews for the Animations page.
 *
 * A transition cannot be documented in prose or in a screenshot — the
 * thing being described is the part that happens between two frames.
 * So every preview here is driven by a real control, and the page is
 * deliberately the only place in the docs where the reader is expected
 * to click something before they have learned anything.
 *
 * Two previews exist to answer questions the prose can only assert:
 *
 *   - "Side by side" runs all five off one boolean, because the useful
 *     question is not what a `Fade` looks like but which of the five
 *     to reach for — and that is a comparison, not a description.
 *   - "Reduced motion" reads the OS setting live and says which
 *     branch the reader is currently in. The claim that the theme
 *     honours `prefers-reduced-motion` is exactly the kind that gets
 *     made and never checked.
 *
 * Previews import from `@/src/components/*`, so the page exercises the
 * same export path a consumer of `@neoflo/atoms` would take.
 */

function PreviewCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      {hint && (
        <Typography variant="body2" color="text.secondary">
          {hint}
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
 * A neutral block for the transitions to move, so nothing distracts
 * from the movement itself.
 *
 * Deliberately a style object rather than a `<Swatch />` component:
 * the transition writes `style` onto its child and needs a `ref` on
 * it, so a plain function component wrapping this would swallow both
 * and throw. That is the "children must hold a ref" rule in the props
 * table, and the previews should be written the way the rule says
 * rather than demonstrate the exception to it.
 */
const SWATCH_SX = {
  display: 'grid',
  placeItems: 'center',
  height: 72,
  borderRadius: 2,
  bgcolor: 'primary.main',
  color: 'primary.contrastText',
  fontSize: 13,
  fontWeight: 700,
} as const;

const TRANSITION_LABELS = [
  'Fade',
  'Grow',
  'Zoom',
  'Slide',
  'Collapse',
] as const;

/**
 * One cell of the side-by-side row.
 *
 * `Slide` is the reason this is a component rather than four lines
 * inline: it needs `container` pointing at the clipping box, and that
 * means holding the node in state. Without it the offset is measured
 * against the window, so the swatch is thrown a few hundred pixels out
 * of a 72px-tall cell and only the last fraction of its 225ms happens
 * anywhere the reader can see — a pop, not a slide.
 */
function TransitionCell({
  label,
  shown,
}: {
  label: (typeof TRANSITION_LABELS)[number];
  shown: boolean;
}) {
  const [container, setContainer] = React.useState<HTMLElement | null>(null);

  // Collapse is supposed to change the layout, so its cell is left free
  // to do so; the other four get a reserved height and a clip.
  if (label === 'Collapse') {
    return (
      <Collapse in={shown} timeout="auto">
        <Box sx={SWATCH_SX}>{label}</Box>
      </Collapse>
    );
  }

  return (
    <Box
      ref={setContainer}
      sx={{ position: 'relative', minHeight: 72, overflow: 'hidden' }}
    >
      {label === 'Fade' && (
        <Fade in={shown}>
          <Box sx={SWATCH_SX}>{label}</Box>
        </Fade>
      )}
      {label === 'Grow' && (
        <Grow in={shown}>
          <Box sx={SWATCH_SX}>{label}</Box>
        </Grow>
      )}
      {label === 'Zoom' && (
        <Zoom in={shown}>
          <Box sx={SWATCH_SX}>{label}</Box>
        </Zoom>
      )}
      {label === 'Slide' && (
        <Slide direction="up" in={shown} container={container}>
          <Box sx={SWATCH_SX}>{label}</Box>
        </Slide>
      )}
    </Box>
  );
}

TransitionCell.displayName = 'TransitionCell';

/**
 * All five, one boolean. Each cell reserves its own height so the row
 * does not reflow as the four non-collapsing transitions come and go —
 * except under Collapse, which is *supposed* to change the layout, and
 * whose cell is therefore left to do so.
 */
function SideBySide() {
  const [shown, setShown] = React.useState(true);

  return (
    <PreviewCard
      title="The five, side by side"
      hint="One boolean drives all of them. The useful question is not what each looks like on its own but which to reach for — and only Collapse changes the height of its cell."
    >
      <Stack spacing={3}>
        <Button
          variant="primary"
          appearance="outline"
          size="sm"
          onClick={() => setShown((value) => !value)}
          sx={{ alignSelf: 'flex-start' }}
        >
          {shown ? 'Hide all' : 'Show all'}
        </Button>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(5, 1fr)',
            },
            gap: 2,
            alignItems: 'start',
          }}
        >
          {TRANSITION_LABELS.map((label) => (
            <Stack key={label} spacing={1}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 700 }}
              >
                {label}
              </Typography>
              <TransitionCell label={label} shown={shown} />
            </Stack>
          ))}
        </Box>
      </Stack>
    </PreviewCard>
  );
}

SideBySide.displayName = 'SideBySide';

const DIRECTIONS: readonly SlideDirection[] = ['up', 'down', 'left', 'right'];

/**
 * `direction` names where the child comes *from*, which reads backwards
 * to most people the first time. Four buttons and one panel settle it
 * faster than a sentence can.
 *
 * Two things here are load-bearing and were each got wrong first time:
 *
 *   - **Replaying is a remount, not a toggle.** Setting `in` to false
 *     and back to true in the same handler — even across a
 *     `requestAnimationFrame` — lands both commits before the browser
 *     paints, so the start value of the transition is never rendered
 *     and no animation runs at all. Bumping a key remounts the
 *     `Slide`, which enters cleanly because `appear` defaults to true.
 *     (And `appear={false}` would defeat exactly that, so it is gone.)
 *   - **`container` is passed.** Without it the offset is measured
 *     against the window, so a panel inside a 140px-tall box is thrown
 *     most of a screen away and spends nearly all of its 225ms outside
 *     the clip, arriving as a snap. Measured against the box, the whole
 *     travel is visible. It is the fix this component's own docs
 *     recommend, so the preview should be the one demonstrating it.
 */
function SlideDirections() {
  const [direction, setDirection] = React.useState<SlideDirection>('up');
  const [shown, setShown] = React.useState(true);
  const [replay, setReplay] = React.useState(0);

  // Held in state rather than a ref so the first render after the node
  // attaches passes it down; a ref's `.current` is still null then.
  const [container, setContainer] = React.useState<HTMLElement | null>(null);

  const pick = (next: SlideDirection) => {
    setDirection(next);
    setShown(true);
    setReplay((count) => count + 1);
  };

  return (
    <PreviewCard
      title="Slide directions"
      hint="direction names where the child enters from, not where it travels to — “up” starts below and moves upward. Pick a direction to replay the entrance, or use Hide to watch it leave the way it came."
    >
      <Stack spacing={3}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center' }}
        >
          {DIRECTIONS.map((value) => (
            <Button
              key={value}
              size="sm"
              variant="primary"
              appearance={value === direction ? 'contained' : 'outline'}
              onClick={() => pick(value)}
            >
              {value}
            </Button>
          ))}
          <Button
            size="sm"
            variant="primary"
            appearance="text"
            onClick={() => setShown((value) => !value)}
          >
            {shown ? 'Hide' : 'Show'}
          </Button>
        </Stack>
        <Box
          ref={setContainer}
          sx={{
            position: 'relative',
            overflow: 'hidden',
            display: 'grid',
            placeItems: 'center',
            height: 140,
            borderRadius: 2,
            bgcolor: 'action.hover',
          }}
        >
          <Slide
            key={`${direction}-${replay}`}
            direction={direction}
            in={shown}
            container={container}
          >
            <Box sx={{ ...SWATCH_SX, width: '60%' }}>from {direction}</Box>
          </Slide>
        </Box>
      </Stack>
    </PreviewCard>
  );
}

SlideDirections.displayName = 'SlideDirections';

const ARTICLE =
  'A design system is a contract, not a component library. The components are how the contract is delivered, but the value is in the agreement they encode: that this blue means primary, that this radius means control, that this duration means the interface responded. Change any of those in one place and every screen inherits it — which is only true if nobody has quietly written the value out by hand somewhere.';

/**
 * The two things `Collapse` does that the other four cannot: reflow the
 * page as it opens, and stop short of zero.
 */
function Disclosure() {
  const [open, setOpen] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const [alertShown, setAlertShown] = React.useState(true);

  return (
    <PreviewCard
      title="Collapse — disclosure, previews, and dismissal"
      hint="The only transition that changes layout. Watch the content below each one move rather than be covered."
    >
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Button
            variant="primary"
            appearance="text"
            size="sm"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="showcase-disclosure"
            sx={{ alignSelf: 'flex-start' }}
          >
            {open ? 'Hide details' : 'Show details'}
          </Button>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box id="showcase-disclosure">
              <Typography variant="body2" color="text.secondary">
                The trigger carries <code>aria-expanded</code> and{' '}
                <code>aria-controls</code>. Collapse supplies neither — it
                animates a height and nothing else, so the semantics are
                yours to wire.
              </Typography>
            </Box>
          </Collapse>
        </Stack>

        <Stack spacing={1}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 700 }}
          >
            collapsedSize — a preview instead of nothing
          </Typography>
          <Collapse in={expanded} collapsedSize={44}>
            <Typography variant="body2" color="text.secondary">
              {ARTICLE}
            </Typography>
          </Collapse>
          <Button
            variant="primary"
            appearance="text"
            size="sm"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            sx={{ alignSelf: 'flex-start' }}
          >
            {expanded ? 'Read less' : 'Read more'}
          </Button>
        </Stack>

        <Stack spacing={1}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 700 }}
          >
            Dismissal without a jump
          </Typography>
          <Collapse in={alertShown} unmountOnExit>
            <Alert severity="info" onClose={() => setAlertShown(false)}>
              Removing this outright would snap everything below it upward.
            </Alert>
          </Collapse>
          {!alertShown && (
            <Button
              variant="primary"
              appearance="outline"
              size="sm"
              onClick={() => setAlertShown(true)}
              sx={{ alignSelf: 'flex-start' }}
            >
              Bring it back
            </Button>
          )}
        </Stack>
      </Stack>
    </PreviewCard>
  );
}

Disclosure.displayName = 'Disclosure';

const EXIT_MS = 195;

/**
 * The overlap problem, shown both ways: two `Zoom`s sharing a slot
 * collide unless the entering one waits out the exiting one.
 */
function SwapSlot() {
  const [index, setIndex] = React.useState(0);
  const [stagger, setStagger] = React.useState(true);
  const labels = ['One', 'Two', 'Three'];

  return (
    <PreviewCard
      title="Zoom — two controls, one slot"
      hint="Turn the delay off and the outgoing and incoming controls scale through each other. The fixed-size container is what stops the row beside them from shifting."
    >
      <Stack spacing={3}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Button
            variant="primary"
            appearance="outline"
            size="sm"
            onClick={() => setIndex((value) => (value + 1) % labels.length)}
          >
            Next
          </Button>
          <Button
            variant="primary"
            appearance="text"
            size="sm"
            onClick={() => setStagger((value) => !value)}
          >
            {stagger ? 'Delay on' : 'Delay off'}
          </Button>
        </Stack>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Box sx={{ display: 'grid', width: 96, height: 40 }}>
            {labels.map((label, position) => (
              <Zoom
                key={label}
                in={index === position}
                timeout={{ enter: 225, exit: EXIT_MS }}
                style={{
                  transitionDelay:
                    stagger && index === position ? `${EXIT_MS}ms` : '0ms',
                }}
                unmountOnExit
              >
                <Box sx={{ gridArea: '1 / 1' }}>
                  <Chip label={label} variant="primary" />
                </Box>
              </Zoom>
            ))}
          </Box>
          <Typography variant="body2" color="text.secondary">
            The slot holds its size, so nothing here moves.
          </Typography>
        </Stack>
      </Stack>
    </PreviewCard>
  );
}

SwapSlot.displayName = 'SwapSlot';

/**
 * The theme sets `motion: { reducedMotion: 'system' }`. This reads the
 * same media query and reports which branch the reader is in, because
 * "it honours the OS setting" is precisely the kind of claim that
 * survives for years without anyone checking it.
 */
function ReducedMotion() {
  const theme = useTheme();
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [shown, setShown] = React.useState(true);

  return (
    <PreviewCard
      title="Reduced motion, live"
      hint="Every transition on this page reads the OS setting, because the theme opts in. Toggle Reduce motion in your system settings and this panel changes with it — no reload needed."
    >
      <Stack spacing={2.5}>
        <Alert severity={reduced ? 'success' : 'info'}>
          {reduced
            ? 'Your system asks for reduced motion, so the transitions below complete instantly. The state change still happens — only the tween is dropped.'
            : 'Your system has no reduced-motion preference set, so transitions run at their normal durations.'}
        </Alert>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Button
            variant="primary"
            appearance="outline"
            size="sm"
            onClick={() => setShown((value) => !value)}
          >
            {shown ? 'Hide' : 'Show'}
          </Button>
          <Box sx={{ minHeight: 72, width: 160, overflow: 'hidden' }}>
            <Grow in={shown}>
              <Box sx={SWATCH_SX}>Grow</Box>
            </Grow>
          </Box>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          <code>theme.motion.reducedMotion</code> is{' '}
          <code>{theme.motion.reducedMotion}</code>. MUI defaults it to{' '}
          <code>never</code>, which would ignore the OS entirely.
        </Typography>
      </Stack>
    </PreviewCard>
  );
}

ReducedMotion.displayName = 'ReducedMotion';

/**
 * The durations and easings every transition on this page defaults to,
 * read live from the theme rather than transcribed — the numbers in the
 * prose above are only trustworthy if they cannot drift from these.
 */
function Timings() {
  const theme = useTheme();
  const durations = [
    ['shortest', theme.transitions.duration.shortest],
    ['shorter', theme.transitions.duration.shorter],
    ['short', theme.transitions.duration.short],
    ['standard', theme.transitions.duration.standard],
    ['complex', theme.transitions.duration.complex],
    ['enteringScreen', theme.transitions.duration.enteringScreen],
    ['leavingScreen', theme.transitions.duration.leavingScreen],
  ] as const;
  const easings = [
    ['easeInOut', theme.transitions.easing.easeInOut],
    ['easeOut', theme.transitions.easing.easeOut],
    ['easeIn', theme.transitions.easing.easeIn],
    ['sharp', theme.transitions.easing.sharp],
  ] as const;

  return (
    <PreviewCard
      title="What the defaults resolve to"
      hint="Read live from theme.transitions. These are still MUI's Material values — the design library specifies no motion, so nothing here was invented."
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={4}
        sx={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 13 }}
      >
        <Stack spacing={0.75} sx={{ flex: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 700, fontFamily: 'inherit' }}
          >
            duration
          </Typography>
          {durations.map(([name, value]) => (
            <Stack
              key={name}
              direction="row"
              sx={{ justifyContent: 'space-between', gap: 2 }}
            >
              <Box component="span" sx={{ color: 'text.secondary' }}>
                {name}
              </Box>
              <Box component="span">{value}ms</Box>
            </Stack>
          ))}
        </Stack>
        <Stack spacing={0.75} sx={{ flex: 1.4, minWidth: 0 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 700, fontFamily: 'inherit' }}
          >
            easing
          </Typography>
          {easings.map(([name, value]) => (
            <Stack key={name} spacing={0.25}>
              <Box component="span" sx={{ color: 'text.secondary' }}>
                {name}
              </Box>
              <Box component="span" sx={{ wordBreak: 'break-all' }}>
                {value}
              </Box>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </PreviewCard>
  );
}

Timings.displayName = 'Timings';

export function AnimationsShowcase() {
  return (
    <Stack spacing={5}>
      <SideBySide />
      <SlideDirections />
      <Disclosure />
      <SwapSlot />
      <ReducedMotion />
      <Timings />
    </Stack>
  );
}

AnimationsShowcase.displayName = 'AnimationsShowcase';
