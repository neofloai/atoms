'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Avatar } from '@/src/components/Avatar';
import { UserIcon } from '@/src/icons';

import type {
  AvatarColor,
  AvatarShape,
  AvatarSize,
} from '@/src/components/Avatar';

const sizes: readonly AvatarSize[] = ['sm', 'md', 'lg'];
const shapes: readonly AvatarShape[] = ['round', 'mid', 'sharp'];
const colorRoles: readonly AvatarColor[] = [
  'accent',
  'primary',
  'secondary',
  'success',
  'error',
  'warning',
];

const SAMPLE_PHOTO = 'https://i.pravatar.cc/96?img=12';

function PreviewCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        {children}
      </Paper>
    </Stack>
  );
}

PreviewCard.displayName = 'PreviewCard';

/**
 * Live rendering of the Avatar component set from Figma: content types
 * (text / icon / image) across the three shapes and sizes, the colour
 * roles, and the status badge.
 */
export function AvatarShowcase() {
  return (
    <Stack spacing={4}>
      <PreviewCard title="Content types and shapes">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, max-content)',
            gap: 3,
            alignItems: 'center',
          }}
        >
          {shapes.map((shape) => (
            <Avatar key={`text-${shape}`} shape={shape}>
              OP
            </Avatar>
          ))}
          {shapes.map((shape) => (
            <Avatar key={`icon-${shape}`} shape={shape} color="primary">
              <UserIcon />
            </Avatar>
          ))}
          {shapes.map((shape) => (
            <Avatar
              key={`img-${shape}`}
              shape={shape}
              src={SAMPLE_PHOTO}
              alt="Sample user"
            />
          ))}
        </Box>
      </PreviewCard>

      <PreviewCard title="Sizes">
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          {sizes.map((size) => (
            <Avatar key={size} size={size}>
              OP
            </Avatar>
          ))}
        </Stack>
      </PreviewCard>

      <PreviewCard title="Colour roles">
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          {colorRoles.map((color) => (
            <Avatar key={color} color={color}>
              OP
            </Avatar>
          ))}
        </Stack>
      </PreviewCard>

      <PreviewCard title="Status badge">
        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary">
            The dot is just a colour — there is no online/away prop.
            Presence is a convention: success = online, warning = away,
            error = busy, neutral = offline.
          </Typography>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Avatar badge src={SAMPLE_PHOTO} alt="Online user" />
            <Avatar badge badgeColor="success">
              OP
            </Avatar>
            <Avatar badge badgeColor="warning">
              OP
            </Avatar>
            <Avatar badge badgeColor="error">
              OP
            </Avatar>
            <Avatar badge badgeColor="neutral">
              OP
            </Avatar>
          </Stack>
        </Stack>
      </PreviewCard>
    </Stack>
  );
}

AvatarShowcase.displayName = 'AvatarShowcase';
