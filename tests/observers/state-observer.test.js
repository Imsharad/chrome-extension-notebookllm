import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import StateObserver from '../../src/observers/state-observer';

const fixturesDir = path.resolve(__dirname, '../fixtures/dom-snapshots');
const initialLoadHtml = fs.readFileSync(path.join(fixturesDir, 'initial-load.html'), 'utf-8');
const appLoadedHtml = fs.readFileSync(path.join(fixturesDir, 'app-loaded.html'), 'utf-8');
const newNotebookAddedHtml = fs.readFileSync(path.join(fixturesDir, 'new-notebook-added.html'), 'utf-8');

describe('StateObserver', () => {
  let dom;
  let observer;

  beforeEach(() => {
    dom = new JSDOM(initialLoadHtml, { url: 'https://notebooklm.google.com' });
    global.window = dom.window;
    global.document = dom.window.document;
    global.MutationObserver = dom.window.MutationObserver;
  });

  afterEach(() => {
    if (observer) {
      observer.disconnect();
    }
    vi.restoreAllMocks();
  });

  it('should detect the "App Loaded" state transition', () => {
    const onStateChange = vi.fn();
    observer = new StateObserver(document.body, onStateChange);
    observer.connect();

    // Simulate the app loading by changing the DOM
    document.body.innerHTML = appLoadedHtml;

    return new Promise(resolve => {
      setTimeout(() => {
        expect(onStateChange.mock.calls).toEqual([[{ 'app-state': 'loaded' }]]);
        resolve();
      }, 0);
    });
  });

  it('should detect page transitions to loading state', () => {
    const onStateChange = vi.fn();
    document.body.innerHTML = appLoadedHtml; // Start with app loaded
    observer = new StateObserver(document.body, onStateChange);
    observer.connect();
    onStateChange.mockClear();

    // Simulate a page transition by reverting to the loading state
    document.body.innerHTML = initialLoadHtml;

    return new Promise(resolve => {
      setTimeout(() => {
        expect(onStateChange.mock.calls).toEqual([[{ 'app-state': 'loading' }]]);
        resolve();
      }, 0);
    });
  });

  it('should detect new notebook additions without firing redundant events', () => {
    const onStateChange = vi.fn();
    document.body.innerHTML = appLoadedHtml; // Start with app loaded
    observer = new StateObserver(document.body, onStateChange);
    observer.connect();
    onStateChange.mockClear();

    // Simulate a new notebook being added
    document.body.innerHTML = newNotebookAddedHtml;

    return new Promise(resolve => {
      setTimeout(() => {
        // Only the 'updated' event should be fired, not another 'loaded' event.
        expect(onStateChange.mock.calls).toEqual([
          [{ 'notebook-list-state': 'updated' }],
        ]);
        resolve();
      }, 0);
    });
  });

  it('should not call the callback after being disconnected', () => {
    const onStateChange = vi.fn();
    observer = new StateObserver(document.body, onStateChange);
    observer.connect();
    observer.disconnect();

    // Simulate a DOM change
    document.body.innerHTML = appLoadedHtml;

    return new Promise(resolve => {
      setTimeout(() => {
        expect(onStateChange).not.toHaveBeenCalled();
        resolve();
      }, 0);
    });
  });
});
