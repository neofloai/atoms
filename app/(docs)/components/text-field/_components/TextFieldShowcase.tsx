'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Button } from '@/src/components/Button';
import { IconButton } from '@/src/components/IconButton';
import { Link } from '@/src/components/Link';
import { InputAdornment, TextField } from '@/src/components/TextField';

import type { PasswordRequirement } from '@/src/components/TextField';
import { EnvelopeIcon, LockIcon, MagnifyingGlassIcon, XIcon } from '@/src/icons';

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

const pairGrid = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
  gap: 3,
  alignItems: 'start',
} as const;

function rulesFor(value: string): PasswordRequirement[] {
  return [
    { label: 'Minimum 8 letters', met: value.length >= 8 },
    { label: 'At least one number', met: /\d/.test(value) },
    { label: 'At least one special character', met: /[^A-Za-z0-9]/.test(value) },
  ];
}

/** The checklist following what is typed, the way the sheet draws it. */
function CreatePassword({ size }: { size: 'lg' | 'md' }) {
  const [value, setValue] = React.useState('');
  return (
    <TextField
      type="password"
      size={size}
      fullWidth
      required
      label="New password"
      maxLength={100}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      requirements={rulesFor(value)}
    />
  );
}

CreatePassword.displayName = 'CreatePassword';

/** A field and its skeleton, toggled, to show that nothing moves. */
function LoadingDemo() {
  const [loading, setLoading] = React.useState(true);
  return (
    <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 3,
          width: '100%',
          alignItems: 'start',
        }}
      >
        <TextField
          loading={loading}
          size="lg"
          fullWidth
          required
          label="Company name"
          defaultValue="Neoflo Pte Ltd"
          helperText="As registered"
        />
        <TextField
          loading={loading}
          fullWidth
          multiline
          rows={4}
          label="Notes"
          defaultValue="Net 30, invoiced monthly."
        />
      </Box>
      <Button
        variant="secondary"
        appearance="outline"
        size="sm"
        onClick={() => setLoading((current) => !current)}
      >
        {loading ? 'Show the fields' : 'Show the skeletons'}
      </Button>
    </Stack>
  );
}

LoadingDemo.displayName = 'LoadingDemo';

/**
 * Live rendering of the TextField variants from the Figma component
 * sets: resting / disabled states, the two sizes, the three validation statuses,
 * adornments, the multi-line behaviours, the password variant, and the
 * loading skeleton.
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

      <PreviewCard title="Sizes">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 3,
            alignItems: 'start',
          }}
        >
          <TextField
            size="lg"
            label="Large"
            placeholder="40px field"
            helperText='size="lg"'
          />
          <TextField
            label="Medium"
            placeholder="36px field"
            helperText='size="md" — the default'
          />
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
                <MagnifyingGlassIcon size={16} />
              </InputAdornment>
            }
          />
          <TextField
            label="Email"
            placeholder="you@neoflo.ai"
            fullWidth
            startAdornment={
              <InputAdornment position="start">
                <EnvelopeIcon size={16} />
              </InputAdornment>
            }
          />
          <TextField
            label="Amount"
            placeholder="0.00"
            fullWidth
            endAdornment={<InputAdornment position="end">USD</InputAdornment>}
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
                <XIcon />
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
      <PreviewCard title="Password: creating one — try it">
        <Box sx={pairGrid}>
          <CreatePassword size="lg" />
          <CreatePassword size="md" />
        </Box>
      </PreviewCard>

      <PreviewCard title="Password: every rule met">
        <Box sx={pairGrid}>
          {[false, true].map((shown) => (
            <TextField
              key={String(shown)}
              type="password"
              size="lg"
              fullWidth
              required
              label="New password"
              maxLength={100}
              defaultValue="ExamplePass1!"
              defaultVisible={shown}
              requirements={rulesFor('ExamplePass1!')}
            />
          ))}
        </Box>
      </PreviewCard>

      <PreviewCard title="Password: entering one">
        <Box sx={pairGrid}>
          {[false, true].map((shown) => (
            <TextField
              key={String(shown)}
              type="password"
              size="lg"
              fullWidth
              required
              label="Password"
              maxLength={100}
              defaultValue="ExamplePass1!"
              defaultVisible={shown}
            />
          ))}
        </Box>
      </PreviewCard>

      <PreviewCard title="Password: signing in">
        <Box sx={pairGrid}>
          {(['lg', 'md'] as const).map((size) => (
            <TextField
              key={size}
              type="password"
              size={size}
              fullWidth
              required
              label="Password"
              placeholder="password"
              startAdornment={
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              }
              forgotPassword={
                <Link color="secondary" underline="hover" href="#">
                  Forgot Password?
                </Link>
              }
            />
          ))}
        </Box>
      </PreviewCard>

      <PreviewCard title="Loading">
        <LoadingDemo />
      </PreviewCard>
    </Stack>
  );
}

TextFieldShowcase.displayName = 'TextFieldShowcase';
