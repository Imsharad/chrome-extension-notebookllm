import { describe, it, expect } from 'vitest';
import { filterNotebooks } from '../../src/logic/filter';
import { Notebook } from '../../src/storage/schema';

describe('Filtering Function', () => {
  const notebooks = [
    new Notebook({ id: '1', title: 'Alpha Project', tags: ['work', 'project'], sourceCount: 10 }),
    new Notebook({ id: '2', title: 'Beta Project', tags: ['personal', 'project'], sourceCount: 5 }),
    new Notebook({ id: '3', title: 'Gamma Thesis', tags: ['work', 'research'], sourceCount: 20 }),
    new Notebook({ id: '4', title: 'Delta Notes', tags: ['personal', 'notes'], sourceCount: 2 }),
  ];

  it('should return all notebooks for a null or empty rule', () => {
    expect(filterNotebooks(notebooks, null)).toEqual(notebooks);
    expect(filterNotebooks(notebooks, {})).toEqual(notebooks);
  });

  it('should filter by a simple title rule', () => {
    const rule = { type: 'rule', field: 'title', operator: 'contains', value: 'Project' };
    const result = filterNotebooks(notebooks, rule);
    expect(result).toHaveLength(2);
    expect(result.map(n => n.id)).toEqual(['1', '2']);
  });

  it('should filter by a complex AND rule', () => {
    const rule = {
      type: 'group',
      operator: 'AND',
      children: [
        { type: 'rule', field: 'tags', operator: 'hasTag', value: 'work' },
        { type: 'rule', field: 'sourceCount', operator: 'gt', value: 15 },
      ],
    };
    const result = filterNotebooks(notebooks, rule);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('should filter by a complex OR rule', () => {
    const rule = {
      type: 'group',
      operator: 'OR',
      children: [
        { type: 'rule', field: 'title', operator: 'startsWith', value: 'Alpha' },
        { type: 'rule', field: 'tags', operator: 'hasTag', value: 'notes' },
      ],
    };
    const result = filterNotebooks(notebooks, rule);
    expect(result).toHaveLength(2);
    expect(result.map(n => n.id)).toEqual(['1', '4']);
  });

  it('should handle an empty notebook list', () => {
    const rule = { type: 'rule', field: 'title', operator: 'contains', value: 'Project' };
    expect(filterNotebooks([], rule)).toEqual([]);
  });

  it('should maintain the original order of notebooks', () => {
    const rule = { type: 'rule', field: 'tags', operator: 'hasTag', value: 'project' };
    const result = filterNotebooks(notebooks, rule);
    expect(result.map(n => n.id)).toEqual(['1', '2']);
  });
});
