'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Avatar } from '@/src/components/Avatar';
import { Button } from '@/src/components/Button';
import { Skeleton } from '@/src/components/Skeleton';
import { surface } from '@/src/tokens';

/**
 * Live previews for the Skeleton page.
 *
 * Two of these are worth explaining.
 *
 * The "no layout shift" preview really loads: it swaps placeholders for
 * content on a timer, because that swap *is* the component's entire
 * reason to exist, and a static pair of before/after screenshots is
 * exactly the thing that cannot show whether the page moved.
 *
 * The "every surface" preview exists because this component's fill is
 * translucent rather than a token, which is the one design decision on
 * the page a reviewer is most likely to question. Rendering the same
 * skeleton on all four layers of the surface scale lets them check the
 * claim instead of taking it on trust.
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

const PEOPLE = [
  { name: 'Priya Raman', role: 'Design systems' },
  { name: 'Tomas Weber', role: 'Platform engineering' },
  { name: 'Aisha Nkemdi', role: 'Product research' },
];

/**
 * A row rendered twice from one layout — once with placeholders, once
 * with data. Sharing the markup is the point: if the two ever drift,
 * the preview stops demonstrating what it claims to.
 */
function PersonRow({
  person,
  loading,
}: {
  person: (typeof PEOPLE)[number];
  loading: boolean;
}) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
      {loading ? (
        <Skeleton variant="circular">
          <Avatar size="lg" />
        </Skeleton>
      ) : (
        <Avatar size="lg">{person.name.charAt(0)}</Avatar>
      )}
      <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body1">
          {loading ? <Skeleton width="45%" /> : person.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {loading ? <Skeleton width="65%" /> : person.role}
        </Typography>
      </Stack>
    </Stack>
  );
}

PersonRow.displayName = 'PersonRow';

const SURFACES = [
  { label: 'page', token: surface.layers.page },
  { label: 'card 1', token: surface.layers.card1 },
  { label: 'card 2', token: surface.layers.card2 },
  { label: 'card 3', token: surface.layers.card3 },
];

export function SkeletonShowcase() {
  const [loading, setLoading] = React.useState(true);
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // The swap cycles on its own, because watching the row *not* move is
  // the demonstration and nobody should have to find a button first.
  //
  // Except under reduced motion. The skeletons themselves go static
  // there, but a block of content rewriting itself every few seconds is
  // motion too — and it would be a poor look for the one component in
  // the library that exists to respect this setting to ignore it on its
  // own docs page. The button still drives the swap by hand.
  React.useEffect(() => {
    if (reduceMotion) return undefined;
    const timer = setInterval(() => setLoading((value) => !value), 2600);
    return () => clearInterval(timer);
  }, [reduceMotion]);

  return (
    <Stack spacing={4}>
      <PreviewCard
        title="No layout shift"
        hint="The point of the component, on a loop. Placeholders and content share one layout, so the row does not move when the data lands — which is the whole difference between this and a spinner. The loop pauses under reduced motion; the button still works."
      >
        <Stack spacing={2}>
          <Stack spacing={2}>
            {PEOPLE.map((person) => (
              <PersonRow key={person.name} person={person} loading={loading} />
            ))}
          </Stack>
          <Button
            variant="secondary"
            appearance="outline"
            size="sm"
            onClick={() => setLoading((value) => !value)}
            sx={{ alignSelf: 'flex-start' }}
          >
            {loading ? 'Show content' : 'Show placeholders'}
          </Button>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Shapes"
        hint="Four shapes cover almost everything. Only text sizes itself — the other three need a width and a height, because a box has no intrinsic size to borrow."
      >
        <Stack spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              text
            </Typography>
            <Skeleton width={240} />
          </Stack>
          <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }}>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                circular
              </Typography>
              <Skeleton variant="circular" width={40} height={40} />
            </Stack>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                rounded
              </Typography>
              <Skeleton variant="rounded" width={140} height={40} />
            </Stack>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                rectangular
              </Typography>
              <Skeleton variant="rectangular" width={140} height={40} />
            </Stack>
          </Stack>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Text tracks the type scale"
        hint="A text skeleton is measured in font sizes, not pixels. Dropped inside the Typography variant it stands in for, it inherits the right height on its own."
      >
        <Stack spacing={1}>
          <Typography variant="h4">
            <Skeleton />
          </Typography>
          <Typography variant="h6">
            <Skeleton />
          </Typography>
          <Typography variant="body1">
            <Skeleton />
          </Typography>
          <Typography variant="body2">
            <Skeleton />
          </Typography>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="A paragraph"
        hint="Vary the last line. A stack of identical full-width bars reads as a table, not as prose."
      >
        <Stack spacing={0.5} sx={{ maxWidth: 420 }}>
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton width="55%" />
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Standing in for a card"
        hint="The rounded variant uses the theme radius, which is 8px — the default for controls. A card in this system is 24px, so a card-shaped placeholder states it: sx={{ borderRadius: 3 }}."
      >
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              rounded (8px)
            </Typography>
            <Skeleton variant="rounded" width={180} height={110} />
          </Stack>
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              card radius (24px)
            </Typography>
            <Skeleton
              variant="rounded"
              width={180}
              height={110}
              sx={{ borderRadius: 3 }}
            />
          </Stack>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Animation"
        hint="Pulse is the default. Wave suits a group, where synchronised fading reads as flicker. All three stop under prefers-reduced-motion: reduce — turn it on in your OS and this preview goes still."
      >
        <Stack spacing={2} sx={{ maxWidth: 320 }}>
          {(['pulse', 'wave', false] as const).map((animation) => (
            <Stack key={String(animation)} spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                {animation === false ? 'false' : animation}
              </Typography>
              <Skeleton variant="rounded" height={32} animation={animation} />
            </Stack>
          ))}
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Every surface"
        hint="The fill is translucent rather than a fixed grey, so it holds the same step against whatever is behind it. Here is the same skeleton on all four layers of the surface scale — a solid token would disappear on at least one of them in dark mode."
      >
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
          {SURFACES.map(({ label, token }) => (
            <Box
              key={label}
              sx={(theme) => ({
                p: 2,
                borderRadius: 2,
                minWidth: 132,
                backgroundColor: token.light,
                ...theme.applyStyles('dark', { backgroundColor: token.dark }),
              })}
            >
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  {label}
                </Typography>
                <Skeleton variant="rounded" height={28} />
              </Stack>
            </Box>
          ))}
        </Stack>
      </PreviewCard>
    </Stack>
  );
}

SkeletonShowcase.displayName = 'SkeletonShowcase';
