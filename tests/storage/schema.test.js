import { describe, it, expect } from 'vitest';
import { Notebook, SmartFolder } from '../../src/storage/schema';

describe('Storage Schema', () => {
  it('should create a Notebook with the correct properties', () => {
    const notebook = new Notebook({
      id: 'notebook-1',
      title: 'My Notebook',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      tags: ['tag1', 'tag2'],
      sourceCount: 5,
    });

    expect(notebook.id).toBe('notebook-1');
    expect(notebook.title).toBe('My Notebook');
    expect(notebook.createdAt).toBe('2024-01-01T00:00:00.000Z');
    expect(notebook.updatedAt).toBe('2024-01-01T00:00:00.000Z');
    expect(notebook.tags).toEqual(['tag1', 'tag2']);
    expect(notebook.sourceCount).toBe(5);
  });

  it('should create a SmartFolder with the correct properties', () => {
    const rule = {
      type: 'group',
      operator: 'AND',
      children: [
        { type: 'rule', field: 'title', operator: 'contains', value: 'Test' },
      ],
    };

    const smartFolder = new SmartFolder({
      id: 'sf-1',
      name: 'Test Smart Folder',
      rule,
      createdAt: '2024-01-01T00:00:00.000Z',
    });

    expect(smartFolder.id).toBe('sf-1');
    expect(smartFolder.name).toBe('Test Smart Folder');
    expect(smartFolder.rule).toEqual(rule);
    expect(smartFolder.createdAt).toBe('2024-01-01T00:00:00.000Z');
  });
});
