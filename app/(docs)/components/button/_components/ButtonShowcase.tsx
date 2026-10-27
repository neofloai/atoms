'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { HeartIcon, UploadSimpleIcon } from '@phosphor-icons/react';

import { Button } from '@/src/components/Button';
import { MenuItem } from '@/src/components/MenuItem';

import type {
  ButtonAppearance,
  ButtonVariant,
} from '@/src/components/Button';

const variants: readonly ButtonVariant[] = [
  'primary',
  'secondary',
  'success',
  'error',
  'warning',
];

const appearances: readonly ButtonAppearance[] = [
  'contained',
  'outline',
  'text',
];

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

const splitMenu = (
  <>
    <MenuItem>Save as…</MenuItem>
    <MenuItem>Save a copy</MenuItem>
    <MenuItem disabled>Revert</MenuItem>
  </>
);

/**
 * Live rendering of every Button variant from the Figma component set:
 * the variant x appearance matrix, `xl` in the context it is drawn
 * for, the social sign-in button, the four sizes, and the disabled /
 * loading states.
 */
export function ButtonShowcase() {
  return (
    <Stack spacing={4}>
      <PreviewCard title="Variants and emphasis">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, max-content)',
            gap: 2,
            alignItems: 'center',
          }}
        >
          {variants.map((variant) =>
            appearances.map((appearance) => (
              <Button
                key={`${variant}-${appearance}`}
                variant={variant}
                appearance={appearance}
              >
                Button
              </Button>
            ))
          )}
        </Box>
      </PreviewCard>

      <PreviewCard title="Extra large — the page's one call to action">
        <Stack spacing={2.5}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Invoice Dashboard
            </Typography>
            <Button size="xl" startIcon={<UploadSimpleIcon />}>
              Add Invoice
            </Button>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            <code>size=&quot;xl&quot;</code> is 48px tall with a heading-sized
            label, for the one action a screen exists for, beside its title
            rather than in a row of controls. It paints like every other
            size — pick the role with <code>variant</code> and the emphasis
            with <code>appearance</code>.
          </Typography>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
            {variants.map((variant) => (
              <Button key={variant} variant={variant} size="xl">
                {variant}
              </Button>
            ))}
          </Stack>
        </Stack>
      </PreviewCard>

      <PreviewCard title="Social — the sign-in CTA">
        <Stack spacing={2.5}>
          <Stack spacing={1.5} sx={{ maxWidth: 360 }}>
            {(['lg', 'md', 'sm'] as const).map((size) => (
              <Button key={size} appearance="social" size={size} fullWidth>
                Continue with Google
              </Button>
            ))}
            <Button appearance="social" size="lg" fullWidth disabled>
              Continue with Google
            </Button>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            The one treatment drawn with a fill and a border at the same
            time: a near-white card inside the standard neutral hairline,
            quiet enough that someone else&apos;s logo can sit inside it
            without competing. It is neutral only, so <code>variant</code>{' '}
            does not apply; <code>size</code> does, and it is normally full
            width in a login column. It defaults to <code>size=&quot;lg&quot;</code>,
            the size it is drawn at; medium and small are shown below it for
            layouts that need them, and the mark stays 16px at all three. None of them passes
            an icon — the Google mark is what this appearance carries unless
            you hand it something else. Disabled is the only state that moves the
            hairline rather than the fill, and the mark keeps its own
            colours through it, because they are not ours to grey out.
          </Typography>
        </Stack>
      </PreviewCard>

      <PreviewCard title="Split button">
        <Stack spacing={2.5}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, max-content)',
              gap: 2,
              alignItems: 'center',
            }}
          >
            {(['lg', 'md', 'sm'] as const).map((size) =>
              (['primary', 'secondary'] as const).map((variant) =>
                (['contained', 'outline'] as const).map((appearance) => (
                  <Button
                    key={`${size}-${variant}-${appearance}`}
                    size={size}
                    variant={variant}
                    appearance={appearance}
                    startIcon={<HeartIcon />}
                    menu={splitMenu}
                  >
                    Button
                  </Button>
                ))
              )
            )}
            <Button startIcon={<HeartIcon />} menu={splitMenu} disabled>
              Button
            </Button>
            <Button
              appearance="outline"
              startIcon={<HeartIcon />}
              menu={splitMenu}
              disabled
            >
              Button
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Pass <code>menu</code> and the label keeps its action while a
            caret beside it opens the options. They are two buttons, so each
            hovers and presses on its own, and the focus ring runs round
            both. The menu opens under the whole control, aligned to its
            right edge, and closes when an option is chosen.
          </Typography>
        </Stack>
      </PreviewCard>

      <PreviewCard title="Sizes">
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="xl">Extra large</Button>
        </Stack>
      </PreviewCard>

      <PreviewCard title="States">
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Button disabled>Disabled</Button>
          <Button appearance="outline" disabled>
            Disabled
          </Button>
          <Button loading>Processing</Button>
        </Stack>
      </PreviewCard>
    </Stack>
  );
}

ButtonShowcase.displayName = 'ButtonShowcase';
