/**
 * Handing the edited design over: the JSON with every edit listed, the
 * original screenshot and one of the edited design, one zip for both, and
 * a prompt to paste into Claude. Saved versions live here too.
 */
import * as React from 'react';
import { asset, byIndex, saveVersion, type Screen, type Version } from '../shared/db';
import { zip } from '../shared/zip';
import { download, fileName } from './files';
import { diff, finalize, liveDeviations, upgrade } from './model';
import { Button, CommitInput } from './ui';

import type { Handover } from '../shared/schema';
import type { Update } from './DesignPanel';

interface Props {
  screen: Screen;
  doc: Handover;
  update: Update;
  rename(name: string): void;
  restore(doc: Handover): void;
  capture(): Promise<Blob>;
  toast(message: string, error?: boolean): void;
}

const PROMPT = (json: string) => `Rebuild this screen with @neofloai/atoms. Call build_from_json on the Atoms MCP with the JSON below (exported from Atoms Studio), then follow what it returns: look up the components it names, wire what it lists, and raise its gaps with the design team — never copy them back as sx.

\`\`\`json
${json}
\`\`\``;

export function ExportPanel({ screen, doc, update, rename, restore, capture, toast }: Props) {
  const [versions, setVersions] = React.useState<Version[]>([]);
  const [label, setLabel] = React.useState('');
  const [rendered, setRendered] = React.useState<string | null>(null);
  const edits = React.useMemo(() => diff(screen.original, doc), [screen.original, doc]);
  const deviations = React.useMemo(() => liveDeviations(doc), [doc]);
  const open = deviations.filter((d) => !d.resolution).length;
  const file = fileName(screen.name);

  const [bump, setBump] = React.useState(0);
  const loadVersions = () => setBump((n) => n + 1);
  React.useEffect(() => {
    let cancelled = false;
    void byIndex<Version>('versions', 'screenId', screen.id).then((list) => {
      if (!cancelled) setVersions(list.sort((a, b) => b.createdAt - a.createdAt));
    });
    return () => {
      cancelled = true;
    };
  }, [screen.id, bump]);

  const json = (image?: string) => {
    const out = finalize(doc, screen.original, screen.name);
    if (image) out.image = image;
    else delete out.image;
    return JSON.stringify(out, null, 2);
  };

  const run = async (label: string, action: () => Promise<string>) => {
    try {
      toast(await action());
    } catch (error) {
      toast(`${label} failed: ${error instanceof Error ? error.message : String(error)}`, true);
    }
  };

  const shoot = async () => {
    const blob = await capture();
    if (rendered) URL.revokeObjectURL(rendered);
    setRendered(URL.createObjectURL(blob));
    return blob;
  };

  return (
    <div>
      <div className="section">
        <h3>Hand over</h3>
        <label className="label-above">Name</label>
        <CommitInput value={screen.name} onCommit={(v) => v.trim() && rename(v.trim())} />
        <p className="hint">
          {edits.length} edit{edits.length === 1 ? '' : 's'} since capture · {open} open deviation{open === 1 ? '' : 's'}
        </p>
      </div>
      <div className="section">
        <h3>Note on the whole screen</h3>
        <CommitInput multiline placeholder="What this screen is for, what is still open…" value={doc.note ?? ''} onCommit={(v) => update((d) => { if (v.trim()) d.note = v; else delete d.note; })} />
      </div>
      <div className="section">
        <h3>JSON for Claude</h3>
        <div className="actions">
          <Button className="solid" onClick={() => run('Copy', async () => { await navigator.clipboard.writeText(json()); return 'Copied the JSON.'; })}>Copy JSON</Button>
          <Button className="solid" onClick={() => run('Download', async () => { download(new Blob([json()], { type: 'application/json' }), `${file}.atoms.json`); return `Saved ${file}.atoms.json.`; })}>Download JSON</Button>
          <Button className="solid" onClick={() => run('Copy', async () => { await navigator.clipboard.writeText(PROMPT(json())); return 'Copied a prompt with the JSON — paste it into Claude with the Atoms MCP connected.'; })}>Copy prompt</Button>
        </div>
        <p className="hint">The JSON carries the design as edited, with an <span className="mono">edited</span> list of what changed and every note and settled deviation.</p>
      </div>
      <div className="section">
        <h3>Images</h3>
        <div className="actions">
          <Button className="solid" onClick={() => run('Screenshot', async () => { const blob = await shoot(); download(blob, `${file}-edited.png`); return `Saved ${file}-edited.png.`; })}>Download edited</Button>
          <Button className="solid" disabled={!screen.imageId} onClick={() => run('Download', async () => { const blob = await asset(screen.imageId); if (!blob) throw new Error('no screenshot'); download(blob, `${file}-original.png`); return `Saved ${file}-original.png.`; })}>Download original</Button>
        </div>
        {rendered ? <img src={rendered} alt="Edited design" style={{ width: '100%', marginTop: 8, borderRadius: 4, outline: '1px solid rgba(255,255,255,0.1)' }} /> : null}
        <p className="hint">The edited image is the whole design at 2×, drawn from the canvas.</p>
      </div>
      <div className="section">
        <Button
          className="primary"
          style={{ width: '100%', textAlign: 'center' }}
          onClick={() =>
            run('Zip', async () => {
              const files: { name: string; data: Blob | string }[] = [];
              const original = await asset(screen.imageId);
              if (original) files.push({ name: `${file}-original.png`, data: original });
              try {
                files.push({ name: `${file}.png`, data: await shoot() });
              } catch {
                // No edited screenshot; the original still goes in.
              }
              const image = files.find((f) => f.name === `${file}.png`)?.name ?? (original ? `${file}-original.png` : undefined);
              files.unshift({ name: `${file}.atoms.json`, data: json(image) });
              download(await zip(files), `${file}.zip`);
              return `Saved ${file}.zip.`;
            })
          }
        >
          Download handover (.zip)
        </Button>
        <p className="hint">JSON, the original screenshot and one of the edited design, in one file to share.</p>
      </div>
      <div className="section">
        <h3>Versions</h3>
        <div className="row wide">
          <CommitInput value={label} placeholder="Version name, then Enter" onCommit={(v) => setLabel(v)} />
        </div>
        <Button
          className="solid"
          onClick={() =>
            run('Save', async () => {
              await saveVersion({ ...screen, doc }, label || new Date().toLocaleString());
              setLabel('');
              loadVersions();
              return 'Saved a version.';
            })
          }
        >
          Save version
        </Button>
        {versions.map((v) => (
          <div key={v.id} className="row" style={{ marginTop: 8 }}>
            <label title={v.label}>{v.label}</label>
            <span className="muted">{new Date(v.createdAt).toLocaleString()}</span>
            <Button onClick={() => restore(upgrade(v.doc))} title="Replace the design with this version (undo brings it back)">Restore</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
