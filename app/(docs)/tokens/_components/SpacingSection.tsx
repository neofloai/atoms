import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface SpacingSectionProps {
  title: string;
  description: string;
  tokens: Readonly<Record<string, Readonly<Record<string, number>>>>;
}

/**
 * Renders the spacing scale as horizontal bars.
 *
 * Each token in the group shows: token key, pixel value, and a
 * filled bar whose width is the actual pixel value (capped so the
 * largest values still fit in the grid column). Designers can
 * eyeball the relative scale at a glance.
 */
export function SpacingSection({ title, description, tokens }: SpacingSectionProps) {
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
        {groups.map(([groupName, group]) => {
          const items = Object.entries(group);
          return (
            <Stack key={groupName} spacing={1.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {groupName}
              </Typography>
              <Stack spacing={1.5}>
                {items.map(([tokenName, px]) => (
                  <Stack
                    key={tokenName}
                    direction="row"
                    spacing={2}
                    sx={{ alignItems: 'center' }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        width: 64,
                        flexShrink: 0,
                        fontFamily: 'var(--font-geist-mono), monospace',
                      }}
                    >
                      {tokenName}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        width: 48,
                        flexShrink: 0,
                        fontFamily: 'var(--font-geist-mono), monospace',
                      }}
                    >
                      {px}px
                    </Typography>
                    <Box
                      sx={{
                        height: 12,
                        width: px || 1,
                        bgcolor: 'primary.main',
                        borderRadius: 0.5,
                      }}
                    />
                  </Stack>
                ))}
              </Stack>
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
}

SpacingSection.displayName = 'SpacingSection';
