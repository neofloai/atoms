import { NeofloThemeProvider } from '@/src/theme/ThemeProvider';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useState, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  AgenticChat,
  ChatComposer,
  ChatProvider,
  ComposerPicker,
  type ComposerMenuItem,
  type ComposerPickerItem,
  type ComposerPickerProps,
} from '@/src/chat/index';
import { createMockAdapter } from '@/src/chat/mock';

function inTheme(node: ReactNode) {
  return render(<NeofloThemeProvider defaultMode="light">{node}</NeofloThemeProvider>);
}

/** A controlled picker, as an app would hold it. */
function Picker({
  initial,
  onChange,
  ...props
}: Omit<ComposerPickerProps, 'value' | 'onChange'> & { initial: string[]; onChange?: (v: string[]) => void }) {
  const [value, setValue] = useState(initial);
  return (
    <ComposerPicker
      {...props}
      value={value}
      onChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
    />
  );
}

const TOOLS = [
  {
    id: 'home',
    label: 'Home',
    selectAll: true,
    items: [
      { id: 'web', label: 'Web search' },
      { id: 'docs', label: 'Documents', description: 'Your uploaded files' },
      { id: 'erp', label: 'ERP', disabled: true },
    ],
  },
];

describe('<ComposerPicker>', () => {
  it('summarizes the selection and toggles items, keeping the menu open', () => {
    const onChange = vi.fn();
    inTheme(<Picker name="Tools" groups={TOOLS} initial={['web', 'docs', 'erp']} onChange={onChange} />);
    const trigger = screen.getByRole('button', { name: 'Tools: All tools' });
    fireEvent.click(trigger);
    const menu = screen.getByRole('menu');
    expect(within(menu).getByText('Home')).toBeTruthy();
    expect(within(menu).getByText('Your uploaded files')).toBeTruthy();

    fireEvent.click(within(menu).getByRole('menuitemcheckbox', { name: /Web search/ }));
    expect(onChange).toHaveBeenLastCalledWith(['docs', 'erp']);
    // Still open, and the heading now offers to select the rest.
    expect(within(screen.getByRole('menu')).getByRole('menuitem', { name: 'Home: Select all' })).toBeTruthy();
    // The open menu hides the page from the accessibility tree, the trigger included.
    expect(screen.getByRole('button', { name: 'Tools: Tools (2)', hidden: true })).toBeTruthy();
  });

  it("selects or clears a group's enabled items from its heading", () => {
    const onChange = vi.fn();
    inTheme(<Picker name="Tools" groups={TOOLS} initial={['erp']} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /^Tools:/ }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Home: Select all' }));
    // The disabled ERP row keeps its state; the enabled ones are added.
    expect(onChange).toHaveBeenLastCalledWith(['erp', 'web', 'docs']);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Home: Deselect all' }));
    expect(onChange).toHaveBeenLastCalledWith(['erp']);
  });

  it('picks one item in single mode, shows it on the trigger and closes', () => {
    const onChange = vi.fn();
    inTheme(
      <Picker
        name="Model"
        multiple={false}
        items={[
          { id: 'fast', label: 'Fast' },
          { id: 'deep', label: 'Deep' },
        ]}
        initial={['fast']}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Model: Fast' }));
    expect(screen.getByRole('menuitemradio', { name: 'Fast' }).getAttribute('aria-checked')).toBe('true');
    fireEvent.click(screen.getByRole('menuitemradio', { name: 'Deep' }));
    expect(onChange).toHaveBeenCalledWith(['deep']);
    expect(screen.getByRole('button', { name: 'Model: Deep' })).toBeTruthy();
  });

  it('renders a footer that can close the menu', () => {
    const manage = vi.fn();
    inTheme(
      <Picker
        name="Tools"
        groups={TOOLS}
        initial={[]}
        footer={(close) => (
          <button
            type="button"
            onClick={() => {
              close();
              manage();
            }}
          >
            Manage tools
          </button>
        )}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Tools: No tools' }));
    fireEvent.click(screen.getByRole('button', { name: 'Manage tools' }));
    expect(manage).toHaveBeenCalled();
  });
});

describe('<ChatComposer> slots', () => {
  const adapter = () => createMockAdapter({ latency: 0, speed: 0 });
  const scope = {
    groups: [
      {
        id: 'ws',
        label: 'Home',
        items: [
          { id: 'ip', label: 'Invoice Processing' },
          { id: 'col', label: 'Collections' },
        ],
      },
    ],
  };

  it('puts leading controls on the left and can leave the workflow picker out', async () => {
    inTheme(
      <ChatProvider adapter={adapter()} persistence={false} refreshOnFocus={false} scope={scope}>
        <ChatComposer
          scopePicker={false}
          leadingActions={<button type="button">Lead</button>}
          extraActions={<button type="button">Trail</button>}
        />
      </ChatProvider>,
    );
    await screen.findByRole('textbox', { name: 'Message' });
    const lead = screen.getByRole('button', { name: 'Lead' });
    const trail = screen.getByRole('button', { name: 'Trail' });
    expect(lead.compareDocumentPosition(trail) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Choose which workflows/ })).toBeNull();
  });

  it('replaces the workflow picker with your own', async () => {
    inTheme(
      <ChatProvider adapter={adapter()} persistence={false} refreshOnFocus={false} scope={scope}>
        <ChatComposer scopePicker={<button type="button">My scope</button>} />
      </ChatProvider>,
    );
    await screen.findByRole('textbox', { name: 'Message' });
    expect(screen.getByRole('button', { name: 'My scope' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Choose which workflows/ })).toBeNull();
  });

  it('puts the workflows under +, as a submenu with search and Select all per workspace', async () => {
    inTheme(
      <div style={{ height: 800 }}>
        <AgenticChat adapter={adapter()} persistence={false} refreshOnFocus={false} scope={scope} />
      </div>,
    );
    // The pill has gone from the row: the workflows live in the + menu now.
    await screen.findByRole('textbox', { name: 'Message' });
    expect(screen.queryByRole('button', { name: /Choose which workflows/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Add to your message' }));
    fireEvent.click(within(screen.getByRole('menu')).getByRole('menuitem', { name: 'Workflows' }));
    const submenu = screen.getAllByRole('menu').at(-1)!;
    expect(within(submenu).getByText('Home')).toBeTruthy();
    const collections = within(submenu).getByRole('menuitemcheckbox', { name: 'Collections' });
    const before = collections.getAttribute('aria-checked');
    fireEvent.click(collections);
    expect(within(screen.getAllByRole('menu').at(-1)!).getByRole('menuitemcheckbox', { name: 'Collections' }).getAttribute('aria-checked')).not.toBe(before);
    // The search keeps only what matches, and drops the select-all with the rest.
    fireEvent.change(within(screen.getAllByRole('menu').at(-1)!).getByRole('textbox', { name: 'Search…' }), { target: { value: 'invoice' } });
    const filtered = screen.getAllByRole('menu').at(-1)!;
    expect(within(filtered).getByRole('menuitemcheckbox', { name: 'Invoice Processing' })).toBeTruthy();
    expect(within(filtered).queryByRole('menuitemcheckbox', { name: 'Collections' })).toBeNull();
    expect(within(filtered).queryByRole('menuitem', { name: /Select all|Deselect all/ })).toBeNull();
  });

  it('brings the workflow pill back with the menu off', async () => {
    inTheme(
      <div style={{ height: 800 }}>
        <AgenticChat adapter={adapter()} persistence={false} refreshOnFocus={false} scope={scope} composerProps={{ menu: false }} />
      </div>,
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Choose which workflows to ask about: All workflows' }));
    const menu = screen.getByRole('menu');
    expect(within(menu).getByText('Home')).toBeTruthy();
    fireEvent.click(within(menu).getByRole('menuitemcheckbox', { name: 'Collections' }));
    expect(screen.getByRole('button', { name: 'Choose which workflows to ask about: 1 workflow', hidden: true })).toBeTruthy();
    fireEvent.click(within(screen.getByRole('menu')).getByRole('menuitem', { name: 'Home: Select all' }));
    expect(screen.getByRole('button', { name: 'Choose which workflows to ask about: All workflows', hidden: true })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Add to your message' })).toBeNull();
  });

  it('takes your own + items: actions, a submenu, disabled and hidden ones, two levels at most', async () => {
    const onFolder = vi.fn();
    inTheme(
      <ChatProvider adapter={adapter()} persistence={false} refreshOnFocus={false} scope={scope}>
        <ChatComposer
          menu={(builtIns) => [
            ...builtIns.map((item) => (item.id === 'workflows' ? { ...item, disabled: true } : item)),
            {
              id: 'folder',
              label: 'Folder',
              submenu: { items: [{ id: 'bank', label: 'Bank statements', onSelect: onFolder }, { id: 'old', label: 'Old', hidden: true }] },
            },
            { id: 'tools', label: 'Tools', hidden: true },
          ]}
        />
      </ChatProvider>,
    );
    await screen.findByRole('textbox', { name: 'Message' });
    fireEvent.click(screen.getByRole('button', { name: 'Add to your message' }));
    const menu = screen.getByRole('menu');
    expect(within(menu).getByRole('menuitem', { name: 'Workflows' }).getAttribute('aria-disabled')).toBe('true');
    expect(within(menu).queryByRole('menuitem', { name: 'Tools' })).toBeNull();
    fireEvent.click(within(menu).getByRole('menuitem', { name: 'Folder' }));
    const submenu = screen.getAllByRole('menu').at(-1)!;
    expect(within(submenu).queryByRole('menuitem', { name: 'Old' })).toBeNull();
    fireEvent.click(within(submenu).getByRole('menuitem', { name: 'Bank statements' }));
    expect(onFolder).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  describe('folders and files under +', () => {
    const TREE: ComposerPickerItem[] = [
      {
        id: 'bank',
        label: 'Bank statements',
        trailing: 1,
        children: [{ id: 'sep', label: 'Bank statement, Sep, 5589.csv' }],
      },
      {
        id: 'close',
        label: 'September close',
        trailing: 2,
        // Loaded the first time the folder opens.
        children: () =>
          Promise.resolve([
            { id: 'tb', label: 'September trial balance.xlsx' },
            { id: 'pack', label: 'September close pack.pdf' },
          ]),
      },
      { id: 'q3', label: 'Q3 target revenue.pdf' },
    ];

    function FolderComposer({ onValue }: { onValue?: (v: string[]) => void }) {
      const [value, setValue] = useState<string[]>([]);
      const folder: ComposerMenuItem = {
        id: 'folder',
        label: 'Folder',
        submenu: {
          searchable: true,
          searchPlaceholder: 'Search 4 files',
          picker: {
            items: TREE,
            value,
            onChange: (v) => {
              setValue(v);
              onValue?.(v);
            },
            cards: true,
          },
        },
      };
      return <ChatComposer menu={(builtIns) => [...builtIns, folder]} />;
    }

    const openFolder = async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add to your message' }));
      fireEvent.click(within(screen.getByRole('menu')).getByRole('menuitem', { name: 'Folder' }));
      return screen.getAllByRole('menu').at(-1)!;
    };

    it('opens folders in place, ticks a folder as one choice, and shows it as a card', async () => {
      const onValue = vi.fn();
      inTheme(
        <ChatProvider adapter={adapter()} persistence={false} refreshOnFocus={false}>
          <FolderComposer onValue={onValue} />
        </ChatProvider>,
      );
      await screen.findByRole('textbox', { name: 'Message' });
      let panel = await openFolder();
      expect(within(panel).getByRole('textbox', { name: 'Search…' }).getAttribute('placeholder')).toBe('Search 4 files');
      const bank = within(panel).getByRole('menuitemcheckbox', { name: /Bank statements/ });
      expect(bank.getAttribute('aria-expanded')).toBe('false');
      // The row opens the folder; it doesn't tick it.
      fireEvent.click(bank);
      panel = screen.getAllByRole('menu').at(-1)!;
      expect(within(panel).getByRole('menuitemcheckbox', { name: /Bank statements/ }).getAttribute('aria-expanded')).toBe('true');
      expect(within(panel).getByRole('menuitemcheckbox', { name: 'Bank statement, Sep, 5589.csv' })).toBeTruthy();
      expect(onValue).not.toHaveBeenCalled();
      // Space ticks it, and what is inside reads as ticked.
      fireEvent.keyDown(within(panel).getByRole('menuitemcheckbox', { name: /Bank statements/ }), { key: ' ' });
      expect(onValue).toHaveBeenLastCalledWith(['bank']);
      panel = screen.getAllByRole('menu').at(-1)!;
      expect(within(panel).getByRole('menuitemcheckbox', { name: 'Bank statement, Sep, 5589.csv' }).getAttribute('aria-checked')).toBe('true');
      // The folder shows as a card in the composer (behind the open menu, so hidden from the
      // accessibility tree for now), and its × takes it out again.
      const card = screen.getByRole('article', { name: 'Bank statements', hidden: true });
      expect(within(card).getByText('Folder')).toBeTruthy();
      fireEvent.click(within(card).getByRole('button', { name: 'Remove Bank statements', hidden: true }));
      expect(onValue).toHaveBeenLastCalledWith([]);
    });

    it('loads a folder the first time it opens, and a file from it keeps its name on its card', async () => {
      inTheme(
        <ChatProvider adapter={adapter()} persistence={false} refreshOnFocus={false}>
          <FolderComposer />
        </ChatProvider>,
      );
      await screen.findByRole('textbox', { name: 'Message' });
      const panel = await openFolder();
      // → opens a folder from the keyboard.
      fireEvent.keyDown(within(panel).getByRole('menuitemcheckbox', { name: /^September close\s*\d*$/ }), { key: 'ArrowRight' });
      const pack = await screen.findByRole('menuitemcheckbox', { name: 'September close pack.pdf' });
      fireEvent.click(pack);
      const card = screen.getByRole('article', { name: 'September close pack.pdf', hidden: true });
      expect(within(card).getByText('PDF document')).toBeTruthy();
      // The folder is part-chosen now.
      expect(screen.getByRole('menuitemcheckbox', { name: /^September close\s*\d*$/ }).getAttribute('aria-checked')).toBe('mixed');
      // ← on the open folder closes it.
      fireEvent.keyDown(screen.getByRole('menuitemcheckbox', { name: /^September close\s*\d*$/ }), { key: 'ArrowLeft' });
      expect(screen.queryByRole('menuitemcheckbox', { name: 'September close pack.pdf' })).toBeNull();
    });

    it('searches into the folders it knows, opening the way to a match', async () => {
      inTheme(
        <ChatProvider adapter={adapter()} persistence={false} refreshOnFocus={false}>
          <FolderComposer />
        </ChatProvider>,
      );
      await screen.findByRole('textbox', { name: 'Message' });
      const panel = await openFolder();
      fireEvent.change(within(panel).getByRole('textbox', { name: 'Search…' }), { target: { value: 'sep, 5589' } });
      await waitFor(() => expect(screen.getByRole('menuitemcheckbox', { name: 'Bank statement, Sep, 5589.csv' })).toBeTruthy());
      expect(screen.getByRole('menuitemcheckbox', { name: /Bank statements/ }).getAttribute('aria-expanded')).toBe('true');
      expect(screen.queryByRole('menuitemcheckbox', { name: 'Q3 target revenue.pdf' })).toBeNull();
    });
  });

  it('shows a file dropped or attached as a card with what it is', async () => {
    inTheme(
      <ChatProvider
        adapter={adapter()}
        persistence={false}
        refreshOnFocus={false}
        attachments={{
          upload: async (file) => ({ url: `https://files.example/${file.name}`, filename: file.name, content_type: file.type, size: file.size, meta: {} }),
        }}
      >
        <ChatComposer />
      </ChatProvider>,
    );
    await screen.findByRole('textbox', { name: 'Message' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [new File(['a,b'], 'Trial balance.xlsx', { type: 'application/vnd.ms-excel' })] } });
    const card = await screen.findByRole('article', { name: 'Trial balance.xlsx' });
    await waitFor(() => expect(within(card).getByText('Spreadsheet')).toBeTruthy());
    fireEvent.click(within(card).getByRole('button', { name: 'Remove Trial balance.xlsx' }));
    expect(screen.queryByRole('article', { name: 'Trial balance.xlsx' })).toBeNull();
  });

  it('hides + when no item is left to show', async () => {
    inTheme(
      <ChatProvider adapter={adapter()} persistence={false} refreshOnFocus={false} scope={scope}>
        <ChatComposer menu={(builtIns) => builtIns.map((item) => ({ ...item, hidden: true }))} />
      </ChatProvider>,
    );
    await screen.findByRole('textbox', { name: 'Message' });
    expect(screen.queryByRole('button', { name: 'Add to your message' })).toBeNull();
  });
});
