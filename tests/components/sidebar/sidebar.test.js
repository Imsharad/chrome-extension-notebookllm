import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Sidebar from '../../../src/components/sidebar/sidebar';

describe('Sidebar Component', () => {
  let sidebar;

  beforeEach(() => {
    sidebar = document.createElement('sidebar-component');
    document.body.appendChild(sidebar);
  });

  afterEach(() => {
    document.body.removeChild(sidebar);
  });

  it('should render correctly', () => {
    expect(sidebar).toBeInstanceOf(HTMLElement);
  });

  it('should be expanded by default', () => {
    expect(sidebar.collapsed).toBe(false);
    expect(sidebar.hasAttribute('collapsed')).toBe(false);
  });

  it('should toggle when the button is clicked', () => {
    const toggleButton = sidebar.shadowRoot.getElementById('toggle-btn');
    expect(sidebar.collapsed).toBe(false);

    toggleButton.click();
    expect(sidebar.collapsed).toBe(true);
    expect(sidebar.hasAttribute('collapsed')).toBe(true);

    toggleButton.click();
    expect(sidebar.collapsed).toBe(false);
    expect(sidebar.hasAttribute('collapsed')).toBe(false);
  });

  it('should have a shadow root', () => {
    expect(sidebar.shadowRoot).toBeTruthy();
  });

  it('should have basic styles', () => {
    const style = sidebar.shadowRoot.querySelector('style');
    expect(style.textContent).toContain(':host([collapsed])');
  });
});
