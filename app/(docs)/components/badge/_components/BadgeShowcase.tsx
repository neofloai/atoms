'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Avatar } from '@/src/components/Avatar';
import { Badge } from '@/src/components/Badge';
import { Button } from '@/src/components/Button';
import { IconButton } from '@/src/components/IconButton';
import {
  BellIcon,
  ChatCircleIcon,
  EnvelopeIcon,
  ShoppingCartIcon,
} from '@/src/icons';

import type { BadgeColor, BadgeProps } from '@/src/components/Badge';

/** Every colour role, in the order the props table lists them. */
const COLORS: readonly BadgeColor[] = [
  'primary',
  'secondary',
  'success',
  'error',
  'warning',
  'information',
];

/** The four corners `anchorOrigin` accepts. */
const ANCHORS: readonly {
  label: string;
  anchorOrigin: BadgeProps['anchorOrigin'];
}[] = [
  { label: 'top / right', anchorOrigin: { vertical: 'top', horizontal: 'right' } },
  { label: 'top / left', anchorOrigin: { vertical: 'top', horizontal: 'left' } },
  {
    label: 'bottom / right',
    anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
  },
  {
    label: 'bottom / left',
    anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
  },
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

/**
 * One labelled cell, so a row of samples reads without a legend.
 *
 * `gap` is opened up wherever the badge hangs *below* its anchor — a
 * bottom-anchored badge sits half outside the element it is attached to,
 * and at the default gap it would land on the caption.
 */
function Sample({
  label,
  gap = 1,
  children,
}: {
  label: string;
  gap?: number;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={gap} sx={{ alignItems: 'center', minWidth: 88 }}>
      {children}
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}

Sample.displayName = 'Sample';

/** Live rendering of every Badge axis: colour, shape, anchor, overlap, state. */
export function BadgeShowcase() {
  const [cart, setCart] = React.useState(3);

  return (
    <Stack spacing={4}>
      <PreviewCard
        title="Colour roles"
        description="Each role fills with its own surface token under its own ink — the same pairing a filled Button uses, so a warning badge and a warning button are the same yellow."
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ flexWrap: 'wrap', rowGap: 3, alignItems: 'flex-start' }}
        >
          {COLORS.map((color) => (
            <Sample key={color} label={color}>
              <Badge badgeContent={8} color={color}>
                <IconButton
                  variant="secondary"
                  appearance="outline"
                  aria-label={`8 messages, ${color}`}
                >
                  <ChatCircleIcon />
                </IconButton>
              </Badge>
            </Sample>
          ))}
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Counter and dot"
        description="The dot draws in the role's accent ink rather than its fill: at 8px there are no digits to carry the signal, and the fills are pale by design."
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ flexWrap: 'wrap', rowGap: 3, alignItems: 'flex-start' }}
        >
          {COLORS.map((color) => (
            <Sample key={color} label={color}>
              <Badge variant="dot" color={color}>
                <IconButton
                  variant="secondary"
                  appearance="outline"
                  aria-label={`Unread messages, ${color}`}
                >
                  <ChatCircleIcon />
                </IconButton>
              </Badge>
            </Sample>
          ))}
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Counting"
        description="`max` clamps the number; `showZero` decides whether an empty count still renders."
      >
        <Stack
          direction="row"
          spacing={4}
          sx={{ flexWrap: 'wrap', rowGap: 3, alignItems: 'flex-start' }}
        >
          <Sample label="9">
            <Badge badgeContent={9} color="error">
              <IconButton aria-label="9 unread notifications">
                <BellIcon />
              </IconButton>
            </Badge>
          </Sample>
          <Sample label="42">
            <Badge badgeContent={42} color="error">
              <IconButton aria-label="42 unread notifications">
                <BellIcon />
              </IconButton>
            </Badge>
          </Sample>
          <Sample label="1204, max 99">
            <Badge badgeContent={1204} color="error">
              <IconButton aria-label="1204 unread notifications">
                <BellIcon />
              </IconButton>
            </Badge>
          </Sample>
          <Sample label="0 (hidden)">
            <Badge badgeContent={0} color="error">
              <IconButton aria-label="No unread notifications">
                <BellIcon />
              </IconButton>
            </Badge>
          </Sample>
          <Sample label="0, showZero">
            <Badge badgeContent={0} color="error" showZero>
              <IconButton aria-label="No unread notifications">
                <BellIcon />
              </IconButton>
            </Badge>
          </Sample>
          <Sample label='"Beta"'>
            <Badge badgeContent="Beta" color="information">
              <IconButton
                variant="secondary"
                appearance="outline"
                aria-label="Webhooks, beta"
              >
                <EnvelopeIcon />
              </IconButton>
            </Badge>
          </Sample>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Anchor and overlap"
        description={
          '`overlap="circular"` tucks the badge 14% inwards so it stays on a round target instead of floating past its edge.'
        }
      >
        <Stack spacing={4}>
          <Stack
            direction="row"
            spacing={3}
            sx={{ flexWrap: 'wrap', rowGap: 3, alignItems: 'flex-start' }}
          >
            {ANCHORS.map((anchor) => (
              <Sample key={anchor.label} label={anchor.label} gap={2.5}>
                <Badge
                  badgeContent={7}
                  anchorOrigin={anchor.anchorOrigin}
                  color="primary"
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      bgcolor: 'action.selected',
                    }}
                  />
                </Badge>
              </Sample>
            ))}
          </Stack>
          <Stack
            direction="row"
            spacing={3}
            sx={{ flexWrap: 'wrap', rowGap: 3, alignItems: 'flex-start' }}
          >
            <Sample label="rectangular">
              <Badge badgeContent={7} color="primary">
                <Avatar shape="sharp" size="lg">
                  OP
                </Avatar>
              </Badge>
            </Sample>
            <Sample label="circular">
              <Badge badgeContent={7} color="primary" overlap="circular">
                <Avatar size="lg">OP</Avatar>
              </Badge>
            </Sample>
            <Sample label="circular dot" gap={1.5}>
              <Badge
                variant="dot"
                color="success"
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              >
                <Avatar size="lg">OP</Avatar>
              </Badge>
            </Sample>
          </Stack>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Appearing and disappearing"
        description="`invisible` keeps the badge mounted, so it scales away and back rather than popping in and out of the layout."
      >
        <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
          <Badge badgeContent={cart} color="primary" invisible={cart === 0}>
            <IconButton aria-label={`${cart} items in cart`}>
              <ShoppingCartIcon />
            </IconButton>
          </Badge>
          <Stack direction="row" spacing={1}>
            <Button
              appearance="outline"
              variant="secondary"
              onClick={() => setCart((n) => Math.max(0, n - 1))}
            >
              Remove
            </Button>
            <Button appearance="outline" onClick={() => setCart((n) => n + 1)}>
              Add
            </Button>
          </Stack>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Standalone"
        description={
          'With no child the badge still renders, but its root collapses to nothing and the badge stays centred on that zero-size point — so it overhangs in all four directions and needs space of its own. For a label that sits in a run of text, reach for Chip size="sm" instead.'
        }
      >
        <Stack
          direction="row"
          spacing={6}
          sx={{ alignItems: 'center', px: 4, py: 1 }}
        >
          <Sample label="count" gap={2.5}>
            <Badge badgeContent={12} color="primary" />
          </Sample>
          <Sample label="text" gap={2.5}>
            <Badge badgeContent="Beta" color="information" />
          </Sample>
          <Sample label="dot" gap={2.5}>
            <Badge variant="dot" color="success" />
          </Sample>
        </Stack>
      </PreviewCard>
    </Stack>
  );
}

BadgeShowcase.displayName = 'BadgeShowcase';
