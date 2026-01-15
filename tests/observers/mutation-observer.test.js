import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Replicate __dirname functionality in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { MutationObserverManager } from '../../src/observers/mutation-observer.js';

const fixturesPath = path.resolve(__dirname, '..', 'fixtures', 'dom-snapshots');
const initialLoadHTML = fs.readFileSync(path.join(fixturesPath, 'initial-load.html'), 'utf-8');
const appLoadedHTML = fs.readFileSync(path.join(fixturesPath, 'app-loaded.html'), 'utf-8');
const listChangedHTML = fs.readFileSync(path.join(fixturesPath, 'notebook-list-changed.html'), 'utf-8');

describe('MutationObserverManager', () => {
  let dom;
  let observer;

  beforeEach(() => {
    dom = new JSDOM(initialLoadHTML, { url: 'https://notebooklm.google.com/' });
    global.window = dom.window;
    global.document = dom.window.document;
    global.MutationObserver = dom.window.MutationObserver;
  });

  afterEach(() => {
    observer?.disconnect();
    vi.restoreAllMocks();
  });

  it('should detect when the app is loaded', async () => {
    const onAppLoaded = vi.fn();
    observer = new MutationObserverManager();
    observer.on('appLoaded', onAppLoaded);
    observer.observe(document.body);

    // Simulate the application loading by replacing the entire document body
    document.body.innerHTML = appLoadedHTML;

    await vi.waitFor(() => {
      expect(onAppLoaded).toHaveBeenCalled();
    });

    expect(onAppLoaded).toHaveBeenCalledTimes(1);
  });

  it('should detect when the notebook list changes', async () => {
    // Start with the app already loaded
    dom.reconfigure({ url: 'https://notebooklm.google.com/' });
    dom.window.document.body.innerHTML = appLoadedHTML;

    const onNotebookListChanged = vi.fn();
    observer = new MutationObserverManager();
    // Manually set the initial state since we're starting with a loaded DOM
    observer.currentState = 'appLoaded';
    observer.on('notebookListChanged', onNotebookListChanged);
    observer.observe(document.querySelector('#notebook-grid'));


    // Simulate a change in the notebook list
    const notebookGrid = document.querySelector('#notebook-grid');
    notebookGrid.innerHTML = listChangedHTML;

    await vi.waitFor(() => {
      expect(onNotebookListChanged).toHaveBeenCalled();
    });
    expect(onNotebookListChanged).toHaveBeenCalledTimes(1);
  });

  it('should debounce rapid mutations', async () => {
    vi.useFakeTimers();
    const onNotebookListChanged = vi.fn();
    observer = new MutationObserverManager({ debounce: 100 }); // 100ms debounce
    observer.on('notebookListChanged', onNotebookListChanged);
    observer.currentState = 'appLoaded'; // Start in the loaded state
    observer.observe(document.body);

    const notebookGrid = document.createElement('div');
    notebookGrid.id = 'notebook-grid';
    document.body.appendChild(notebookGrid);

    // Simulate rapid changes
    notebookGrid.innerHTML = '<a href="./notebook/1">Notebook 1</a>';
    notebookGrid.innerHTML = '<a href="./notebook/2">Notebook 2</a>';
    notebookGrid.innerHTML = '<a href="./notebook/3">Notebook 3</a>';

    // The handler should not have been called yet
    expect(onNotebookListChanged).not.toHaveBeenCalled();

    // Wait for the MutationObserver microtask to execute, which sets the timer
    await Promise.resolve();

    // Advance time by the debounce period
    vi.advanceTimersByTime(100);

    // Now the handler should have been called exactly once
    expect(onNotebookListChanged).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('should detect navigation state changes', async () => {
    // Start with the app already loaded
    document.body.innerHTML = appLoadedHTML;
    const onNavigation = vi.fn();
    observer = new MutationObserverManager();
    observer.on('navigation', onNavigation);
    observer.currentState = 'appLoaded'; // Start in the loaded state
    observer.observe(document.body);

    // Simulate navigating away (grid disappears)
    const notebookGrid = document.querySelector('#notebook-grid');
    notebookGrid.remove();

    // Allow the mutation observer to process the removal
    await Promise.resolve();

    // Simulate navigating back (grid reappears)
    document.body.innerHTML = appLoadedHTML;

    await vi.waitFor(() => {
        expect(onNavigation).toHaveBeenCalled();
    });

    expect(onNavigation).toHaveBeenCalledTimes(1);
  });

  it('should detect when a notebook is renamed', async () => {
    // Start with the app already loaded
    document.body.innerHTML = appLoadedHTML;
    const onNotebookRenamed = vi.fn();
    observer = new MutationObserverManager();
    observer.on('notebookListChanged', onNotebookRenamed);
    observer.currentState = 'appLoaded'; // Start in the loaded state
    observer.observe(document.body);

    // Simulate renaming a notebook
    const notebookTitle = document.querySelector('a[href="./notebook/notebook-id-1"] [role="heading"]');
    notebookTitle.textContent = 'Notebook 1 - Renamed';

    await vi.waitFor(() => {
        expect(onNotebookRenamed).toHaveBeenCalled();
    });

    expect(onNotebookRenamed).toHaveBeenCalledTimes(1);
  });
});
