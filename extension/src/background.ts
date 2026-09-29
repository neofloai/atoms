/**
 * Toolbar click (or Alt+Shift+I) injects the inspector into the page's
 * own JavaScript world, where React's fiber properties on DOM nodes are
 * visible. The inspector script is idempotent: a second injection finds
 * the running instance and toggles it off.
 *
 * A small bridge goes into the extension's isolated world beside it, so
 * the inspector's Export can ask for a screenshot of the tab, and hand
 * a design to Atoms Studio.
 */
import { addScreen, projectNamed, type Screen } from './shared/db';
import type { Handover } from './shared/schema';

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id === undefined) return;
  try {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['bridge.js'] });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['inspector.js'],
      world: 'MAIN',
    });
  } catch (error) {
    // chrome://, the Web Store and other protected pages refuse injection.
    console.warn('Atoms Inspector cannot run on this page.', error);
  }
});

/**
 * Screenshots for the handover export. `activeTab`, granted by the
 * toolbar click, is what allows the capture; it only covers the tab the
 * inspector was opened on, and only while that tab is the visible one.
 */
chrome.runtime.onMessage.addListener((message: { type?: string }, sender, sendResponse) => {
  if (message?.type !== 'atoms-capture' || !sender.tab?.id) return;
  const { id, windowId } = sender.tab;
  chrome.tabs
    .query({ active: true, windowId })
    .then(([active]) => {
      if (active?.id !== id) throw new Error('Switch back to the tab you are exporting and try again.');
      return chrome.tabs.captureVisibleTab(windowId, { format: 'png' });
    })
    .then((dataUrl) => sendResponse({ dataUrl }))
    .catch((error: unknown) => sendResponse({ error: error instanceof Error ? error.message : String(error) }));
  return true;
});

/**
 * "Open in Atoms Studio": files the handover (and its screenshot) under a
 * project named after the site, then opens it in a Studio tab.
 */
chrome.runtime.onMessage.addListener((message: { type?: string; doc?: Handover; image?: string | null; imageBox?: Screen['imageBox']; project?: string }, sender, sendResponse) => {
  if (message?.type !== 'atoms-studio-open' || !message.doc) return;
  (async () => {
    const image = message.image ? await (await fetch(message.image)).blob() : null;
    const project = await projectNamed(message.project || 'Designs');
    const screen = await addScreen(project.id, message.doc!, image, message.imageBox);
    await chrome.tabs.create({ url: chrome.runtime.getURL(`studio.html#/screen/${screen.id}`), index: sender.tab ? sender.tab.index + 1 : undefined });
    return { screenId: screen.id };
  })()
    .then(sendResponse)
    .catch((error: unknown) => sendResponse({ error: error instanceof Error ? error.message : String(error) }));
  return true;
});

/** The inspector's Studio button: all projects, in a tab next to the page. */
chrome.runtime.onMessage.addListener((message: { type?: string }, sender, sendResponse) => {
  if (message?.type !== 'atoms-studio-home') return;
  chrome.tabs
    .create({ url: chrome.runtime.getURL('studio.html'), index: sender.tab ? sender.tab.index + 1 : undefined })
    .then(() => sendResponse({ ok: true }))
    .catch((error: unknown) => sendResponse({ error: error instanceof Error ? error.message : String(error) }));
  return true;
});

/** Right-click the toolbar icon → "Open Atoms Studio". */
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: 'atoms-studio', title: 'Open Atoms Studio', contexts: ['action'] });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === 'atoms-studio') void chrome.tabs.create({ url: chrome.runtime.getURL('studio.html') });
});
