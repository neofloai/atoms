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
   * Resolves the Figma variable name for a rung, for the categories
   * where the two vocabularies differ (`text` and `icon`). Returning
   * null means Figma spells it the same, so no second label is drawn.
   *
   * Passed in rather than looked up here because `surface` and `border`
   * need no translation on the groups this page shows.
   */
  figmaSlot?: (groupName: string, tokenName: string) => string | null;
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
  figmaSlot,
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
              {Object.entries(group).map(([tokenName, modeToken]) => (
                <Stack key={tokenName} spacing={1}>
                  <Stack spacing={0}>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.3 }}
                    >
                      {`${groupName}.${tokenName}`}
                    </Typography>
                    {figmaSlot?.(groupName, tokenName) && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: MONO_FONT,
                          color: 'text.secondary',
                          lineHeight: 1.3,
                        }}
                      >
                        {figmaSlot(groupName, tokenName)}
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
              ))}
            </Box>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}

SemanticSection.displayName = 'SemanticSection';
