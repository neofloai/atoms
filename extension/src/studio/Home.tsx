/**
 * Every project and its screens. Screens arrive from the inspector's
 * "Edit in Atoms Studio", or from a dropped `.atoms.json` / handover zip.
 */
import * as React from 'react';
import {
  addScreen,
  all,
  asset,
  createProject,
  deleteProject,
  deleteScreen,
  put,
  projectNamed,
  renameProject,
  type Project,
  type Screen,
} from '../shared/db';
import { readHandovers } from './files';
import { Button, Toast } from './ui';

function Thumb({ screen }: { screen: Screen }) {
  const [url, setUrl] = React.useState<string | null>(null);
  React.useEffect(() => {
    let current: string | null = null;
    void asset(screen.renderId ?? screen.imageId).then((blob) => {
      if (blob) setUrl((current = URL.createObjectURL(blob)));
    });
    return () => {
      if (current) URL.revokeObjectURL(current);
    };
  }, [screen.imageId, screen.renderId]);
  return <div className="thumb" style={url ? { backgroundImage: `url(${url})` } : undefined} />;
}

const when = (t: number) => new Date(t).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export function Home({ go }: { go(path: string): void }) {
  const [projects, setProjects] = React.useState<Project[] | null>(null);
  const [screens, setScreens] = React.useState<Screen[]>([]);
  const [dragging, setDragging] = React.useState(false);
  const [toast, setToast] = React.useState<{ message: string; error?: boolean } | null>(null);
  const picker = React.useRef<HTMLInputElement>(null);

  const [bump, setBump] = React.useState(0);
  const load = async () => setBump((n) => n + 1);
  React.useEffect(() => {
    let cancelled = false;
    void Promise.all([all<Project>('projects'), all<Screen>('screens')]).then(([p, s]) => {
      if (cancelled) return;
      setProjects(p.sort((a, b) => b.updatedAt - a.updatedAt));
      setScreens(s.sort((a, b) => b.updatedAt - a.updatedAt));
    });
    return () => {
      cancelled = true;
    };
  }, [bump]);

  const importFiles = async (files: FileList | File[]) => {
    let count = 0;
    try {
      for (const file of Array.from(files)) {
        const project = await projectNamed('Imported');
        for (const { doc, image } of await readHandovers(file)) {
          await addScreen(project.id, doc, image);
          count += 1;
        }
      }
      setToast({ message: `Imported ${count} screen${count === 1 ? '' : 's'}.` });
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : String(error), error: true });
    }
    await load();
  };

  const rename = async (project: Project, name: string) => {
    if (!name.trim() || name === project.name) return;
    await renameProject(project, name.trim());
    await load();
  };

  if (!projects) return <div className="home muted">Loading…</div>;

  return (
    <div
      className={`home${dragging ? ' drop-zone' : ''}`}
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes('Files')) return;
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        void importFiles(e.dataTransfer.files);
      }}
    >
      <div className="home-head">
        <h1>Atoms Studio</h1>
        <span className="spacer" style={{ flex: 1 }} />
        <input ref={picker} type="file" accept=".json,.zip" multiple hidden onChange={(e) => e.target.files && void importFiles(e.target.files)} />
        <Button className="solid" onClick={() => picker.current?.click()}>Import</Button>
        <Button className="solid" onClick={async () => { await createProject('Untitled project'); await load(); }}>New project</Button>
      </div>
      <p className="home-lede">
        Designs captured with the Atoms Inspector, rebuilt with the real library. Open one to change its props, tokens and layout, then hand it to a developer. Drop an <span className="mono">.atoms.json</span> or a handover zip here to import it. Everything is stored in this browser.
      </p>
      {!projects.length ? (
        <div className="empty">
          No designs yet. On a page built with Atoms, open the inspector, click <strong>Export</strong>, then <strong>Edit in Atoms Studio</strong>.
        </div>
      ) : null}
      {projects.map((project) => {
        const mine = screens.filter((s) => s.projectId === project.id);
        return (
          <div className="project" key={project.id}>
            <div className="project-head">
              <input className="project-name" defaultValue={project.name} onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()} onBlur={(e) => void rename(project, e.target.value)} />
              <span className="muted">{mine.length} screen{mine.length === 1 ? '' : 's'}</span>
              <span style={{ flex: 1 }} />
              <Button
                className="danger"
                onClick={async () => {
                  if (!confirm(`Delete “${project.name}” and its ${mine.length} screen${mine.length === 1 ? '' : 's'}? This cannot be undone.`)) return;
                  await deleteProject(project);
                  await load();
                }}
              >
                Delete project
              </Button>
            </div>
            {mine.length ? (
              <div className="cards">
                {mine.map((screen) => (
                  <div className="card" key={screen.id} onClick={() => go(`/screen/${screen.id}`)}>
                    <Thumb screen={screen} />
                    <div className="meta">
                      <strong>{screen.name}</strong>
                      <span className="muted">
                        {screen.doc.pattern?.name ?? screen.doc.scope.label} · {when(screen.updatedAt)}
                      </span>
                    </div>
                    <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                      <Button
                        onClick={async () => {
                          const copy = await addScreen(project.id, structuredClone(screen.doc), await asset(screen.imageId));
                          await put('screens', { ...copy, name: `${screen.name} copy`, original: screen.original, imageBox: screen.imageBox });
                          await load();
                        }}
                      >
                        Duplicate
                      </Button>
                      {projects.length > 1 ? (
                        <select
                          className="select"
                          style={{ width: 'auto', padding: '4px 6px' }}
                          value=""
                          onChange={async (e) => {
                            if (!e.target.value) return;
                            await put('screens', { ...screen, projectId: e.target.value });
                            await load();
                          }}
                        >
                          <option value="">Move to…</option>
                          {projects.filter((p) => p.id !== project.id).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      ) : null}
                      <span style={{ flex: 1 }} />
                      <Button
                        className="danger"
                        onClick={async () => {
                          if (!confirm(`Delete “${screen.name}”? This cannot be undone.`)) return;
                          await deleteScreen(screen);
                          await load();
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty">Empty. Move screens here from another project.</div>
            )}
          </div>
        );
      })}
      {toast ? <Toast message={toast.message} error={toast.error} onDone={() => setToast(null)} /> : null}
    </div>
  );
}
