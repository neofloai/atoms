'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Select } from '@/src/components/Select';

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

const countries = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'mx', label: 'Mexico' },
  { value: 'in', label: 'India' },
];

/**
 * Live rendering of the Select variants from the Figma component set
 * (node 3179:107344): resting / disabled states, the three validation
 * statuses, and a multi-select example.
 */
export function SelectShowcase() {
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
          <Select label="Country" defaultValue="us" fullWidth>
            {countries.map((country) => (
              <MenuItem key={country.value} value={country.value}>
                {country.label}
              </MenuItem>
            ))}
          </Select>
          <Select
            label="Role"
            defaultValue="editor"
            helperText="Controls workspace permissions"
            fullWidth
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="editor">Editor</MenuItem>
            <MenuItem value="viewer">Viewer</MenuItem>
          </Select>
          <Select label="Region" defaultValue="us-east" disabled fullWidth>
            <MenuItem value="us-east">US East</MenuItem>
          </Select>
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
          <Select
            label="Plan"
            status="error"
            defaultValue="pro"
            helperText="Choose a plan to continue"
            fullWidth
          >
            <MenuItem value="pro">Pro</MenuItem>
            <MenuItem value="team">Team</MenuItem>
          </Select>
          <Select
            label="Plan"
            status="success"
            defaultValue="pro"
            helperText="Plan confirmed"
            fullWidth
          >
            <MenuItem value="pro">Pro</MenuItem>
            <MenuItem value="team">Team</MenuItem>
          </Select>
          <Select
            label="Plan"
            status="warning"
            defaultValue="pro"
            helperText="This plan renews in 2 days"
            fullWidth
          >
            <MenuItem value="pro">Pro</MenuItem>
            <MenuItem value="team">Team</MenuItem>
          </Select>
        </Box>
      </PreviewCard>

      <PreviewCard title="Multiple selection">
        <Box sx={{ maxWidth: 480 }}>
          <Select
            label="Countries"
            multiple
            defaultValue={['us', 'ca']}
            renderValue={(selected) =>
              (selected as string[])
                .map((value) => countries.find((c) => c.value === value)?.label)
                .join(', ')
            }
            fullWidth
          >
            {countries.map((country) => (
              <MenuItem key={country.value} value={country.value}>
                {country.label}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </PreviewCard>
    </Stack>
  );
}

SelectShowcase.displayName = 'SelectShowcase';
