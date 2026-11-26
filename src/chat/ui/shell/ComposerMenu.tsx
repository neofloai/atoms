import { Box } from '@/src/components/Box';
import { Divider } from '@/src/components/Divider';
import { IconButton } from '@/src/components/IconButton';
import { Menu } from '@/src/components/Menu';
import { MenuItem } from '@/src/components/MenuItem';
import { TextField } from '@/src/components/TextField';
import { CaretRightIcon, FlowArrowIcon, MagnifyingGlassIcon, PaperclipIcon, PlusIcon } from '@/src/icons/glyphs';
import { icon as iconTokens } from '@/src/tokens';
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { useLabels, useScope } from '../../react/hooks';
import { useComposerContext } from '../../react/primitives';
import { mode, visuallyHidden, type AtomsTheme } from '../kit/tokens';
import type { ComposerPickerGroup, ComposerPickerItem } from './ComposerPicker';
import { FileCard } from './FileCard';
import { PickerMenuRows, type RowChildren, type RowItem } from './PickerRows';

/** One entry in the composer's + menu. */
export interface ComposerMenuItem {
  /** Unique in the menu. The built-in items are `attach` and `workflows`. */
  id: string;
  label: ReactNode;
  /** A 16px glyph before the label. */
  icon?: ReactNode;
  /**
   * Items of different groups are ruled off from each other. The built-in attach item is `files`;
   * every other item, built-in or yours, defaults to `context`.
   */
  group?: string;
  /** Shown, but it can't be chosen. */
  disabled?: boolean;
  /** Left out of the menu altogether. */
  hidden?: boolean;
  /** Runs when the item is chosen. The menu closes first. */
  onSelect?: () => void;
  /** A second level, opened beside the item. Its own items can't open a third. */
  submenu?: ComposerSubmenu;
}

/**
 * An item inside a submenu. It doesn't open another flyout; it can hold `children` instead, which
 * open in place under it, to any depth: given up front, or loaded the first time it opens.
 */
export type ComposerSubmenuItem = Omit<ComposerMenuItem, 'submenu' | 'group'> & {
  /** A second, quieter line under the label. */
  description?: ReactNode;
  /** Quiet text on the right, such as a count. */
  trailing?: ReactNode;
  /** What a search matches, when `label` isn't plain text. */
  searchText?: string;
  children?: RowChildren<ComposerSubmenuItem>;
};

/** A picker in a submenu, over a value you own: checkboxes, or one choice with `multiple: false`. */
export interface ComposerSubmenuPicker {
  groups?: ComposerPickerGroup[];
  /** Shorthand for one group without a heading. */
  items?: ComposerPickerItem[];
  value: readonly string[];
  onChange: (value: string[]) => void;
  /** @default true */
  multiple?: boolean;
  /**
   * Show what is chosen as cards in the composer, beside the attachments, each with × to take it
   * out: files and folders a question is about. Not for a setting like the workflows.
   */
  cards?: boolean;
  selectAllLabel?: string;
  deselectAllLabel?: string;
}

/**
 * The panel an item opens: a list of actions, or a picker. Either can nest, with `children` that
 * open in place (folders and files, say), and either can carry a search field.
 */
export type ComposerSubmenu = ({ items: ComposerSubmenuItem[] } | { picker: ComposerSubmenuPicker }) & {
  /** A search field over the labels, reaching into every folder that has been opened or given. */
  searchable?: boolean;
  /** The search field's placeholder, such as "Search 17 files". @default labels.menuSearch */
  searchPlaceholder?: string;
  /** How deep folders open; a folder at the limit can be ticked but not opened. @default no limit */
  maxDepth?: number;
  /** @default 240 */
  minWidth?: number;
};

/**
 * What the composer's `menu` prop takes. Leave it out for the built-in items. A function receives
 * them and returns the menu, so it can add, reorder, disable or hide any item; an array replaces
 * them; `false` turns the menu off, so + attaches directly and the workflow picker is a pill again.
 */
export type ComposerMenuConfig = false | ComposerMenuItem[] | ((builtIns: ComposerMenuItem[]) => ComposerMenuItem[]);

/** Joins a workspace and a workflow into one picker id. A unit separator never appears in either. */
const SCOPE_SEP = '\u001f';

/**
 * The workflow catalog as picker props: one group per workspace, ids joined so two workspaces can
 * share a workflow id. `ScopePicker` and the + menu's Workflows submenu both pick through this.
 */
export function useScopePicker() {
  const scope = useScope();
  const value = Object.entries(scope.selection).flatMap(([groupId, ids]) => ids.map((id) => groupId + SCOPE_SEP + id));
  return {
    scope,
    groups: scope.groups.map(
      (g): ComposerPickerGroup => ({
        id: g.id,
        label: g.label,
        selectAll: true,
        items: g.items.map((item) => ({ id: g.id + SCOPE_SEP + item.id, label: item.label })),
      }),
    ),
    value,
    onChange: (next: string[]) => {
      const selection: Record<string, string[]> = Object.fromEntries(scope.groups.map((g) => [g.id, []]));
      for (const key of next) {
        const [groupId, id] = key.split(SCOPE_SEP) as [string, string];
        (selection[groupId] ??= []).push(id);
      }
      scope.setSelection(selection);
    },
  };
}

/**
 * The menu's items: the built-ins (attach, then the workflows) through your `menu`, hidden ones
 * dropped. `onAttach` opens the file picker; the cards row has no use for it.
 */
function useMenuItems(menu: Exclude<ComposerMenuConfig, false> | undefined, onAttach: () => void): ComposerMenuItem[] {
  const c = useComposerContext();
  const labels = useLabels();
  const workflows = useScopePicker();
  const builtIns: ComposerMenuItem[] = [
    {
      id: 'attach',
      label: labels.menuAttach,
      icon: <PaperclipIcon />,
      group: 'files',
      hidden: !c.attachmentsEnabled,
      onSelect: onAttach,
    },
    {
      id: 'workflows',
      label: labels.menuWorkflows,
      icon: <FlowArrowIcon />,
      hidden: !workflows.scope.enabled,
      disabled: workflows.scope.status === 'loading',
      submenu: { picker: { groups: workflows.groups, value: workflows.value, onChange: workflows.onChange }, searchable: true },
    },
  ];
  return (typeof menu === 'function' ? menu(builtIns) : (menu ?? builtIns)).filter((item) => !item.hidden);
}

/**
 * Rows a folder loaded, by the menu item they came from, so a card can still name a file after its
 * folder's panel has closed. Lives as long as the page: what a folder held is the app's to cache,
 * this only keeps the names.
 */
const loadedRows = new Map<string, RowItem>();
const loadedKey = (menuItemId: string, rowId: string) => `${menuItemId}\u001f${rowId}`;
function remember(menuItemId: string, rows: readonly RowItem[]) {
  for (const row of rows) loadedRows.set(loadedKey(menuItemId, row.id), row);
}

/** Finds a chosen id among the rows given up front, then among those a folder loaded. */
function findRow(menuItemId: string, picker: ComposerSubmenuPicker, id: string): RowItem | undefined {
  const walk = (rows: readonly RowItem[] | undefined): RowItem | undefined => {
    for (const row of rows ?? []) {
      if (row.id === id) return row;
      const inner = typeof row.children === 'function' ? undefined : walk(row.children);
      if (inner) return inner;
    }
    return undefined;
  };
  return walk([...(picker.groups ?? []).flatMap((g) => g.items), ...(picker.items ?? [])]) ?? loadedRows.get(loadedKey(menuItemId, id));
}

/**
 * The cards for what the + menu's pickers hold (those with `cards: true`): one per chosen file or
 * folder, beside the attachments, each with × to take it out of the picker's value.
 */
export function ComposerChosen({ menu }: { menu?: Exclude<ComposerMenuConfig, false> }) {
  const items = useMenuItems(menu, () => undefined);
  const cards: ReactNode[] = [];
  for (const item of items) {
    const sub = item.submenu;
    if (!sub || !('picker' in sub) || !sub.picker.cards) continue;
    const picker = sub.picker;
    for (const id of picker.value) {
      const row = findRow(item.id, picker, id);
      const name = row?.searchText ?? (typeof row?.label === 'string' ? row.label : id);
      cards.push(
        <FileCard
          key={`${item.id}:${id}`}
          name={name}
          folder={row?.children !== undefined}
          onRemove={() => picker.onChange(picker.value.filter((v) => v !== id))}
        />,
      );
    }
  }
  return <>{cards}</>;
}

const glyph = (node: ReactNode) =>
  node ? (
    <Box
      component="span"
      aria-hidden
      sx={(t: AtomsTheme) => ({ display: 'inline-flex', mr: 1, '& svg': { width: 16, height: 16 }, ...mode(t, { color: iconTokens.default.b2 }) })}
    >
      {node}
    </Box>
  ) : null;


export interface ComposerMenuProps {
  /** See `ComposerMenuConfig`. `false` is handled by the composer, which then draws no menu. */
  menu?: Exclude<ComposerMenuConfig, false>;
  /** The + button: bare in the welcome composer, on a grey fill when docked. @default 'text' */
  appearance?: 'text' | 'contained';
}

/**
 * The composer's + button and its menu (Figma: the plus menu). Built in: attach files, then the
 * workflows as a submenu. Your own items join them through the composer's `menu` prop. Two levels
 * at most: an item can open a submenu, and a submenu's items can't open another.
 */
export function ComposerMenu({ menu, appearance = 'text' }: ComposerMenuProps) {
  const c = useComposerContext();
  const labels = useLabels();
  const fileInput = useRef<HTMLInputElement>(null);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [sub, setSub] = useState<{ id: string; el: HTMLElement; focus: boolean } | null>(null);
  const [query, setQuery] = useState('');
  const searchId = useId();

  const items = useMenuItems(menu, () => fileInput.current?.click());

  const closeSub = (refocus: boolean) => {
    if (refocus) sub?.el.focus();
    setSub(null);
    setQuery('');
  };
  const closeAll = () => {
    setSub(null);
    setQuery('');
    setAnchor(null);
  };
  const openSub = (item: ComposerMenuItem, el: HTMLElement, focus: boolean) => {
    if (sub?.id === item.id) {
      if (focus && !sub.focus) setSub({ ...sub, focus });
      return;
    }
    setQuery('');
    setSub({ id: item.id, el, focus });
  };

  if (!items.length) return null;

  const rows: ReactNode[] = [];
  items.forEach((item, index) => {
    const prev = items[index - 1];
    if (prev && (prev.group ?? 'context') !== (item.group ?? 'context')) rows.push(<Divider key={`rule:${item.id}`} />);
    rows.push(
      <MenuItem
        key={item.id}
        disabled={item.disabled}
        aria-haspopup={item.submenu ? 'menu' : undefined}
        aria-expanded={item.submenu ? sub?.id === item.id : undefined}
        selected={Boolean(item.submenu) && sub?.id === item.id}
        onMouseEnter={(e) => {
          if (item.submenu) openSub(item, e.currentTarget, false);
          else if (sub) closeSub(false);
        }}
        onKeyDown={(e) => {
          if (item.submenu && e.key === 'ArrowRight') {
            e.preventDefault();
            openSub(item, e.currentTarget, true);
          }
        }}
        onClick={(e) => {
          if (item.submenu) {
            // A click from the keyboard (Enter, Space) has no pointer position: move focus in.
            openSub(item, e.currentTarget, e.detail === 0);
            return;
          }
          closeAll();
          item.onSelect?.();
        }}
      >
        {glyph(item.icon)}
        <Box component="span" sx={{ flex: 1, minWidth: 0 }}>
          {item.label}
        </Box>
        {item.submenu ? (
          <Box component="span" aria-hidden sx={(t: AtomsTheme) => ({ display: 'inline-flex', ml: 1, ...mode(t, { color: iconTokens.default.b3 }) })}>
            <CaretRightIcon size={14} />
          </Box>
        ) : null}
      </MenuItem>,
    );
  });

  const open = items.find((item) => item.id === sub?.id);
  const submenu = open?.submenu;
  const subRows: ReactNode =
    submenu && 'picker' in submenu ? (
      <PickerMenuRows
        key={`rows:${open.id}`}
        groups={submenu.picker.groups ?? (submenu.picker.items ? [{ id: '', items: submenu.picker.items }] : [])}
        value={submenu.picker.value}
        onChange={submenu.picker.onChange}
        multiple={submenu.picker.multiple ?? true}
        close={closeAll}
        labels={labels}
        selectAllLabel={submenu.picker.selectAllLabel}
        deselectAllLabel={submenu.picker.deselectAllLabel}
        query={query}
        maxDepth={submenu.maxDepth}
        onLoaded={(children) => remember(open.id, children)}
      />
    ) : submenu ? (
      <PickerMenuRows
        key={`rows:${open.id}`}
        groups={[{ id: '', items: submenu.items }]}
        close={closeAll}
        labels={labels}
        query={query}
        maxDepth={submenu.maxDepth}
      />
    ) : null;

  return (
    <>
      {c.attachmentsEnabled ? (
        <input
          ref={fileInput}
          type="file"
          hidden
          multiple
          accept={c.accept}
          onChange={(e) => {
            const files = e.target.files ? [...e.target.files] : [];
            if (files.length) c.addFiles(files);
            e.target.value = '';
          }}
        />
      ) : null}
      <IconButton
        size="sm"
        variant="secondary"
        appearance={appearance}
        aria-label={labels.composerMenu}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchor)}
        onClick={(e) => setAnchor(e.currentTarget)}
      >
        <PlusIcon />
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={closeAll}
        variant="menu"
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        sx={{ '& .MuiMenu-paper': { minWidth: 176, mt: -1 } }}
      >
        {rows}
      </Menu>
      {sub && submenu ? (
        <Menu
          anchorEl={sub.el}
          open
          onClose={(_e, reason) => (reason === 'backdropClick' ? closeAll() : closeSub(true))}
          variant="menu"
          autoFocus={sub.focus}
          disableAutoFocusItem={!sub.focus || Boolean(submenu.searchable)}
          // The first level stays usable under it: no backdrop over it, no focus trap around this one.
          hideBackdrop
          disableEnforceFocus
          disableRestoreFocus
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          slotProps={{
            list: {
              onKeyDown: (e: KeyboardEvent) => {
                if (e.key === 'ArrowLeft') {
                  e.preventDefault();
                  closeSub(true);
                }
              },
            },
          }}
          sx={{
            pointerEvents: 'none',
            '& .MuiMenu-paper': { pointerEvents: 'auto', minWidth: submenu.minWidth ?? 240, maxHeight: 360, ml: 0.5 },
          }}
        >
          {submenu.searchable ? (
            <Box
              key="search"
              sx={{ pb: 0.5 }}
              // Typing belongs to the field, not to the menu's type-ahead; only Escape and
              // ArrowDown (into the rows) reach the menu.
              onKeyDown={(e: KeyboardEvent) => {
                if (e.key !== 'Escape' && e.key !== 'ArrowDown') e.stopPropagation();
              }}
            >
              <Box component="label" htmlFor={searchId} sx={visuallyHidden}>
                {labels.menuSearch}
              </Box>
              <TextField
                id={searchId}
                size="md"
                fullWidth
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={submenu.searchPlaceholder ?? labels.menuSearch}
                autoFocus={sub.focus}
                startAdornment={<MagnifyingGlassIcon />}
              />
            </Box>
          ) : null}
          {subRows}
        </Menu>
      ) : null}
    </>
  );
}
