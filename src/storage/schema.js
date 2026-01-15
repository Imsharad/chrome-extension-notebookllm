export const SCHEMA_VERSION = 1;
export const STORAGE_KEY = 'notebookNestStore';

// --- Validation Functions ---

function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function isValidHexColor(string) {
  return /^#[0-9A-F]{6}$/i.test(string);
}

function isValidISODate(string) {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(string)) return false;
  const d = new Date(string);
  return d instanceof Date && !isNaN(d) && d.toISOString() === string;
}


export function validateNotebook(notebook) {
  if (!notebook.id) throw new Error('Invalid notebook: id is required.');
  if (!notebook.title) throw new Error('Invalid notebook: title is required.');
  if (!isValidURL(notebook.url)) throw new Error('Invalid notebook: url must be a valid URL.');
  if (!Array.isArray(notebook.tags)) throw new Error('Invalid notebook: tags must be an array.');
  if (notebook.metadata === undefined) throw new Error('Invalid notebook: metadata is required.');
  if (!isValidISODate(notebook.createdAt)) throw new Error('Invalid notebook: createdAt must be a valid ISO date string.');
  if (!isValidISODate(notebook.updatedAt)) throw new Error('Invalid notebook: updatedAt must be a valid ISO date string.');
  return true;
}

export function validateSmartFolder(smartFolder) {
  if (!smartFolder.id) throw new Error('Invalid smartFolder: id is required.');
  if (!smartFolder.name) throw new Error('Invalid smartFolder: name is required.');
  if (!Array.isArray(smartFolder.rules) || smartFolder.rules.length === 0) {
    throw new Error('Invalid smartFolder: rules must not be empty.');
  }
  if (!isValidISODate(smartFolder.createdAt)) throw new Error('Invalid smartFolder: createdAt must be a valid ISO date string.');
  return true;
}

export function validateTag(tag) {
  if (!tag.id) throw new Error('Invalid tag: id is required.');
  if (!tag.name) throw new Error('Invalid tag: name is required.');
  if (!isValidHexColor(tag.color)) throw new Error('Invalid tag: color must be a valid hex code.');
  return true;
}

// --- Data Access Helper ---

export function getAllData() {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      resolve(result[STORAGE_KEY] || {
        schemaVersion: SCHEMA_VERSION,
        notebooks: {},
        smartFolders: {},
        tags: {},
      });
    });
  });
}

function saveData(data) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: data }, resolve);
  });
}


// --- Notebook CRUD ---

export async function addNotebook(notebook) {
  validateNotebook(notebook);
  const data = await getAllData();
  data.notebooks[notebook.id] = notebook;
  await saveData(data);
}

export async function getNotebook(notebookId) {
  const data = await getAllData();
  return data.notebooks[notebookId];
}

export async function updateNotebook(notebook) {
  validateNotebook(notebook);
  const data = await getAllData();
  if (!data.notebooks[notebook.id]) throw new Error('Notebook not found.');
  data.notebooks[notebook.id] = notebook;
  await saveData(data);
}

export async function deleteNotebook(notebookId) {
  const data = await getAllData();
  delete data.notebooks[notebookId];
  await saveData(data);
}

// --- SmartFolder CRUD ---

export async function addSmartFolder(smartFolder) {
    validateSmartFolder(smartFolder);
    const data = await getAllData();
    data.smartFolders[smartFolder.id] = smartFolder;
    await saveData(data);
}

export async function getSmartFolder(folderId) {
    const data = await getAllData();
    return data.smartFolders[folderId];
}

export async function updateSmartFolder(smartFolder) {
    validateSmartFolder(smartFolder);
    const data = await getAllData();
    if (!data.smartFolders[smartFolder.id]) throw new Error('SmartFolder not found.');
    data.smartFolders[smartFolder.id] = smartFolder;
    await saveData(data);
}

export async function deleteSmartFolder(folderId) {
    const data = await getAllData();
    delete data.smartFolders[folderId];
    await saveData(data);
}

// --- Tag CRUD ---

export async function addTag(tag) {
    validateTag(tag);
    const data = await getAllData();
    data.tags[tag.id] = tag;
    await saveData(data);
}

export async function getTag(tagId) {
    const data = await getAllData();
    return data.tags[tagId];
}

export async function updateTag(tag) {
    validateTag(tag);
    const data = await getAllData();
    if (!data.tags[tag.id]) throw new Error('Tag not found.');
    data.tags[tag.id] = tag;
    await saveData(data);
}

export async function deleteTag(tagId) {
    const data = await getAllData();
    delete data.tags[tagId];
    await saveData(data);
}


// --- Schema Migration ---

export async function handleMigrations() {
  const data = await getAllData();
  if (data.schemaVersion === SCHEMA_VERSION) {
    return;
  }

  if (!data.schemaVersion || data.schemaVersion < 1) {
    // Migration logic for version 1
  }

  data.schemaVersion = SCHEMA_VERSION;
  await saveData(data);
}
