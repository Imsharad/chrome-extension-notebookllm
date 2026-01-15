import { describe, it, expect } from 'vitest';
import { evaluate } from '../../src/logic/boolean-engine';

describe('Boolean Logic Engine', () => {
  const notebook = {
    title: 'Software Engineering Principles',
    createdAt: '2024-07-28T10:00:00.000Z',
    updatedAt: '2024-07-29T12:00:00.000Z',
    tags: ['software', 'engineering', 'principles'],
    sourceCount: 15,
  };

  it('should handle a simple AND group', () => {
    const rule = {
      type: 'group',
      operator: 'AND',
      children: [
        { type: 'rule', field: 'title', operator: 'contains', value: 'Software' },
        { type: 'rule', field: 'sourceCount', operator: 'gt', value: 10 },
      ],
    };
    expect(evaluate(notebook, rule)).toBe(true);
  });

  it('should handle a simple OR group', () => {
    const rule = {
      type: 'group',
      operator: 'OR',
      children: [
        { type: 'rule', field: 'title', operator: 'contains', value: 'Physics' },
        { type: 'rule', field: 'tags', operator: 'hasTag', value: 'engineering' },
      ],
    };
    expect(evaluate(notebook, rule)).toBe(true);
  });

  it('should handle a NOT group', () => {
    const rule = {
      type: 'group',
      operator: 'NOT',
      children: [
        { type: 'rule', field: 'title', operator: 'contains', value: 'Physics' },
      ],
    };
    expect(evaluate(notebook, rule)).toBe(true);
  });

  it('should handle nested groups', () => {
    const rule = {
      type: 'group',
      operator: 'AND',
      children: [
        { type: 'rule', field: 'tags', operator: 'hasTag', value: 'software' },
        {
          type: 'group',
          operator: 'OR',
          children: [
            { type: 'rule', field: 'sourceCount', operator: 'lt', value: 10 },
            { type: 'rule', field: 'title', operator: 'startsWith', value: 'Software' },
          ],
        },
      ],
    };
    expect(evaluate(notebook, rule)).toBe(true);
  });

  it('should return false for a failing nested group', () => {
    const rule = {
      type: 'group',
      operator: 'AND',
      children: [
        { type: 'rule', field: 'tags', operator: 'hasTag', value: 'software' },
        {
          type: 'group',
          operator: 'AND',
          children: [
            { type: 'rule', field: 'sourceCount', operator: 'gt', value: 20 }, // This will fail
            { type: 'rule', field: 'title', operator: 'startsWith', value: 'Software' },
          ],
        },
      ],
    };
    expect(evaluate(notebook, rule)).toBe(false);
  });

  it('should handle various operators', () => {
    expect(evaluate(notebook, { type: 'rule', field: 'title', operator: 'is', value: 'Software Engineering Principles' })).toBe(true);
    expect(evaluate(notebook, { type: 'rule', field: 'sourceCount', operator: 'lt', value: 20 })).toBe(true);
    expect(evaluate(notebook, { type: 'rule', field: 'tags', operator: 'doesNotHaveTag', value: 'hardware' })).toBe(true);
  });

  it('should return true for a null or empty rule', () => {
    expect(evaluate(notebook, null)).toBe(true);
    expect(evaluate(notebook, {})).toBe(true);
  });
});
