import { test, expect } from 'vitest';
import { Notebook, SmartFolder, Tag } from '../../src/storage/schema.js';

test('Notebook can be instantiated with default values', () => {
  const notebook = new Notebook('Test Notebook', 'some-uuid');
  expect(notebook.title).toBe('Test Notebook');
  expect(notebook.uuid).toBe('some-uuid');
  expect(notebook.tags).toEqual([]);
  expect(notebook.createdAt).toBeInstanceOf(Date);
  expect(notebook.updatedAt).toBeInstanceOf(Date);
});

test('SmartFolder can be instantiated with a rule', () => {
  const rule = { type: 'simple', field: 'title', operator: 'contains', value: 'Test' };
  const folder = new SmartFolder('Test Folder', rule);
  expect(folder.name).toBe('Test Folder');
  expect(folder.rule).toEqual(rule);
});

test('Tag can be instantiated with a name and color', () => {
  const tag = new Tag('Test Tag', '#FF0000');
  expect(tag.name).toBe('Test Tag');
  expect(tag.color).toBe('#FF0000');
});
