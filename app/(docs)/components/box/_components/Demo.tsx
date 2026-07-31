import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { CodeBlock } from '../../../_components/CodeBlock';

import type { BoxDemo } from './demos';

/**
 * One documented behaviour: heading, prose, the live result, and the
 * snippet that produced it directly beneath — so a reader never has to
 * scroll between a demo and its code to know how it was made.
 */
export function Demo({ demo }: { demo: BoxDemo }) {
  return (
    <Stack spacing={2} id={slug(demo.title)}>
      <Stack spacing={0.5}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {demo.title}
        </Typography>
        {demo.description && (
          <Typography variant="body2" color="text.secondary">
            {demo.description}
          </Typography>
        )}
      </Stack>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        {demo.preview}
      </Paper>
      <CodeBlock>{demo.code}</CodeBlock>
    </Stack>
  );
}

Demo.displayName = 'Demo';

/** Anchor id, so each demo is linkable from the page or an issue. */
export function slug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
