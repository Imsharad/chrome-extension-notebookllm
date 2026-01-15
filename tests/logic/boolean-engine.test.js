import { describe, it, expect } from 'vitest';
import { evaluate } from '../../src/logic/boolean-engine.js';

describe('Boolean Logic Engine', () => {
  const notebook = {
    title: 'Project Phoenix',
    tags: ['work', 'project', 'phoenix'],
    sourceCount: 10,
  };

  describe('Basic Operators', () => {
    // --- contains ---
    it('should handle "contains" for a matching string (case-insensitive)', () => {
      const rule = { field: 'title', operator: 'contains', value: 'phoenix' };
      expect(evaluate(notebook, rule)).toBe(true);
    });

    it('should handle "contains" for a non-matching string', () => {
      const rule = { field: 'title', operator: 'contains', value: 'alpha' };
      expect(evaluate(notebook, rule)).toBe(false);
    });

    it('should handle "contains" for a matching tag in an array (case-insensitive)', () => {
      const rule = { field: 'tags', operator: 'contains', value: 'Work' };
      expect(evaluate(notebook, rule)).toBe(true);
    });

    it('should handle "contains" for a non-matching tag in an array', () => {
      const rule = { field: 'tags', operator: 'contains', value: 'personal' };
      expect(evaluate(notebook, rule)).toBe(false);
    });

    // --- equals ---
    it('should handle "equals" for an exact match string (case-sensitive)', () => {
      const rule = { field: 'title', operator: 'equals', value: 'Project Phoenix' };
      expect(evaluate(notebook, rule)).toBe(true);
    });

    it('should handle "equals" for a non-matching string', () => {
      const rule = { field: 'title', operator: 'equals', value: 'project phoenix' };
      expect(evaluate(notebook, rule)).toBe(false);
    });

    it('should handle "equals" for a matching number', () => {
      const rule = { field: 'sourceCount', operator: 'equals', value: 10 };
      expect(evaluate(notebook, rule)).toBe(true);
    });

    it('should handle "equals" for a non-matching number', () => {
      const rule = { field: 'sourceCount', operator: 'equals', value: 99 };
      expect(evaluate(notebook, rule)).toBe(false);
    });

    // --- startsWith ---
    it('should handle "startsWith" for a matching string (case-sensitive)', () => {
        const rule = { field: 'title', operator: 'startsWith', value: 'Project' };
        expect(evaluate(notebook, rule)).toBe(true);
    });

    it('should handle "startsWith" for a non-matching string', () => {
        const rule = { field: 'title', operator: 'startsWith', value: 'Phoenix' };
        expect(evaluate(notebook, rule)).toBe(false);
    });

    it('should handle "startsWith" for a case-sensitive non-match', () => {
        const rule = { field: 'title', operator: 'startsWith', value: 'project' };
        expect(evaluate(notebook, rule)).toBe(false);
    });

    // --- greaterThan ---
    it('should handle "greaterThan" for a matching number', () => {
        const rule = { field: 'sourceCount', operator: 'greaterThan', value: 5 };
        expect(evaluate(notebook, rule)).toBe(true);
    });

    it('should handle "greaterThan" for a non-matching number (equal)', () => {
        const rule = { field: 'sourceCount', operator: 'greaterThan', value: 10 };
        expect(evaluate(notebook, rule)).toBe(false);
    });

     it('should handle "greaterThan" for a non-matching number (less)', () => {
        const rule = { field: 'sourceCount', operator: 'greaterThan', value: 15 };
        expect(evaluate(notebook, rule)).toBe(false);
    });

    // --- lessThan ---
    it('should handle "lessThan" for a matching number', () => {
        const rule = { field: 'sourceCount', operator: 'lessThan', value: 15 };
        expect(evaluate(notebook, rule)).toBe(true);
    });

    it('should handle "lessThan" for a non-matching number (equal)', () => {
        const rule = { field: 'sourceCount', operator: 'lessThan', value: 10 };
        expect(evaluate(notebook, rule)).toBe(false);
    });

     it('should handle "lessThan" for a non-matching number (greater)', () => {
        const rule = { field: 'sourceCount', operator: 'lessThan', value: 5 };
        expect(evaluate(notebook, rule)).toBe(false);
    });
  });

  describe('Logical Operators', () => {
    // --- AND ---
    it('should handle "AND" with all true conditions', () => {
      const rule = {
        type: 'AND',
        conditions: [
          { field: 'title', operator: 'contains', value: 'Phoenix' },
          { field: 'sourceCount', operator: 'greaterThan', value: 5 },
        ],
      };
      expect(evaluate(notebook, rule)).toBe(true);
    });

    it('should handle "AND" with one false condition', () => {
      const rule = {
        type: 'AND',
        conditions: [
          { field: 'title', operator: 'contains', value: 'Phoenix' },
          { field: 'sourceCount', operator: 'greaterThan', value: 20 },
        ],
      };
      expect(evaluate(notebook, rule)).toBe(false);
    });

    // --- OR ---
    it('should handle "OR" with one true condition', () => {
      const rule = {
        type: 'OR',
        conditions: [
          { field: 'title', operator: 'contains', value: 'Alpha' },
          { field: 'sourceCount', operator: 'greaterThan', value: 5 },
        ],
      };
      expect(evaluate(notebook, rule)).toBe(true);
    });

    it('should handle "OR" with all false conditions', () => {
      const rule = {
        type: 'OR',
        conditions: [
          { field: 'title', operator: 'contains', value: 'Alpha' },
          { field: 'sourceCount', operator: 'greaterThan', value: 20 },
        ],
      };
      expect(evaluate(notebook, rule)).toBe(false);
    });

    // --- NOT ---
    it('should return true when negating a false condition', () => {
        const rule = {
            type: 'NOT',
            condition: { field: 'title', operator: 'contains', value: 'Alpha' } // This condition is false
        };
        expect(evaluate(notebook, rule)).toBe(true);
    });

    it('should return false when negating a true condition', () => {
        const rule = {
            type: 'NOT',
            condition: { field: 'title', operator: 'contains', value: 'Phoenix' } // This condition is true
        };
        expect(evaluate(notebook, rule)).toBe(false);
    });
  });

  describe('Nested Conditions', () => {
    it('should handle a nested AND within an OR', () => {
      const rule = {
        type: 'OR',
        conditions: [
          { field: 'title', operator: 'contains', value: 'Alpha' }, // false
          {
            type: 'AND',
            conditions: [
              { field: 'sourceCount', operator: 'greaterThan', value: 5 }, // true
              { field: 'tags', operator: 'contains', value: 'work' }, // true
            ],
          },
        ],
      };
      expect(evaluate(notebook, rule)).toBe(true);
    });

    it('should handle a nested OR within an AND', () => {
      const rule = {
        type: 'AND',
        conditions: [
          { field: 'title', operator: 'contains', value: 'Project' }, // true
          {
            type: 'OR',
            conditions: [
              { field: 'sourceCount', operator: 'lessThan', value: 5 }, // false
              { field: 'tags', operator: 'contains', value: 'personal' }, // false
            ],
          },
        ],
      };
      expect(evaluate(notebook, rule)).toBe(false);
    });

    it('should handle a NOT within a nested structure', () => {
        const rule = {
            type: 'AND',
            conditions: [
              { field: 'title', operator: 'contains', value: 'Project' }, // true
              {
                type: 'NOT',
                condition: { field: 'tags', operator: 'contains', value: 'personal' } // !false -> true
              }
            ]
        };
        expect(evaluate(notebook, rule)).toBe(true);
    });

    it('should handle deeply nested conditions', () => {
        const rule = {
            type: 'OR',
            conditions: [
                { field: 'tags', operator: 'contains', value: 'personal'}, // false
                {
                    type: 'AND',
                    conditions: [
                        { field: 'sourceCount', operator: 'greaterThan', value: 5}, // true
                        {
                            type: 'OR',
                            conditions: [
                                { field: 'title', operator: 'startsWith', value: 'Project' }, // true
                                { field: 'title', operator: 'contains', value: 'meeting' } // false
                            ]
                        }
                    ]
                }
            ]
        };
        expect(evaluate(notebook, rule)).toBe(true);
    });
  });

  describe('Edge Cases and Malformed Rules', () => {
    it('should return false for an empty rule', () => {
      const rule = {};
      expect(evaluate(notebook, rule)).toBe(false);
    });

    it('should return false for a rule with a missing operator', () => {
      const rule = { field: 'title', value: 'Project' };
      expect(evaluate(notebook, rule)).toBe(false);
    });

    it('should return false for a rule with an invalid operator', () => {
      const rule = { field: 'title', operator: 'isExactly', value: 'Project' };
      expect(evaluate(notebook, rule)).toBe(false);
    });

    it('should return false for a rule with a non-existent field', () => {
      const rule = { field: 'author', operator: 'contains', value: 'John' };
      expect(evaluate(notebook, rule)).toBe(false);
    });

    it('should handle an empty conditions array for AND', () => {
        const rule = { type: 'AND', conditions: [] };
        expect(evaluate(notebook, rule)).toBe(true);
    });

    it('should handle an empty conditions array for OR', () => {
        const rule = { type: 'OR', conditions: [] };
        expect(evaluate(notebook, rule)).toBe(false);
    });
  });
});
