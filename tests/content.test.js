import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('Content Script Injection and Resilience', () => {
  let dom;
  let window;
  let document;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      runScripts: 'dangerously',
      resources: 'usable',
    });
    window = dom.window;
    document = window.document;

    // JSDOM doesn't have a 'chrome' object, so we mock it on the window.
    window.chrome = {
      runtime: {
        getURL: (url) => path.resolve(process.cwd(), url),
      },
    };

    // Make JSDOM globals available
    global.window = window;
    global.document = document;
    global.MutationObserver = window.MutationObserver;
    global.HTMLElement = window.HTMLElement;
    global.customElements = window.customElements;
  });

  const loadScripts = () => {
    // Load the component definition first
    const sidebarScriptPath = path.resolve(process.cwd(), 'src/components/sidebar/sidebar.js');
    const sidebarScript = fs.readFileSync(sidebarScriptPath, 'utf8');
    const sidebarEl = document.createElement('script');
    sidebarEl.textContent = sidebarScript;
    document.body.appendChild(sidebarEl);

    // Load the injection script
    const contentScriptPath = path.resolve(process.cwd(), 'src/content.js');
    const contentScript = fs.readFileSync(contentScriptPath, 'utf8');
    const contentEl = document.createElement('script');
    contentEl.textContent = contentScript;
    document.body.appendChild(contentEl);
  };

  it('should inject the sidebar directly into the body', () => {
    loadScripts();

    const sidebar = document.getElementById('notebooklm-enhanced-sidebar');
    expect(sidebar).not.toBeNull();
    expect(sidebar.tagName).toBe('NOTEBOOKLM-SIDEBAR');
  });

  it('should re-inject the sidebar if it is removed', async () => {
    loadScripts();

    // Verify initial injection
    let sidebar = document.getElementById('notebooklm-enhanced-sidebar');
    expect(sidebar).not.toBeNull();

    // Remove the sidebar
    sidebar.remove();

    // Wait for the MutationObserver to trigger and re-inject
    await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay for the observer

    // Verify re-injection
    sidebar = document.getElementById('notebooklm-enhanced-sidebar');
    expect(sidebar).not.toBeNull();
  });
});
