import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ModeToken } from '@/src/tokens';
import { Swatch } from '../../_components/Swatch';

type NestedTokens = Readonly<Record<string, Readonly<Record<string, ModeToken>>>>;

const MONO_FONT = 'var(--font-geist-mono), ui-monospace, monospace';

interface SemanticSectionProps {
  title: string;
  description: string;
  tokens: NestedTokens;
  swatchVariant: 'fill' | 'border' | 'text';
  /**
   * Overrides the pair of labels drawn above each swatch: the heading
   * someone scans for, and a smaller line beneath it.
   *
   * `text` and `icon` pass one so the heading is the Figma variable name
   * — `text/default/b2`, the string a designer actually says — with the
   * property path underneath. `surface` and `border` leave it unset and
   * get `group.token` alone, because Figma's names for those are still
   * renamed on the way in and a slash-joined label would be wrong.
   */
  labels?: (groupName: string, tokenName: string) => readonly [string, string];
}

/**
 * Renders a full semantic-token section (surface, border, or text).
 *
 * Each top-level key (e.g. `pageCard`, `primary`) becomes a sub-heading
 * with a grid of token pairs underneath. Every token pair shows both
 * its `light` and `dark` values side-by-side so designers can verify
 * each colour scheme against the Figma source without toggling modes.
 */
export function SemanticSection({
  title,
  description,
  tokens,
  swatchVariant,
  labels,
}: SemanticSectionProps) {
  const groups = Object.entries(tokens);

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Stack>
      <Stack spacing={4}>
        {groups.map(([groupName, group]) => (
          <Stack key={groupName} spacing={1.5}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {groupName}
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 3,
              }}
            >
              {Object.entries(group).map(([tokenName, modeToken]) => {
                const [heading, sub] = labels?.(groupName, tokenName) ?? [
                  `${groupName}.${tokenName}`,
                  '',
                ];
                return (
                <Stack key={tokenName} spacing={1}>
                  <Stack spacing={0}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        lineHeight: 1.3,
                        // Only the Figma-named categories go mono: their
                        // heading is a variable name someone will
                        // character-match against the Figma panel.
                        ...(labels && { fontFamily: MONO_FONT }),
                      }}
                    >
                      {heading}
                    </Typography>
                    {sub && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: MONO_FONT,
                          color: 'text.secondary',
                          lineHeight: 1.3,
                        }}
                      >
                        {sub}
                      </Typography>
                    )}
                  </Stack>
                  <Stack direction="row" spacing={1.5}>
                    <Swatch
                      label="light"
                      value={modeToken.light}
                      variant={swatchVariant}
                    />
                    <Swatch
                      label="dark"
                      value={modeToken.dark}
                      variant={swatchVariant}
                    />
                  </Stack>
                </Stack>
                );
              })}
            </Box>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}

SemanticSection.displayName = 'SemanticSection';
