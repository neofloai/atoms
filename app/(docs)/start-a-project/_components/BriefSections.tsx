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
  BriefQuestion,
  ProjectTargetRecipe,
} from '@/src/project/types';

/**
 * The intake, rendered from the same objects the MCP serves.
 *
 * Read from `src/project` rather than retyped here: this page and
 * `start_project` are the same interview, and a page that had drifted
 * from the tool would be worse than no page — someone would prepare
 * answers to questions the tool no longer asks.
 */

function Question({ question }: { question: BriefQuestion }) {
  return (
    <Stack spacing={0.75}>
      <Stack
        direction="row"
        sx={{ gap: 1, alignItems: 'baseline', flexWrap: 'wrap' }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {question.ask}
        </Typography>
        <Chip
          label={question.id}
          size="small"
          variant="outlined"
          sx={{ fontFamily: 'var(--font-geist-mono), monospace' }}
        />
      </Stack>
      <Typography variant="body2" color="text.secondary">
        {question.why}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Answer shape: <code>{question.accepts}</code>
      </Typography>
      {question.purposes && (
        <Typography variant="caption" color="text.secondary">
          Only asked when you are building:{' '}
          <strong>{question.purposes.join(' or ')}</strong>
        </Typography>
      )}
      {question.followUps && question.followUps.length > 0 && (
        <Stack component="ul" spacing={0.25} sx={{ pl: 2.5, m: 0, pt: 0.5 }}>
          {question.followUps.map((followUp) => (
            <Typography
              key={followUp}
              component="li"
              variant="caption"
              color="text.secondary"
            >
              {followUp}
            </Typography>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

Question.displayName = 'Question';

/** Questions grouped under their section headings, in asking order. */
export function QuestionSections({
  questions,
}: {
  questions: readonly BriefQuestion[];
}) {
  const sections = new Map<string, BriefQuestion[]>();
  for (const question of questions) {
    const group = sections.get(question.section) ?? [];
    group.push(question);
    sections.set(question.section, group);
  }

  return (
    <Stack spacing={4}>
      {[...sections.entries()].map(([section, group]) => (
        <Stack key={section} spacing={2}>
          <Typography variant="overline" color="text.secondary">
            {section}
          </Typography>
          <Stack spacing={3}>
            {group.map((question) => (
              <Question key={question.id} question={question} />
            ))}
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}

QuestionSections.displayName = 'QuestionSections';

/** What gets created, and the answer that decides it. */
export function TargetTable({
  targets,
}: {
  targets: readonly ProjectTargetRecipe[];
}) {
  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderRadius: 1.5 }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
              Target
            </TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Chosen when</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {targets.map((target) => (
            <TableRow key={target.id}>
              <TableCell sx={{ verticalAlign: 'top' }}>
                <Box sx={{ fontWeight: 600 }}>{target.label}</Box>
                {target.createCommand === null && (
                  <Typography variant="caption" color="text.secondary">
                    nothing is created
                  </Typography>
                )}
              </TableCell>
              <TableCell>{target.chooseWhen}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

TargetTable.displayName = 'TargetTable';
