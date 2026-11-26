import { describe, expect, it } from 'vitest';
import { checkState, filterTree, toggleInTree, type TreeNode } from '@/src/chat/ui/shell/pickerTree';

interface Node extends TreeNode {
  label: string;
  children?: Node[];
}

const file = (id: string): Node => ({ id, label: id });
const folder = (id: string, children: Node[]): Node => ({ id, label: id, children });

// bank/ (sep.csv, aug.csv)  close/ (tb.xlsx, pack/ (a.pdf, b.pdf))  q3.pdf
const pack = folder('pack', [file('a.pdf'), file('b.pdf')]);
const close = folder('close', [file('tb.xlsx'), pack]);
const bank = folder('bank', [file('sep.csv'), file('aug.csv')]);
const root = [bank, close, file('q3.pdf')];
const childrenOf = (n: Node) => n.children;

describe('picker tree selection', () => {
  it('ticks a folder as one id, and its contents read as ticked through it', () => {
    const value = toggleInTree([bank], [], childrenOf);
    expect(value).toEqual(['bank']);
    expect(checkState(bank.children![0]!, new Set(value), true, childrenOf)).toBe('on');
  });

  it('breaks a ticked folder into the rest of its contents when one of them is unticked', () => {
    expect(toggleInTree([close, pack, pack.children![0]!], ['close'], childrenOf)).toEqual(['tb.xlsx', 'b.pdf']);
  });

  it('rolls ticked children up into their folder, level by level', () => {
    let value = toggleInTree([close, pack, pack.children![0]!], ['tb.xlsx'], childrenOf);
    expect(value).toEqual(['tb.xlsx', 'a.pdf']);
    value = toggleInTree([close, pack, pack.children![1]!], value, childrenOf);
    // b.pdf completes pack, and pack completes close.
    expect(value).toEqual(['close']);
  });

  it('shows a folder holding only some chosen contents as mixed, and ticking it takes all of it', () => {
    const value = ['a.pdf'];
    expect(checkState(close, new Set(value), false, childrenOf)).toBe('mixed');
    expect(checkState(bank, new Set(value), false, childrenOf)).toBe('off');
    expect(toggleInTree([close], value, childrenOf)).toEqual(['close']);
  });

  it('keeps what a search matches and opens the folders on the way to it', () => {
    const { nodes, open } = filterTree(root, (n) => n.label.includes('b.pdf'), childrenOf);
    expect(nodes.map((n) => n.id)).toEqual(['close']);
    expect([...open].sort()).toEqual(['close', 'pack']);
  });
});
