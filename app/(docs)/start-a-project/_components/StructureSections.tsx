import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import type {
  StructureLayer,
  StructureRuleGroup,
} from '@/src/project';

/**
 * The project structure, rendered from the same module that writes the
 * template's AGENTS.md and that `scaffold_app` serves, so the page and
 * the rules an agent follows are one text.
 */

/** Backtick spans as `<code>`, the only markup the rules carry. */
function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/).map((part, i) =>
        part.startsWith('`') && part.endsWith('`') ? (
          <code key={i}>{part.slice(1, -1)}</code>
        ) : (
          part
        )
      )}
    </>
  );
}

/** Each layer, what it owns, and what it may import. */
export function LayerTable({ layers }: { layers: readonly StructureLayer[] }) {
  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderRadius: 1.5 }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Layer</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Owns</TableCell>
            <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
              May import
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {layers.map((layer) => (
            <TableRow key={layer.dir}>
              <TableCell sx={{ verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                <code>src/{layer.dir}</code>
              </TableCell>
              <TableCell sx={{ verticalAlign: 'top' }}>{layer.owns}</TableCell>
              <TableCell sx={{ verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                {layer.mayImport.length > 0 ? layer.mayImport.join(', ') : 'nothing'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

LayerTable.displayName = 'LayerTable';

/** The rules under their headings, each with its reason and its check. */
export function RuleGroups({ groups }: { groups: readonly StructureRuleGroup[] }) {
  return (
    <Stack spacing={4}>
      {groups.map((group) => (
        <Stack key={group.title} spacing={2}>
          <Typography variant="overline" color="text.secondary">
            {group.title}
          </Typography>
          <Stack spacing={2.5}>
            {group.rules.map((rule) => (
              <Stack key={rule.rule} spacing={0.75}>
                <Box>
                  <Typography
                    component="span"
                    variant="subtitle2"
                    sx={{ fontWeight: 700 }}
                  >
                    <Inline text={rule.rule} />
                  </Typography>{' '}
                  {rule.enforcedBy !== 'review' && (
                    <Chip
                      label={rule.enforcedBy}
                      size="small"
                      variant="outlined"
                      sx={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                    />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  <Inline text={rule.why} />
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}

RuleGroups.displayName = 'RuleGroups';
