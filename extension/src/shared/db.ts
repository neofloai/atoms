/**
 * Atoms Studio's storage: IndexedDB in the extension's own origin, so it
 * is shared by the background worker (which files what the inspector
 * sends) and the Studio page (which edits it). It lives in this browser
 * profile only; projects move between machines as exported zips.
 */
import type { Handover } from './schema';

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface Screen {
  id: string;
  projectId: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  /** The design as it is now, edits included. */
  doc: Handover;
  /** The design as captured, kept to diff edits and to compare against. */
  original: Handover;
  /** Asset id of the screenshot taken at capture. */
  imageId?: string;
  /** Where that screenshot sits in the design, in CSS pixels. */
  imageBox?: { x: number; y: number; w: number; h: number };
  /** Asset id of a screenshot of the edited design, when one was taken. */
  renderId?: string;
}

export interface Version {
  id: string;
  screenId: string;
  createdAt: number;
  label: string;
  doc: Handover;
}

export interface Asset {
  id: string;
  blob: Blob;
}

const DB_NAME = 'atoms-studio';
const DB_VERSION = 1;

let opening: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  opening ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore('projects', { keyPath: 'id' });
      db.createObjectStore('screens', { keyPath: 'id' }).createIndex('projectId', 'projectId');
      db.createObjectStore('versions', { keyPath: 'id' }).createIndex('screenId', 'screenId');
      db.createObjectStore('assets', { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return opening;
}

type StoreName = 'projects' | 'screens' | 'versions' | 'assets';

function done<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function store(name: StoreName, mode: IDBTransactionMode = 'readonly') {
  return (await open()).transaction(name, mode).objectStore(name);
}

export const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export async function put<T>(name: StoreName, value: T): Promise<void> {
  await done((await store(name, 'readwrite')).put(value));
}

export async function get<T>(name: StoreName, id: string): Promise<T | undefined> {
  return done((await store(name)).get(id)) as Promise<T | undefined>;
}

export async function remove(name: StoreName, id: string): Promise<void> {
  await done((await store(name, 'readwrite')).delete(id));
}

export async function all<T>(name: StoreName): Promise<T[]> {
  return done((await store(name)).getAll()) as Promise<T[]>;
}

export async function byIndex<T>(name: 'screens' | 'versions', index: string, key: string): Promise<T[]> {
  return done((await store(name)).index(index).getAll(key)) as Promise<T[]>;
}

// ---------------------------------------------------------------- operations

export async function createProject(name: string): Promise<Project> {
  const now = Date.now();
  const project: Project = { id: newId(), name, createdAt: now, updatedAt: now };
  await put('projects', project);
  return project;
}

/** The project a capture from `name` files into, made on first use. */
export async function projectNamed(name: string): Promise<Project> {
  const existing = (await all<Project>('projects')).find((p) => p.name === name);
  return existing ?? createProject(name);
}

export async function saveAsset(blob: Blob): Promise<string> {
  const id = newId();
  await put<Asset>('assets', { id, blob });
  return id;
}

export async function asset(id: string | undefined): Promise<Blob | null> {
  if (!id) return null;
  return (await get<Asset>('assets', id))?.blob ?? null;
}

export async function addScreen(projectId: string, doc: Handover, image: Blob | null, imageBox?: Screen['imageBox']): Promise<Screen> {
  const now = Date.now();
  const screen: Screen = {
    id: newId(),
    projectId,
    name: doc.name,
    createdAt: now,
    updatedAt: now,
    doc: structuredClone(doc),
    original: doc,
    imageId: image ? await saveAsset(image) : undefined,
    imageBox,
  };
  await put('screens', screen);
  await touchProject(projectId);
  return screen;
}

export async function renameProject(project: Project, name: string) {
  await put('projects', { ...project, name, updatedAt: Date.now() });
}

export async function touchProject(id: string) {
  const project = await get<Project>('projects', id);
  if (project) await put('projects', { ...project, updatedAt: Date.now() });
}

export async function deleteScreen(screen: Screen) {
  for (const version of await byIndex<Version>('versions', 'screenId', screen.id)) await remove('versions', version.id);
  for (const id of [screen.imageId, screen.renderId]) if (id) await remove('assets', id);
  await remove('screens', screen.id);
}

export async function deleteProject(project: Project) {
  for (const screen of await byIndex<Screen>('screens', 'projectId', project.id)) await deleteScreen(screen);
  await remove('projects', project.id);
}

export async function saveVersion(screen: Screen, label: string): Promise<Version> {
  const version: Version = { id: newId(), screenId: screen.id, createdAt: Date.now(), label, doc: structuredClone(screen.doc) };
  await put('versions', version);
  return version;
}
