import { test, expect } from 'vitest';
import { evaluateRule } from '../../src/logic/boolean-engine.js';

const notebook = {
  title: 'My Test Notebook',
  createdAt: new Date('2024-01-15'),
  sourceCount: 10,
  tags: ['testing', 'development'],
};

test('evaluates a simple "contains" rule correctly', () => {
  const rule = {
    type: 'rule',
    field: 'title',
    operator: 'contains',
    value: 'Test',
  };
  expect(evaluateRule(notebook, rule)).toBe(true);
});

test('evaluates a complex AND rule correctly', () => {
  const rule = {
    type: 'group',
    operator: 'AND',
    children: [
      { type: 'rule', field: 'title', operator: 'startsWith', value: 'My' },
      { type: 'rule', field: 'sourceCount', operator: 'greaterThan', value: 5 },
    ],
  };
  expect(evaluateRule(notebook, rule)).toBe(true);
});

test('evaluates a complex OR rule correctly', () => {
  const rule = {
    type: 'group',
    operator: 'OR',
    children: [
      { type: 'rule', field: 'title', operator: 'is', value: 'Wrong Title' },
      { type: 'rule', field: 'tags', operator: 'contains', value: 'testing' },
    ],
  };
  expect(evaluateRule(notebook, rule)).toBe(true);
});

test('evaluates a nested rule correctly', () => {
  const rule = {
    type: 'group',
    operator: 'AND',
    children: [
      { type: 'rule', field: 'title', operator: 'contains', value: 'Notebook' },
      {
        type: 'group',
        operator: 'OR',
        children: [
          { type: 'rule', field: 'sourceCount', operator: 'lessThan', value: 5 },
          { type: 'rule', field: 'tags', operator: 'contains', value: 'development' },
        ],
      },
    ],
  };
  expect(evaluateRule(notebook, rule)).toBe(true);
});
