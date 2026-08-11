'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DotsThreeIcon } from '@/src/icons';
import { Avatar } from '@/src/components/Avatar';
import { Button } from '@/src/components/Button';
import { Divider } from '@/src/components/Divider';
import { IconButton } from '@/src/components/IconButton';
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
} from '@/src/components/Card';

import {
  CARD_WIDTH,
  CardActionRow,
  Demo,
  InfoHeader,
  TextHeader,
  handleNoop,
  reviewers,
} from './parts';

const MEDIA_SRC = '/docs/card-sample-media.jpg';
const MEDIA_ALT = 'A saltwater crocodile resting in shallow green water';

/** Two columns at the design's own 400px, collapsing to one on mobile. */
const pairGrid = {
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',
    md: `repeat(2, minmax(0, ${CARD_WIDTH}px))`,
  },
  gap: 3,
  alignItems: 'start',
} as const;

/**
 * Live rendering of the eight cells in the Figma component set, plus the
 * cases the set does not draw but the API still has to answer for.
 */
export function CardShowcase() {
  return (
    <Stack spacing={4}>
      <Demo
        title="The two header patterns"
        note="Figma's Property 1 axis. Both cards below draw the identical shell — the axis picks what goes inside it, not how the surface looks."
      >
        <Box sx={pairGrid}>
          <Card component="article">
            <TextHeader />
          </Card>
          <Card component="article">
            <InfoHeader />
          </Card>
        </Box>
      </Demo>

      <Demo
        title="With an action row"
        note="The buttons sit 16px below the description, not 32 — a region that follows another padded region drops its top padding, so the two share one gutter."
      >
        <Card component="article" sx={{ maxWidth: CARD_WIDTH }}>
          <TextHeader />
          <CardActionRow />
        </Card>
      </Demo>

      <Demo
        title="Media, edge to edge"
        note="CardMedia sits outside the padded regions, so it reaches both edges and is clipped to the card's corners. The height is a content dimension — Figma uses 124px here and 132px on the metric card."
      >
        <Box sx={pairGrid}>
          <Card component="article">
            <TextHeader />
            <CardActionRow />
            <CardMedia
              component="img"
              src={MEDIA_SRC}
              alt={MEDIA_ALT}
              sx={{ height: 124 }}
            />
          </Card>
          <Card component="article">
            <InfoHeader />
            <CardMedia
              component="img"
              src={MEDIA_SRC}
              alt={MEDIA_ALT}
              sx={{ height: 132 }}
            />
          </Card>
        </Box>
      </Demo>

      <Demo
        title="A chart region"
        note="The card supplies the 164px slot and the clipped corners; the chart is the caller's. The artwork here is the Figma sample exported as-is — switch this page to dark mode and it stays light, which is the point: a card cannot re-theme what you put inside it, so chart colours have to come from tokens on your side."
      >
        <Card component="article" sx={{ maxWidth: CARD_WIDTH }}>
          <TextHeader />
          <CardActionRow />
          <CardMedia
            component="img"
            src="/docs/card-sample-chart.svg"
            alt=""
            role="presentation"
            sx={{ height: 164, objectPosition: 'left' }}
          />
        </Card>
      </Demo>

      <Demo
        title="A list region"
        note="Rows go after the padded box so they reach both edges, and each brings its own inset. The rule between them is a Divider — the card's own border token is a 1.11:1 hairline on this surface, so it would not render."
      >
        <Card component="article" sx={{ maxWidth: CARD_WIDTH }}>
          <CardHeader title="Reviewers" subheader="3 people on this change" />
          <Stack
            component="ul"
            sx={{ listStyle: 'none', p: 0, m: 0 }}
            divider={<Divider component="li" />}
          >
            {reviewers.map((person) => (
              <Stack
                key={person.id}
                component="li"
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', p: 2 }}
              >
                <Avatar size="md">{person.initials}</Avatar>
                <Stack>
                  <Typography variant="body1">{person.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {person.role}
                  </Typography>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Card>
      </Demo>

      <Demo
        title="Cases the design does not draw"
        note="A header action goes to the trailing edge, an action row can be split with sx, and text under an image keeps its full top padding."
      >
        <Box sx={pairGrid}>
          <Card component="article">
            <CardHeader
              title="Deployment"
              subheader="Last run 4 minutes ago"
              action={
                <IconButton
                  appearance="text"
                  size="sm"
                  aria-label="More actions"
                >
                  <DotsThreeIcon />
                </IconButton>
              }
            />
            <CardActions sx={{ justifyContent: 'space-between' }}>
              <Button appearance="text" size="sm" onClick={handleNoop}>
                View logs
              </Button>
              <Button size="sm" onClick={handleNoop}>
                Redeploy
              </Button>
            </CardActions>
          </Card>
          <Card component="article">
            <CardMedia
              component="img"
              src={MEDIA_SRC}
              alt={MEDIA_ALT}
              sx={{ height: 124 }}
            />
            <CardContent>
              <Typography variant="body1">
                Recorded in Queensland, 2026.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Demo>
    </Stack>
  );
}

CardShowcase.displayName = 'CardShowcase';
