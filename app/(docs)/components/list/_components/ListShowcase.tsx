'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Avatar } from '@/src/components/Avatar';
import { Button } from '@/src/components/Button';
import { IconButton } from '@/src/components/IconButton';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@/src/components/List';
import { Radio } from '@/src/components/Radio';
import { Switch } from '@/src/components/Switch';
import {
  ArrowRightIcon,
  CaretRightIcon,
  ChartBarIcon,
  FolderIcon,
  HeartIcon,
  PencilSimpleIcon,
} from '@/src/icons';

function PreviewCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        {children}
      </Paper>
    </Stack>
  );
}

PreviewCard.displayName = 'PreviewCard';

/**
 * The design's 332px column, so every sample here measures against the
 * Figma frame rather than against the docs page width.
 */
function Frame({ children }: { children: React.ReactNode }) {
  return <Box sx={{ maxWidth: 332 }}>{children}</Box>;
}

Frame.displayName = 'Frame';

/** One labelled cell, so a row of samples reads without a legend. */
function Sample({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={1} sx={{ flex: 1, minWidth: 280 }}>
      {children}
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}

Sample.displayName = 'Sample';

function NavigationList() {
  const [current, setCurrent] = React.useState('invoices');

  return (
    <List component="nav">
      <ListItemButton
        selected={current === 'invoices'}
        onClick={() => setCurrent('invoices')}
      >
        <ListItemIcon>
          <FolderIcon size={16} />
        </ListItemIcon>
        <ListItemText primary="Invoices" />
      </ListItemButton>
      <ListItemButton
        selected={current === 'reports'}
        onClick={() => setCurrent('reports')}
      >
        <ListItemIcon>
          <ChartBarIcon size={16} />
        </ListItemIcon>
        <ListItemText primary="Reports" />
      </ListItemButton>
      <ListItemButton disabled>
        <ListItemIcon>
          <HeartIcon size={16} />
        </ListItemIcon>
        <ListItemText primary="Saved views" />
      </ListItemButton>
    </List>
  );
}

NavigationList.displayName = 'NavigationList';

function SettingsList() {
  return (
    <List>
      <ListItem disablePadding secondaryAction={<Switch defaultChecked />}>
        <ListItemButton>
          <ListItemText
            primary="Two-factor auth"
            secondary="Required for admins"
          />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding secondaryAction={<Switch />}>
        <ListItemButton>
          <ListItemText
            primary="Desktop alerts"
            secondary="Off while presenting"
          />
        </ListItemButton>
      </ListItem>
    </List>
  );
}

SettingsList.displayName = 'SettingsList';

function ChoiceList() {
  const [plan, setPlan] = React.useState('team');

  return (
    <List>
      {[
        { id: 'starter', title: 'Starter', detail: 'Up to 3 seats' },
        { id: 'team', title: 'Team', detail: 'Up to 25 seats' },
      ].map((option) => (
        <ListItem
          key={option.id}
          disablePadding
          secondaryAction={
            <Radio
              value={option.id}
              checked={plan === option.id}
              onChange={() => setPlan(option.id)}
              aria-label={option.title}
            />
          }
        >
          <ListItemButton onClick={() => setPlan(option.id)}>
            <ListItemText primary={option.title} secondary={option.detail} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}

ChoiceList.displayName = 'ChoiceList';

/**
 * The live samples on the List docs page.
 *
 * Organised the way the Figma frame is — by what fills a row rather than
 * by state — because none of the sheet's four axes is a prop, so the
 * only way to show the range is to show the compositions.
 */
export function ListShowcase() {
  return (
    <Stack spacing={5}>
      <PreviewCard
        title="A row is composed, not configured"
        description="Same component, four leading slots. The row insets whatever it is given by 16 and centres it — nothing here is a prop on the list."
      >
        <Frame>
          <List>
            <ListItem>
              <ListItemText primary="Text only" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <HeartIcon size={16} />
              </ListItemIcon>
              <ListItemText primary="With a leading glyph" />
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Avatar size="sm">OP</Avatar>
              </ListItemAvatar>
              <ListItemText primary="With a small avatar" />
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Avatar size="md">OP</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="With an avatar and two lines"
                secondary="olivia@neoflo.ai"
              />
            </ListItem>
          </List>
        </Frame>
      </PreviewCard>

      <PreviewCard
        title="The trailing control"
        description="Every one of these is an existing component dropped into secondaryAction. It is laid out in flow, so a long title shortens instead of running underneath it."
      >
        <Frame>
          <List>
            <ListItem secondaryAction={<Switch defaultChecked />}>
              <ListItemText primary="A switch" />
            </ListItem>
            <ListItem
              secondaryAction={<Radio defaultChecked aria-label="A radio" />}
            >
              <ListItemText primary="A radio" />
            </ListItem>
            <ListItem
              secondaryAction={
                <Button
                  size="sm"
                  variant="secondary"
                  endIcon={<ArrowRightIcon size={16} />}
                >
                  Action
                </Button>
              }
            >
              <ListItemText primary="A button" />
            </ListItem>
            <ListItem
              secondaryAction={
                <>
                  <IconButton size="sm" variant="secondary" aria-label="Edit">
                    <PencilSimpleIcon size={16} />
                  </IconButton>
                  <IconButton size="sm" variant="secondary" aria-label="Open">
                    <CaretRightIcon size={16} />
                  </IconButton>
                </>
              }
            >
              <ListItemText primary="Two icon buttons, wider than MUI reserves" />
            </ListItem>
          </List>
        </Frame>
      </PreviewCard>

      <PreviewCard
        title="Rows that respond"
        description="Hover and focus share a fill; only the hairline differs, turning primary on keyboard focus. Tab into the first list to see it."
      >
        <Stack direction="row" spacing={4} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <Sample label="ListItemButton — selected, and one disabled">
            <Frame>
              <NavigationList />
            </Frame>
          </Sample>
          <Sample label="A clickable row with its own trailing target">
            <Frame>
              <SettingsList />
            </Frame>
          </Sample>
        </Stack>
      </PreviewCard>

      <PreviewCard
        title="Selection"
        description="The row and the radio are one choice but two targets, so the row stays clickable while the control keeps its own hit area."
      >
        <Frame>
          <ChoiceList />
        </Frame>
      </PreviewCard>
    </Stack>
  );
}

ListShowcase.displayName = 'ListShowcase';
