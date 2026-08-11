'use client';

import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowUpRightIcon } from '@/src/icons';
import { Button } from '@/src/components/Button';
import { Chip } from '@/src/components/Chip';
import { IconButton } from '@/src/components/IconButton';
import { CardActions, CardContent, CardHeader } from '@/src/components/Card';

/** The Figma frame draws every cell at 400px wide (node 3653:30109). */
export const CARD_WIDTH = 400;

export const DESCRIPTION =
  'A widespread group of squamate reptiles, with over 6,000 species, ranging across all continents except Antarctica.';

export const reviewers = [
  { id: 'op', initials: 'OP', name: 'Olivia Park', role: 'Design' },
  { id: 'rk', initials: 'RK', name: 'Ravi Kumar', role: 'Engineering' },
  { id: 'jm', initials: 'JM', name: 'Jae Moon', role: 'Research' },
] as const;

export function handleNoop(): void {
  // Demo-only handler so the buttons render as real controls.
}

/**
 * Labelled section, rather than the bordered `Paper` the other showcases
 * use — a card inside a bordered panel reads as a nested card and makes
 * it hard to see where the component's own edge is.
 */
export function Demo({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={1.5}>
      <Stack spacing={0.5}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {note && (
          <Typography variant="body2" color="text.secondary">
            {note}
          </Typography>
        )}
      </Stack>
      {children}
    </Stack>
  );
}

Demo.displayName = 'Demo';

/**
 * Figma's `text` header (node 3653:30103). Maps straight onto
 * `CardHeader`: `title` is the 16px line, `subheader` the 13px one.
 */
export function TextHeader() {
  return <CardHeader title="Lizards" subheader={DESCRIPTION} />;
}

TextHeader.displayName = 'TextHeader';

/**
 * Figma's `info` header (node 3653:30106), built as a composition. The
 * badge sits 8px after the metric, which `CardHeader`'s `action` slot
 * cannot do — it stretches the title block and pushes the action to the
 * far edge of the card.
 */
export function InfoHeader() {
  return (
    <CardContent>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Typography variant="h4">420%</Typography>
        <IconButton variant="success" size="sm" aria-label="Trending up">
          <ArrowUpRightIcon />
        </IconButton>
      </Stack>
      <Typography variant="body1" color="text.secondary">
        Increase in fat
      </Typography>
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 2 }}>
        <Chip
          size="sm"
          variant="success"
          icon={<ArrowUpRightIcon />}
          label="5%"
        />
        <Typography variant="body2" color="text.secondary">
          vs prev 30d
        </Typography>
      </Stack>
    </CardContent>
  );
}

InfoHeader.displayName = 'InfoHeader';

/** The action row all four `text` cells draw: secondary, then primary. */
export function CardActionRow() {
  return (
    <CardActions>
      <Button
        appearance="outline"
        variant="secondary"
        size="sm"
        onClick={handleNoop}
      >
        Share
      </Button>
      <Button size="sm" onClick={handleNoop}>
        Learn more
      </Button>
    </CardActions>
  );
}

CardActionRow.displayName = 'CardActionRow';
