import { Box } from '@/src/components/Box';
import { Checkbox } from '@/src/components/Checkbox';
import { Divider } from '@/src/components/Divider';
import { MenuItem } from '@/src/components/MenuItem';
import { CircularProgress } from '@/src/components/Progress';
import { Typography } from '@/src/components/Typography';
import { CaretDownIcon, CaretRightIcon } from '@/src/icons/glyphs';
import { icon as iconTokens, text } from '@/src/tokens';
import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import type { ChatLabels } from '../../react/labels';
import { mode, type AtomsTheme } from '../kit/tokens';
import { checkState, filterTree, toggleInTree } from './pickerTree';

/** A row's children: given up front, or loaded the first time its folder opens. */
export type RowChildren<T> = readonly T[] | (() => Promise<readonly T[]>);

/** What a row can carry. `ComposerPickerItem` and the + menu's `ComposerSubmenuItem` are both this. */
export interface RowItem {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  trailing?: ReactNode;
  searchText?: string;
  disabled?: boolean;
  hidden?: boolean;
  /** Action rows only: runs when the row is chosen. */
  onSelect?: () => void;
  /** Makes the row a folder that opens in place, to any depth. */
  children?: RowChildren<RowItem>;
}

export interface RowGroup {
  id: string;
  label?: ReactNode;
  selectAll?: boolean;
  items: readonly RowItem[];
}

export interface PickerMenuRowsProps {
  groups: readonly RowGroup[];
  /** Picking: the chosen ids. Leave `value` and `onChange` out for rows of actions. */
  value?: readonly string[];
  onChange?: (value: string[]) => void;
  /** Checkboxes (default), or one choice that closes the menu. */
  multiple?: boolean;
  /** Shuts the menu: a single choice and an action do. */
  close: () => void;
  labels: ChatLabels;
  selectAllLabel?: string;
  deselectAllLabel?: string;
  /** Keeps what matches, and opens the folders on the way to it. */
  query?: string;
  /** How deep folders open; a folder at the limit is a row you can tick but not open. @default no limit */
  maxDepth?: number;
  /** Set by `MenuList` on its first child: focus goes to the first row. */
  autoFocus?: boolean;
  /** Told what a folder loaded, so the names can outlive the menu. */
  onLoaded?: (children: readonly RowItem[]) => void;
}

/** Rows sit indented under their group's heading (Figma SourcePicker). */
const GROUP_INDENT = 3.25;
/** A row's own inset, `MenuItem`'s 8px, which nested rows step in from. */
const ROW_INSET = 1;
/** Each level of a folder steps its rows in by this much. */
const LEVEL_INDENT = 2.5;

type Loaded = Record<string, { status: 'loading' | 'ready' | 'error'; items: readonly RowItem[] }>;

/**
 * The rows of a picker's menu: headings, select-all, checkbox or radio rows, folders that open in
 * place to any depth (loading their contents on first open), or rows of actions. `ComposerPicker`
 * puts them under its pill and the composer's + menu in its submenus, so both pick the same way.
 * Rows are rendered flat, one `MenuItem` each, so the menu's arrow keys walk every visible row; →
 * opens a folder and ← closes it or steps back to its folder.
 */
export function PickerMenuRows({
  groups,
  value = [],
  onChange,
  multiple = true,
  close,
  labels,
  selectAllLabel,
  deselectAllLabel,
  query,
  maxDepth = Number.POSITIVE_INFINITY,
  autoFocus,
  onLoaded,
}: PickerMenuRowsProps) {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set());
  const [loaded, setLoaded] = useState<Loaded>({});
  const rows = useRef(new Map<string, HTMLElement>());
  const picking = Boolean(onChange);
  const selected = new Set(value);
  const q = query?.trim().toLowerCase() ?? '';

  const childrenOf = (node: RowItem): readonly RowItem[] | undefined => {
    const all = typeof node.children === 'function' ? (loaded[node.id]?.status === 'ready' ? loaded[node.id]!.items : undefined) : node.children;
    return all?.filter((c) => !c.hidden);
  };
  const matches = (node: RowItem) =>
    (node.searchText ?? (typeof node.label === 'string' ? node.label : '')).toLowerCase().includes(q);

  const load = (node: RowItem, again = false) => {
    const fetchChildren = node.children;
    if (typeof fetchChildren !== 'function') return;
    const status = loaded[node.id]?.status;
    if (!again && (status === 'loading' || status === 'ready')) return;
    setLoaded((prev) => ({ ...prev, [node.id]: { status: 'loading', items: [] } }));
    Promise.resolve()
      .then(fetchChildren)
      .then(
        (items) => {
          onLoaded?.(items);
          setLoaded((prev) => ({ ...prev, [node.id]: { status: 'ready', items } }));
        },
        () => setLoaded((prev) => ({ ...prev, [node.id]: { status: 'error', items: [] } })),
      );
  };
  const setOpen = (node: RowItem, open: boolean) => {
    if (open) load(node);
    setExpanded((prev) => {
      const next = new Set(prev);
      if (open) next.add(node.id);
      else next.delete(node.id);
      return next;
    });
  };
  const pick = (path: readonly RowItem[]) => {
    if (!onChange) return;
    onChange(toggleInTree(path, value, childrenOf));
  };
  const choose = (id: string) => {
    close();
    if (!selected.has(id) || value.length !== 1) onChange?.([id]);
  };

  // What a search opens: the folders on the way to a match.
  const forced = q
    ? filterTree(
        groups.flatMap((g) => g.items.filter((i) => !i.hidden)),
        matches,
        childrenOf,
      ).open
    : new Set<string>();

  const out: ReactNode[] = [];
  let first = true;

  const renderRows = (items: readonly RowItem[], depth: number, path: readonly RowItem[], inherited: boolean, showAll: boolean, base: number) => {
    const visible = items.filter((i) => !i.hidden);
    const list = q && !showAll ? filterTree(visible, matches, childrenOf).nodes : visible;
    for (const item of list) {
      const itemPath = [...path, item];
      const folder = item.children !== undefined && depth < maxDepth;
      const open = folder && (expanded.has(item.id) || forced.has(item.id));
      const state = picking ? checkState(item, selected, inherited, childrenOf) : 'off';
      const autoFocusThis = Boolean(autoFocus) && first && !item.disabled;
      if (!item.disabled) first = false;

      const onKeyDown = (e: KeyboardEvent) => {
        const parent = path[path.length - 1];
        if (e.key === 'ArrowRight' && folder && !open) {
          e.preventDefault();
          e.stopPropagation();
          setOpen(item, true);
        } else if (e.key === 'ArrowLeft' && folder && open) {
          e.preventDefault();
          e.stopPropagation();
          setOpen(item, false);
        } else if (e.key === 'ArrowLeft' && parent) {
          e.preventDefault();
          e.stopPropagation();
          rows.current.get(parent.id)?.focus();
        } else if (e.key === ' ' && folder && picking && multiple) {
          // Enter opens a folder; Space ticks it, as the checkbox does.
          e.preventDefault();
          e.stopPropagation();
          pick(itemPath);
        }
      };

      out.push(
        <MenuItem
          key={`${path.map((p) => p.id).join('/')}/${item.id}`}
          ref={(el: HTMLLIElement | null) => {
            if (el) rows.current.set(item.id, el);
            else rows.current.delete(item.id);
          }}
          autoFocus={autoFocusThis}
          disabled={item.disabled}
          role={picking ? (multiple ? 'menuitemcheckbox' : 'menuitemradio') : 'menuitem'}
          aria-checked={picking ? (state === 'mixed' ? 'mixed' : state === 'on') : undefined}
          aria-expanded={folder ? open : undefined}
          selected={picking && !multiple && state === 'on'}
          onKeyDown={onKeyDown}
          onClick={() => {
            if (folder) setOpen(item, !open);
            else if (!picking) {
              close();
              item.onSelect?.();
            } else if (multiple) pick(itemPath);
            else choose(item.id);
          }}
          sx={{ pl: base + depth * LEVEL_INDENT }}
        >
          {picking && multiple ? (
            <Checkbox
              size="sm"
              checked={state === 'on'}
              indeterminate={state === 'mixed'}
              tabIndex={-1}
              aria-hidden
              // On a folder the row opens it, so the box is what ticks it.
              onClick={
                folder
                  ? (e: React.MouseEvent) => {
                      e.stopPropagation();
                      pick(itemPath);
                    }
                  : undefined
              }
              sx={{ p: 0, mr: 1.25 }}
            />
          ) : null}
          {item.icon ? (
            <Box
              component="span"
              aria-hidden
              sx={(t: AtomsTheme) => ({ display: 'inline-flex', mr: 1, '& svg': { width: 16, height: 16 }, ...mode(t, { color: iconTokens.default.b2 }) })}
            >
              {item.icon}
            </Box>
          ) : null}
          <Box component="span" sx={{ flex: 1, minWidth: 0 }}>
            <Box component="span" sx={{ display: 'block' }}>
              {item.label}
            </Box>
            {item.description ? (
              <Typography
                variant="caption"
                component="span"
                sx={(t: AtomsTheme) => ({ display: 'block', whiteSpace: 'normal', ...mode(t, { color: text.default.b3 }) })}
              >
                {item.description}
              </Typography>
            ) : null}
          </Box>
          {item.trailing !== undefined ? (
            <Typography variant="body2" component="span" sx={(t: AtomsTheme) => ({ ml: 1.5, ...mode(t, { color: text.default.b3 }) })}>
              {item.trailing}
            </Typography>
          ) : null}
          {folder ? (
            <Box component="span" aria-hidden sx={(t: AtomsTheme) => ({ display: 'inline-flex', ml: 1, ...mode(t, { color: iconTokens.default.b3 }) })}>
              {open ? <CaretDownIcon size={14} /> : <CaretRightIcon size={14} />}
            </Box>
          ) : null}
        </MenuItem>,
      );

      if (!open) continue;
      const status = typeof item.children === 'function' ? loaded[item.id]?.status : 'ready';
      const pad = { pl: base + (depth + 1) * LEVEL_INDENT };
      if (status === 'loading' || status === undefined) {
        out.push(
          <MenuItem key={`${item.id}:loading`} disabled sx={pad}>
            <CircularProgress size={12} />
            <Box component="span" sx={{ ml: 1 }}>
              {labels.menuLoading}
            </Box>
          </MenuItem>,
        );
      } else if (status === 'error') {
        out.push(
          <MenuItem key={`${item.id}:error`} onClick={() => load(item, true)} sx={pad}>
            <Box component="span" sx={(t: AtomsTheme) => mode(t, { color: text.error[3] })}>
              {labels.menuLoadFailed}
            </Box>
          </MenuItem>,
        );
      } else {
        renderRows(childrenOf(item) ?? [], depth + 1, itemPath, inherited || selected.has(item.id), showAll || (Boolean(q) && matches(item)), base);
      }
    }
  };

  groups.forEach((group, index) => {
    const items = group.items.filter((i) => !i.hidden);
    const shown = q ? filterTree(items, matches, childrenOf).nodes : items;
    if (!shown.length) return;
    // A heading separates groups well enough (Figma SourcePicker); a rule only when there is none.
    if (index > 0 && out.length) {
      out.push(
        group.label ? (
          <Box key={`d:${group.id}`} role="presentation" sx={{ height: 8 }} />
        ) : (
          <Divider key={`d:${group.id}`} sx={{ my: 0.5 }} />
        ),
      );
    }
    if (picking && multiple && group.selectAll && !q) {
      // The heading is the group's select-all control, with the action named on its right.
      const enabled = items.filter((i) => !i.disabled);
      const all = enabled.length > 0 && enabled.every((i) => checkState(i, selected, false, childrenOf) === 'on');
      const action = all ? (deselectAllLabel ?? labels.pickerDeselectAll) : (selectAllLabel ?? labels.pickerSelectAll);
      out.push(
        <MenuItem
          key={`h:${group.id}`}
          variant="secondary"
          disabled={enabled.length === 0}
          aria-label={typeof group.label === 'string' ? `${group.label}: ${action}` : action}
          onClick={() => {
            // Disabled items keep whatever state they have; a chosen folder stands for its contents.
            const ids = new Set<string>();
            const collect = (n: RowItem) => {
              ids.add(n.id);
              childrenOf(n)?.forEach(collect);
            };
            enabled.forEach(collect);
            const rest = value.filter((v) => !ids.has(v));
            onChange?.(all ? rest : [...rest, ...enabled.map((i) => i.id)]);
          }}
        >
          <Typography
            variant="body2"
            weight="medium"
            component="span"
            sx={(t: AtomsTheme) => ({ flex: 1, ...mode(t, { color: text.default.b1 }) })}
          >
            {group.label}
          </Typography>
          <Typography variant="body2" component="span" sx={(t: AtomsTheme) => ({ ml: 2, ...mode(t, { color: text.primary[3] }) })}>
            {action}
          </Typography>
        </MenuItem>,
      );
    } else if (group.label) {
      out.push(
        <Typography
          key={`h:${group.id}`}
          role="presentation"
          variant="body2"
          weight="medium"
          component="div"
          sx={(t: AtomsTheme) => ({ px: 1.25, py: 0.75, ...mode(t, { color: text.default.b1 }) })}
        >
          {group.label}
        </Typography>,
      );
    }
    renderRows(items, 0, [], false, false, group.label ? GROUP_INDENT : ROW_INSET);
  });

  if (!out.length && q) {
    out.push(
      <Typography
        key="none"
        role="presentation"
        variant="body2"
        component="div"
        sx={(t: AtomsTheme) => ({ px: 1, py: 0.75, ...mode(t, { color: text.default.b3 }) })}
      >
        {labels.menuNoMatches}
      </Typography>,
    );
  }
  return <>{out}</>;
}
