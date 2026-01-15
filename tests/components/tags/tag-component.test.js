import { describe, it, expect, vi } from 'vitest';
import { renderTags } from '../../../src/components/tags/tag-component';

describe('Tag Component', () => {
  it('should generate the correct HTML for a single tag', () => {
    const tag = { id: 'tag-1', name: 'Test Tag', color: 'blue' };
    const container = document.createElement('div');
    renderTags([tag], container);
    const tagElement = container.querySelector('.tag-chip');
    expect(tagElement).not.toBeNull();
    expect(tagElement.textContent).toContain('Test Tag');
  });

  it('should apply the correct color style to the tag', () => {
    const tag = { id: 'tag-2', name: 'Color Test', color: 'red' };
    const container = document.createElement('div');
    renderTags([tag], container);
    const tagElement = container.querySelector('.tag-chip');
    expect(tagElement.style.backgroundColor).toBe('red');
  });

  it('should render multiple tags correctly', () => {
    const tags = [
      { id: 'tag-3', name: 'Tag One', color: 'green' },
      { id: 'tag-4', name: 'Tag Two', color: 'purple' },
    ];
    const container = document.createElement('div');
    renderTags(tags, container);
    const tagElements = container.querySelectorAll('.tag-chip');
    expect(tagElements.length).toBe(2);
    expect(tagElements[0].textContent).toContain('Tag One');
    expect(tagElements[1].textContent).toContain('Tag Two');
  });

  it('should handle click events on tags', () => {
    const tag = { id: 'tag-5', name: 'Clickable Tag', color: 'yellow' };
    const container = document.createElement('div');
    const onClick = vi.fn();
    renderTags([tag], container, { onClick });
    const tagElement = container.querySelector('.tag-chip');
    tagElement.click();
    expect(onClick).toHaveBeenCalledWith(tag.id);
  });

  it('should handle tag removal', () => {
    const tag = { id: 'tag-6', name: 'Removable Tag', color: 'orange' };
    const container = document.createElement('div');
    const onRemove = vi.fn();
    renderTags([tag], container, { onRemove });
    const removeButton = container.querySelector('.tag-remove');
    removeButton.click();
    expect(onRemove).toHaveBeenCalledWith(tag.id);
  });
});
