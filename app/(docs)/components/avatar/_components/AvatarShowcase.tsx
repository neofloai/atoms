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

const sizes: readonly AvatarSize[] = ['lg', 'md', 'sm', 'xs'];
const shapes: readonly AvatarShape[] = ['round', 'mid', 'sharp'];
const colorRoles: readonly AvatarColor[] = [
  'primary',
  'purple',
  'information',
  'success',
  'warning',
  'orange',
  'error',
  'secondary',
];

/** Two letters fit from `sm` up; `xs` takes one. */
function initialsFor(size: AvatarSize): string {
  return size === 'xs' ? 'A' : 'AV';
}

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
 * Live rendering of the Avatar component set from Figma: the eight
 * colour roles with initials and an icon, the four sizes, the three
 * shapes, and the status badge.
 */
export function AvatarShowcase() {
  return (
    <Stack spacing={4}>
      <PreviewCard title="Colour roles">
        <Stack spacing={2}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${colorRoles.length}, max-content)`,
              gap: 2,
              alignItems: 'center',
              overflowX: 'auto',
            }}
          >
            {colorRoles.map((color) => (
              <Avatar key={`text-${color}`} size="lg" color={color}>
                AV
              </Avatar>
            ))}
            {colorRoles.map((color) => (
              <Avatar key={`icon-${color}`} size="lg" color={color}>
                <UserIcon />
              </Avatar>
            ))}
            {colorRoles.map((color) => (
              <Typography
                key={`label-${color}`}
                variant="caption"
                color="text.secondary"
              >
                {color}
              </Typography>
            ))}
          </Box>
          <Typography variant="body2" color="text.secondary">
            Each role is one hue: a pale fill, a hairline a step deeper, and
            a dark ink that colours initials and icons alike. A photo drops
            the role and keeps only a neutral hairline.
          </Typography>
        </Stack>
      </PreviewCard>

      <PreviewCard title="Sizes">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, max-content)',
            gap: 2,
            alignItems: 'center',
            justifyItems: 'center',
          }}
        >
          {sizes.map((size) => (
            <Avatar key={`text-${size}`} size={size}>
              {initialsFor(size)}
            </Avatar>
          ))}
          {sizes.map((size) => (
            <Avatar key={`icon-${size}`} size={size}>
              <UserIcon />
            </Avatar>
          ))}
          {sizes.map((size) => (
            <Avatar
              key={`img-${size}`}
              size={size}
              src={SAMPLE_PHOTO}
              alt="Sample user"
            />
          ))}
          {sizes.map((size) => (
            <Typography key={`label-${size}`} variant="caption" color="text.secondary">
              {size}
            </Typography>
          ))}
        </Box>
      </PreviewCard>

      <PreviewCard title="Shapes">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, max-content)',
            gap: 3,
            alignItems: 'center',
          }}
        >
          {shapes.map((shape) => (
            <Avatar key={`text-${shape}`} size="lg" shape={shape}>
              AV
            </Avatar>
          ))}
          {shapes.map((shape) => (
            <Avatar key={`icon-${shape}`} size="lg" shape={shape} color="success">
              <UserIcon />
            </Avatar>
          ))}
          {shapes.map((shape) => (
            <Avatar
              key={`img-${shape}`}
              size="lg"
              shape={shape}
              src={SAMPLE_PHOTO}
              alt="Sample user"
            />
          ))}
        </Box>
      </PreviewCard>

      <PreviewCard title="Status badge">
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
            {shapes.map((shape) =>
              sizes.map((size) => (
                <Avatar
                  key={`${shape}-${size}`}
                  badge
                  size={size}
                  shape={shape}
                >
                  {initialsFor(size)}
                </Avatar>
              ))
            )}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            The dot is just a colour — there is no online/away prop.
            Presence is a convention: success = online, warning = away,
            error = busy, neutral = offline.
          </Typography>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Avatar badge size="lg" src={SAMPLE_PHOTO} alt="Online user" />
            <Avatar badge size="lg" badgeColor="success">
              AV
            </Avatar>
            <Avatar badge size="lg" badgeColor="warning">
              AV
            </Avatar>
            <Avatar badge size="lg" badgeColor="error">
              AV
            </Avatar>
            <Avatar badge size="lg" badgeColor="neutral">
              AV
            </Avatar>
          </Stack>
        </Stack>
      </PreviewCard>
    </Stack>
  );
}

AvatarShowcase.displayName = 'AvatarShowcase';
