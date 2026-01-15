import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  validateNotebook,
  validateSmartFolder,
  validateTag,
  SCHEMA_VERSION,
  STORAGE_KEY,
  addNotebook,
  getNotebook,
  updateNotebook,
  deleteNotebook,
  addSmartFolder,
  getSmartFolder,
  updateSmartFolder,
  deleteSmartFolder,
  addTag,
  getTag,
  updateTag,
  deleteTag,
  getAllData,
  handleMigrations,
} from '../../src/storage/schema';

// Mock Chrome Storage API
let mockStore = {};

global.chrome = {
  storage: {
    local: {
      get: vi.fn((keys, callback) => {
        const keyList = Array.isArray(keys) ? keys : [keys];
        const result = {};
        for (const key of keyList) {
          if (mockStore.hasOwnProperty(key)) {
            result[key] = mockStore[key];
          }
        }
        callback(result);
      }),
      set: vi.fn((data, callback) => {
        Object.assign(mockStore, data);
        if (callback) {
          callback();
        }
      }),
    },
  },
};

describe('Storage Schema', () => {
  beforeEach(() => {
    // Reset the mock store before each test
    mockStore = {
      [STORAGE_KEY]: {
        schemaVersion: SCHEMA_VERSION,
        notebooks: {},
        smartFolders: {},
        tags: {},
      },
    };
    chrome.storage.local.get.mockClear();
    chrome.storage.local.set.mockClear();
  });

  describe('Schema Version', () => {
    it('should have a specific version number', () => {
      expect(SCHEMA_VERSION).toBe(1);
    });
  });

  describe('Notebook Model Validation', () => {
    const baseNotebook = {
      id: 'notebook-1',
      title: 'Test Notebook',
      url: 'https://notebooklm.google.com/notebook/notebook-1',
      tags: ['tag-1'],
      metadata: { sourceCount: 5 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('should validate a correct notebook object', () => {
      expect(() => validateNotebook(baseNotebook)).not.toThrow();
    });

    it('should invalidate a notebook with missing id', () => {
        const notebook = { ...baseNotebook, id: undefined };
        expect(() => validateNotebook(notebook)).toThrow('Invalid notebook: id is required.');
    });

    it('should invalidate a notebook with missing title', () => {
        const notebook = { ...baseNotebook, title: undefined };
        expect(() => validateNotebook(notebook)).toThrow('Invalid notebook: title is required.');
    });

    it('should invalidate a notebook with an invalid url', () => {
        const notebook = { ...baseNotebook, url: 'invalid-url' };
        expect(() => validateNotebook(notebook)).toThrow('Invalid notebook: url must be a valid URL.');
    });

    it('should invalidate a notebook with missing tags array', () => {
      const notebook = { ...baseNotebook, tags: undefined };
      expect(() => validateNotebook(notebook)).toThrow('Invalid notebook: tags must be an array.');
    });

    it('should invalidate a notebook with missing metadata', () => {
        const notebook = { ...baseNotebook, metadata: undefined };
        expect(() => validateNotebook(notebook)).toThrow('Invalid notebook: metadata is required.');
    });

    it('should invalidate a notebook with invalid createdAt date', () => {
      const notebook = { ...baseNotebook, createdAt: 'invalid-date' };
      expect(() => validateNotebook(notebook)).toThrow('Invalid notebook: createdAt must be a valid ISO date string.');
    });

    it('should invalidate a notebook with invalid updatedAt date', () => {
        const notebook = { ...baseNotebook, updatedAt: 'invalid-date' };
        expect(() => validateNotebook(notebook)).toThrow('Invalid notebook: updatedAt must be a valid ISO date string.');
    });
  });

  describe('SmartFolder Model Validation', () => {
    const baseSmartFolder = {
        id: 'folder-1',
        name: 'Test Folder',
        rules: [{ field: 'title', operator: 'contains', value: 'Test' }],
        createdAt: new Date().toISOString(),
    };

    it('should validate a correct smart folder object', () => {
        expect(() => validateSmartFolder(baseSmartFolder)).not.toThrow();
    });

    it('should invalidate a smart folder with missing id', () => {
        const smartFolder = { ...baseSmartFolder, id: undefined };
        expect(() => validateSmartFolder(smartFolder)).toThrow('Invalid smartFolder: id is required.');
    });

    it('should invalidate a smart folder with missing name', () => {
        const smartFolder = { ...baseSmartFolder, name: undefined };
        expect(() => validateSmartFolder(smartFolder)).toThrow('Invalid smartFolder: name is required.');
    });

    it('should invalidate a smart folder with empty rules', () => {
        const smartFolder = { ...baseSmartFolder, rules: [] };
        expect(() => validateSmartFolder(smartFolder)).toThrow('Invalid smartFolder: rules must not be empty.');
    });

    it('should invalidate a smart folder with missing createdAt', () => {
        const smartFolder = { ...baseSmartFolder, createdAt: undefined };
        expect(() => validateSmartFolder(smartFolder)).toThrow('Invalid smartFolder: createdAt must be a valid ISO date string.');
    });
  });

  describe('Tag Model Validation', () => {
    const baseTag = {
        id: 'tag-1',
        name: 'Urgent',
        color: '#FF0000',
      };

    it('should validate a correct tag object', () => {
      expect(() => validateTag(baseTag)).not.toThrow();
    });

    it('should invalidate a tag with missing id', () => {
        const tag = { ...baseTag, id: undefined };
        expect(() => validateTag(tag)).toThrow('Invalid tag: id is required.');
    });

    it('should invalidate a tag with missing name', () => {
        const tag = { ...baseTag, name: undefined };
        expect(() => validateTag(tag)).toThrow('Invalid tag: name is required.');
    });

    it('should invalidate a tag with invalid color', () => {
        const tag = { ...baseTag, color: 'invalid-color' };
        expect(() => validateTag(tag)).toThrow('Invalid tag: color must be a valid hex code.');
    });
  });

  describe('Notebook CRUD Operations', () => {
    const notebook = {
      id: 'notebook-1',
      title: 'Test Notebook',
      url: 'https://notebooklm.google.com/notebook/notebook-1',
      tags: [],
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('should add and get a notebook', async () => {
      await addNotebook(notebook);
      const retrieved = await getNotebook('notebook-1');
      expect(retrieved).toEqual(notebook);
    });

    it('should update a notebook', async () => {
      await addNotebook(notebook);
      const updatedNotebook = { ...notebook, title: 'Updated Title' };
      await updateNotebook(updatedNotebook);
      const retrieved = await getNotebook('notebook-1');
      expect(retrieved.title).toBe('Updated Title');
    });

    it('should delete a notebook', async () => {
      await addNotebook(notebook);
      await deleteNotebook('notebook-1');
      const retrieved = await getNotebook('notebook-1');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('SmartFolder CRUD Operations', () => {
    const smartFolder = {
        id: 'folder-1',
        name: 'Test Folder',
        rules: [{ field: 'title', operator: 'contains', value: 'Test' }],
        createdAt: new Date().toISOString(),
      };

    it('should add and get a smart folder', async () => {
      await addSmartFolder(smartFolder);
      const retrieved = await getSmartFolder('folder-1');
      expect(retrieved).toEqual(smartFolder);
    });

    it('should update a smart folder', async () => {
      await addSmartFolder(smartFolder);
      const updated = { ...smartFolder, name: 'Updated Name' };
      await updateSmartFolder(updated);
      const retrieved = await getSmartFolder('folder-1');
      expect(retrieved.name).toBe('Updated Name');
    });

    it('should delete a smart folder', async () => {
      await addSmartFolder(smartFolder);
      await deleteSmartFolder('folder-1');
      const retrieved = await getSmartFolder('folder-1');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('Tag CRUD Operations', () => {
    const tag = {
        id: 'tag-1',
        name: 'Urgent',
        color: '#FF0000',
      };

    it('should add and get a tag', async () => {
      await addTag(tag);
      const retrieved = await getTag('tag-1');
      expect(retrieved).toEqual(tag);
    });

    it('should update a tag', async () => {
      await addTag(tag);
      const updated = { ...tag, name: 'Updated Name' };
      await updateTag(updated);
      const retrieved = await getTag('tag-1');
      expect(retrieved.name).toBe('Updated Name');
    });

    it('should delete a tag', async () => {
      await addTag(tag);
      await deleteTag('tag-1');
      const retrieved = await getTag('tag-1');
      expect(retrieved).toBeUndefined();
    });
  });


  describe('Schema Migration', () => {
    it('should not migrate if schema version is current', async () => {
      await handleMigrations();
      expect(chrome.storage.local.set).not.toHaveBeenCalled();
    });

    it('should migrate from a previous version', async () => {
      mockStore[STORAGE_KEY].schemaVersion = 0;
      await handleMigrations();
      expect(chrome.storage.local.set).toHaveBeenCalled();
      const setData = chrome.storage.local.set.mock.calls[0][0][STORAGE_KEY];
      expect(setData.schemaVersion).toBe(SCHEMA_VERSION);
    });
  });
});
