/**
 * Every place the design leaves the library, with a way to settle each:
 * snap an off-token value to the token it sits nearest, remove an `sx`
 * that restyles a component, or accept it as a library gap with a note
 * for the developer.
 */
import { describeOverride } from './overrides';
import * as React from 'react';
import { find, liveDeviations, removeSx, setStyle } from './model';
import { styleForToken, styleKind } from './tokens';
import { Button, CommitInput } from './ui';

import type { Deviation, Handover } from '../shared/schema';
import type { Update } from './DesignPanel';

const KIND: Record<Deviation['kind'], string> = {
  sx: 'sx override',
  style: 'style prop',
  drift: 'colour drift',
  'off-token': 'off-token value',
  override: 'Studio override',
};

/** Token paths a deviation's note suggests (`nearest spacing.component.sm`, `between A (4) and B (8)`). */
function suggestions(d: Deviation): string[] {
  const out = new Set<string>();
  for (const m of (d.note ?? '').matchAll(/\b((?:spacing|radius|surface|text|border|icon|typography|responsive)[\w.[\]']*)/g)) out.add(m[1]);
  return [...out];
}

const keyOf = (d: Deviation) => [d.kind, d.component, d.property, d.value].join('|');

export function Deviations({ doc, update, select }: { doc: Handover; update: Update; select(id: string): void }) {
  const live = React.useMemo(() => liveDeviations(doc), [doc]);
  const [noting, setNoting] = React.useState<string | null>(null);
  const open = live.filter((d) => !d.resolution);
  const settled = live.filter((d) => d.resolution);

  const resolve = (d: Deviation, resolution: Deviation['resolution']) =>
    update((doc) => {
      const target = doc.deviations.find((x) => keyOf(x) === keyOf(d));
      if (target) target.resolution = resolution;
    });

  const snap = (d: Deviation, path: string) =>
    update((doc) => {
      for (const id of d.nodes) {
        const node = find(doc, id)?.node;
        if (node && (node.kind === 'layout' || node.kind === 'element')) setStyle(doc, id, d.property, styleForToken(d.property, path, node.styles?.[d.property]?.css));
      }
    });

  const removeOverride = (d: Deviation) =>
    update((doc) => {
      for (const id of d.nodes) {
        const node = find(doc, id)?.node;
        if (!node) continue;
        if (d.kind === 'sx' && (node.kind === 'component' || node.kind === 'layout')) removeSx(node, d.property);
        if (d.kind === 'style' && node.kind === 'component' && node.style) {
          delete node.style[d.property];
          if (!Object.keys(node.style).length) delete node.style;
        }
        if (d.kind === 'override' && node.kind === 'component' && node.overrides) {
          delete node.overrides[d.property];
          if (!Object.keys(node.overrides).length) delete node.overrides;
        }
      }
    });

  const item = (d: Deviation, i: number) => {
    const key = keyOf(d);
    const tokens = d.kind === 'off-token' && styleKind(d.property) !== 'other' ? suggestions(d) : [];
    return (
      <div className={`dev${d.resolution ? ' done' : ''}`} key={`${key}-${i}`}>
        <div className="dev-head">
          <span className="dev-kind">{KIND[d.kind]}</span>
          {d.component ? <span className="muted">{d.component}</span> : null}
          {d.nodes.length > 1 ? <span className="muted">× {d.nodes.length}</span> : null}
        </div>
        <div className="dev-prop">
          {d.kind === 'override' ? describeOverride(d.property, d.value) : `${d.property}: ${d.value}`}
        </div>
        {d.note ? <div className="dev-note">{d.note}</div> : null}
        {d.resolution ? (
          <div className="dev-note">
            <span className={d.resolution.status === 'fixed' ? 'ok' : 'warn'}>{d.resolution.status === 'fixed' ? '✓ fixed' : 'accepted as a library gap'}</span>
            {d.resolution.note ? ` — ${d.resolution.note}` : ''}{' '}
            {doc.deviations.some((x) => keyOf(x) === key && x.resolution) ? <Button onClick={() => resolve(d, undefined)}>Reopen</Button> : null}
          </div>
        ) : (
          <div className="actions">
            <Button className="solid" onClick={() => select(d.nodes[0])}>Select</Button>
            {tokens.map((t) => (
              <Button key={t} className="solid" title={`Use ${t}`} onClick={() => snap(d, t)}>Use {t.split('.').pop()}</Button>
            ))}
            {d.kind === 'sx' || d.kind === 'style' || d.kind === 'override' ? <Button className="solid" onClick={() => removeOverride(d)}>Remove</Button> : null}
            {d.kind !== 'override' ? <Button className="solid" onClick={() => setNoting(key)}>Accept…</Button> : null}
          </div>
        )}
        {noting === key ? (
          <div style={{ marginTop: 6 }}>
            <CommitInput
              autoFocus
              placeholder="Why it stays — e.g. the library has no dense Chip yet"
              value=""
              onCommit={(v) => {
                resolve(d, { status: 'accepted', note: v || undefined });
                setNoting(null);
              }}
            />
            <p className="hint">Enter to accept. The developer sees it as a known gap, not a mistake.</p>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div>
      <div className="section">
        <h3>Deviations</h3>
        <p className="hint" style={{ marginTop: 0 }}>
          {open.length ? `${open.length} open` : 'None open'}
          {settled.length ? ` · ${settled.length} settled` : ''}. Each one is a place this design leaves Atoms. Fix it here, or accept it so the developer knows it is deliberate.
        </p>
      </div>
      {open.map(item)}
      {settled.map(item)}
    </div>
  );
}
