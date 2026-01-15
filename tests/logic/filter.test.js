import { test, expect } from 'vitest';
import { filterNotebooks } from '../../src/logic/filter.js';
import { Notebook } from '../../src/storage/schema.js';

const notebooks = [
  new Notebook('First Notebook', 'uuid1'),
  new Notebook('Second Notebook', 'uuid2'),
  new Notebook('Third Note', 'uuid3'),
];
notebooks[0].tags = ['work', 'project'];
notebooks[1].tags = ['personal'];
notebooks[2].tags = ['work'];

test('filters notebooks with a simple rule', () => {
  const rule = {
    type: 'rule',
    field: 'title',
    operator: 'contains',
    value: 'Notebook',
  };
  const filtered = filterNotebooks(notebooks, rule);
  expect(filtered.length).toBe(2);
  expect(filtered[0].title).toBe('First Notebook');
  expect(filtered[1].title).toBe('Second Notebook');
});

test('filters notebooks with a complex rule', () => {
  const rule = {
    type: 'group',
    operator: 'AND',
    children: [
      { type: 'rule', field: 'tags', operator: 'contains', value: 'work' },
      { type: 'rule', field: 'title', operator: 'startsWith', value: 'First' },
    ],
  };
  const filtered = filterNotebooks(notebooks, rule);
  expect(filtered.length).toBe(1);
  expect(filtered[0].title).toBe('First Notebook');
});

test('handles an empty notebook list', () => {
  const rule = {
    type: 'rule',
    field: 'title',
    operator: 'contains',
    value: 'Notebook',
  };
  const filtered = filterNotebooks([], rule);
  expect(filtered.length).toBe(0);
});

test('handles no matching notebooks', () => {
  const rule = {
    type: 'rule',
    field: 'title',
    operator: 'is',
    value: 'Non-existent',
  };
  const filtered = filterNotebooks(notebooks, rule);
  expect(filtered.length).toBe(0);
});

test('handles all notebooks matching', () => {
  const rule = {
    type: 'rule',
    field: 'title',
    operator: 'contains',
    value: 'Note',
  };
  const filtered = filterNotebooks(notebooks, rule);
  expect(filtered.length).toBe(3);
});
