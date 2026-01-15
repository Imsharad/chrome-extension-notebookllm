import { compress, decompress } from './compression.js';

// NOTE: This implementation does not handle concurrent access.
// If multiple save operations are initiated at the same time, it could
// lead to a race condition where the migration logic is triggered
// multiple times, or data is overwritten unexpectedly.
const KEY_PREFIX = 'hybrid:';

export async function save(key, value) {
  try {
    const SYNC_QUOTA = chrome.storage.sync.QUOTA_BYTES;
    const QUOTA_PER_ITEM = chrome.storage.sync.QUOTA_BYTES_PER_ITEM;
    const prefixedKey = `${KEY_PREFIX}${key}`;
    const compressedValue = compress(JSON.stringify(value));
    const valueSize = new Blob([compressedValue]).size;

    if (valueSize > QUOTA_PER_ITEM) {
      // Data is too large even for a single item in sync, so save to local
      await chrome.storage.local.set({ [prefixedKey]: compressedValue });
      return;
    }

    const bytesInUse = await chrome.storage.sync.getBytesInUse();

    if (bytesInUse + valueSize < SYNC_QUOTA) {
      await chrome.storage.sync.set({ [prefixedKey]: compressedValue });
    } else {
      // Check if there's existing data in sync that needs to be migrated
      const allSyncData = await chrome.storage.sync.get(null);
      if (allSyncData) {
        const hybridSyncData = Object.entries(allSyncData)
          .filter(([key]) => key.startsWith(KEY_PREFIX))
          .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

        if (Object.keys(hybridSyncData).length > 0) {
          await chrome.storage.local.set(hybridSyncData);
          const keysToRemove = Object.keys(hybridSyncData);
          await chrome.storage.sync.remove(keysToRemove);
        }
      }
      await chrome.storage.local.set({ [prefixedKey]: compressedValue });
    }
  } catch (error) {
    console.error("Error saving data to hybrid storage:", error);
    // Depending on the desired behavior, you could re-throw the error
    // or handle it in a way that the user is notified.
  }
}

export async function get(key) {
  try {
    const prefixedKey = `${KEY_PREFIX}${key}`;
    let data = await chrome.storage.sync.get(prefixedKey);
    if (data && data[prefixedKey]) {
      return JSON.parse(decompress(data[prefixedKey]));
    }

    data = await chrome.storage.local.get(prefixedKey);
    if (data && data[prefixedKey]) {
      return JSON.parse(decompress(data[prefixedKey]));
    }

    return null;
  } catch (error) {
    console.error("Error getting data from hybrid storage:", error);
    return null;
  }
}
