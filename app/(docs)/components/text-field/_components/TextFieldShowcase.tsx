'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { IconButton } from '@/src/components/IconButton';
import { TextField } from '@/src/components/TextField';
import { Envelope, Eye, Lock, MagnifyingGlass, X } from '@/src/icons';

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

function handleNoop(): void {
  // Demo-only handler so the clear affordance renders.
}

/**
 * Live rendering of the TextField variants from the Figma component
 * sets: resting / disabled states, the three validation statuses,
 * adornments, and the multi-line behaviours.
 */
export function TextFieldShowcase() {
  return (
    <Stack spacing={4}>
      <PreviewCard title="States">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 3,
          }}
        >
          <TextField label="Label" placeholder="Input body" />
          <TextField
            label="Label"
            placeholder="Input body"
            helperText="Information text"
          />
          <TextField label="Label" defaultValue="Payment due" disabled />
          <TextField placeholder="No label" aria-label="No label example" />
        </Box>
      </PreviewCard>

      <PreviewCard title="Validation statuses">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 3,
          }}
        >
          <TextField
            label="Label"
            status="error"
            defaultValue="Input body"
            helperText="Information text"
          />
          <TextField
            label="Label"
            status="success"
            defaultValue="Input body"
            helperText="Information text"
          />
          <TextField
            label="Label"
            status="warning"
            defaultValue="Input body"
            helperText="Information text"
          />
        </Box>
      </PreviewCard>

      <PreviewCard title="Adornments">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 3,
          }}
        >
          <TextField
            label="Search"
            placeholder="Search anything"
            fullWidth
            startAdornment={
              <InputAdornment position="start">
                <MagnifyingGlass size={16} />
              </InputAdornment>
            }
          />
          <TextField
            label="Email"
            placeholder="you@neoflo.ai"
            fullWidth
            startAdornment={
              <InputAdornment position="start">
                <Envelope size={16} />
              </InputAdornment>
            }
          />
          <TextField
            label="Password"
            placeholder="Enter password"
            fullWidth
            startAdornment={
              <InputAdornment position="start">
                <Lock size={16} />
              </InputAdornment>
            }
            endAdornment={
              <IconButton
                appearance="text"
                variant="secondary"
                size="sm"
                aria-label="Show password"
                onClick={handleNoop}
              >
                <Eye />
              </IconButton>
            }
          />
          <TextField
            label="Search"
            placeholder="Input body"
            fullWidth
            defaultValue="Filter results"
            endAdornment={
              <IconButton
                appearance="text"
                variant="secondary"
                size="sm"
                aria-label="Clear"
                onClick={handleNoop}
              >
                <X />
              </IconButton>
            }
          />
        </Box>
      </PreviewCard>

      <PreviewCard title="Multi-line">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 3,
          }}
        >
          <TextField
            label="Flexible (grows with content)"
            multiline
            minRows={3}
            maxRows={8}
            defaultValue="It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout."
          />
          <TextField
            label="Fixed height (scrolls)"
            multiline
            rows={3}
            defaultValue="It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout."
          />
        </Box>
      </PreviewCard>

      <PreviewCard title="Character counter">
        <Box sx={{ maxWidth: 480 }}>
          <TextField
            label="Bio"
            placeholder="Tell us about yourself"
            fullWidth
            maxLength={100}
            defaultValue="A quick but important distinction first"
          />
        </Box>
      </PreviewCard>
    </Stack>
  );
}

TextFieldShowcase.displayName = 'TextFieldShowcase';
