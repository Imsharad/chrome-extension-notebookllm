import { describe, it, expect } from 'vitest';
import { evaluateRule, validateRule } from '../../src/logic/boolean-logic-engine.js';

// Mock notebook data for testing
const notebook = {
  metadata: {
    tags: ['tag1', 'tag2', 'project-a'],
    starred: true,
    created: '2024-01-01T00:00:00.000Z',
  },
};

describe('Boolean Logic Engine: Rule Evaluation', () => {
  // Test simple AND rules
  it('should return true for a simple AND rule where all conditions are met', () => {
    const rule = { type: 'AND', rules: [{ field: 'tags', operator: 'contains', value: 'tag1' }, { field: 'tags', operator: 'contains', value: 'tag2' }] };
    expect(evaluateRule(rule, notebook)).toBe(true);
  });

  it('should return false for a simple AND rule where one condition is not met', () => {
    const rule = { type: 'AND', rules: [{ field: 'tags', operator: 'contains', value: 'tag1' }, { field: 'tags', operator: 'contains', value: 'tag3' }] };
    expect(evaluateRule(rule, notebook)).toBe(false);
  });

  // Test simple OR rules
  it('should return true for a simple OR rule where one condition is met', () => {
    const rule = { type: 'OR', rules: [{ field: 'tags', operator: 'contains', value: 'tag1' }, { field: 'tags', operator: 'contains', value: 'tag3' }] };
    expect(evaluateRule(rule, notebook)).toBe(true);
  });

  it('should return false for a simple OR rule where no conditions are met', () => {
    const rule = { type: 'OR', rules: [{ field: 'tags', operator: 'contains', value: 'tag4' }, { field: 'tags', operator: 'contains', value: 'tag5' }] };
    expect(evaluateRule(rule, notebook)).toBe(false);
  });

  // Test simple NOT rules
  it('should return false for a NOT rule where the condition is met', () => {
    const rule = { type: 'NOT', rule: { field: 'tags', operator: 'contains', value: 'tag1' } };
    expect(evaluateRule(rule, notebook)).toBe(false);
  });

  it('should return true for a NOT rule where the condition is not met', () => {
    const rule = { type: 'NOT', rule: { field: 'tags', operator: 'contains', value: 'tag4' } };
    expect(evaluateRule(rule, notebook)).toBe(true);
  });

  // Test nested rules
  it('should handle nested AND/OR rules correctly (true case)', () => {
    const rule = {
      type: 'AND',
      rules: [
        { field: 'tags', operator: 'contains', value: 'project-a' },
        {
          type: 'OR',
          rules: [
            { field: 'tags', operator: 'contains', value: 'tag1' },
            { field: 'tags', operator: 'contains', value: 'tag4' },
          ],
        },
      ],
    };
    expect(evaluateRule(rule, notebook)).toBe(true);
  });

  it('should handle nested AND/OR rules correctly (false case)', () => {
    const rule = {
      type: 'AND',
      rules: [
        { field: 'tags', operator: 'contains', value: 'project-a' },
        {
          type: 'OR',
          rules: [
            { field: 'tags', operator: 'contains', value: 'tag4' },
            { field: 'tags', operator: 'contains', value: 'tag5' },
          ],
        },
      ],
    };
    expect(evaluateRule(rule, notebook)).toBe(false);
  });

  // Test complex nested structures
  it('should handle complex nested structures', () => {
    const complexRule = {
      type: 'OR',
      rules: [
        {
          type: 'AND',
          rules: [
            { field: 'tags', operator: 'contains', value: 'tag1' },
            { field: 'starred', operator: 'equals', value: false },
          ],
        },
        {
          type: 'AND',
          rules: [
            { field: 'tags', operator: 'contains', value: 'project-a' },
            { type: 'NOT', rule: { field: 'tags', operator: 'contains', value: 'tag3' } },
            {
              type: 'OR',
              rules: [
                { field: 'starred', operator: 'equals', value: true },
                { field: 'created', operator: 'greater_than', value: '2025-01-01T00:00:00.000Z' },
              ],
            },
          ],
        },
      ],
    };
    expect(evaluateRule(complexRule, notebook)).toBe(true);
  });

  // Test edge cases
  it('should throw an error for an empty rule', () => {
    expect(() => evaluateRule({}, notebook)).toThrow('Invalid rule structure');
  });

  it('should throw an error for an invalid rule type', () => {
    const rule = { type: 'XOR', rules: [] };
    expect(() => evaluateRule(rule, notebook)).toThrow('Unknown rule type: XOR');
  });
});

describe('Boolean Logic Engine: Rule Validation', () => {
  // Test rule validation
  it('should return true for a valid simple rule', () => {
    const rule = { field: 'tags', operator: 'contains', value: 'tag1' };
    expect(validateRule(rule)).toBe(true);
  });

  it('should return true for a valid nested rule', () => {
    const rule = {
      type: 'AND',
      rules: [
        { field: 'tags', operator: 'contains', value: 'tag1' },
        { type: 'NOT', rule: { field: 'starred', operator: 'equals', value: false } },
      ],
    };
    expect(validateRule(rule)).toBe(true);
  });

  it('should throw an error for an invalid rule structure', () => {
    const rule = { type: 'AND' }; // Missing 'rules'
    expect(() => validateRule(rule)).toThrow('Invalid rule structure: Missing "rules" array for AND type.');
  });

  it('should throw an error for a rule with an unknown operator', () => {
    const rule = { field: 'tags', operator: 'is', value: 'tag1' };
    expect(() => validateRule(rule)).toThrow('Invalid simple rule: Unknown operator "is".');
  });

  it('should throw an error for an invalid NOT rule', () => {
    const rule = { type: 'NOT' }; // Missing 'rule'
    expect(() => validateRule(rule)).toThrow('Invalid rule structure: Missing "rule" object for NOT type.');
  });
});
