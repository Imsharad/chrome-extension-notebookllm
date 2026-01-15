import { describe, it, expect, vi, beforeEach } from 'vitest';
import { save, get } from '../../src/sync/storage.js';
import { compress } from '../../src/sync/compression.js';

// Mock chrome.storage API
const mockChromeStorage = {
  sync: {
    QUOTA_BYTES: 102400,
    QUOTA_BYTES_PER_ITEM: 8192,
    getBytesInUse: vi.fn(),
    set: vi.fn(),
    get: vi.fn(),
    clear: vi.fn(),
    remove: vi.fn(),
  },
  local: {
    set: vi.fn(),
    get: vi.fn(),
  },
};

vi.stubGlobal('chrome', {
  storage: mockChromeStorage,
});

describe('Hybrid Storage Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should choose chrome.storage.sync for small data', async () => {
    const key = 'testKey';
    const prefixedKey = `hybrid:${key}`;
    const value = { message: 'This is a small data load.' };
    const compressedValue = compress(JSON.stringify(value));
    // Simulate that there is plenty of space in sync storage
    mockChromeStorage.sync.getBytesInUse.mockResolvedValue(1000);

    await save(key, value);

    expect(mockChromeStorage.sync.set).toHaveBeenCalledWith({ [prefixedKey]: compressedValue });
    expect(mockChromeStorage.local.set).not.toHaveBeenCalled();
  });

  it('should fall back to chrome.storage.local when sync is full', async () => {
    const key = 'testKey';
    const prefixedKey = `hybrid:${key}`;
    const value = { message: 'This is a large data load that exceeds the sync quota.' };
    const compressedValue = compress(JSON.stringify(value));
    const valueSize = new Blob([compressedValue]).size;
    // Simulate sync storage being almost full
    mockChromeStorage.sync.getBytesInUse.mockResolvedValue(mockChromeStorage.sync.QUOTA_BYTES - valueSize + 1);

    await save(key, value);

    expect(mockChromeStorage.sync.set).not.toHaveBeenCalled();
    expect(mockChromeStorage.local.set).toHaveBeenCalledWith({ [prefixedKey]: compressedValue });
  });

  it('should migrate existing data to local storage when new data overflows sync', async () => {
    const existingKey = 'existingKey';
    const prefixedExistingKey = `hybrid:${existingKey}`;
    const existingData = { message: 'This data is already in sync storage.' };
    const compressedExistingData = compress(JSON.stringify(existingData));

    const newKey = 'newKey';
    const prefixedNewKey = `hybrid:${newKey}`;
    const newData = { message: 'This is new data that will cause an overflow.' };
    const compressedNewData = compress(JSON.stringify(newData));
    const newDataSize = new Blob([compressedNewData]).size;

    // Simulate existing data in sync storage
    mockChromeStorage.sync.get.mockResolvedValue({ [prefixedExistingKey]: compressedExistingData });
    // Simulate sync storage being almost full, so new data won't fit
    mockChromeStorage.sync.getBytesInUse.mockResolvedValue(mockChromeStorage.sync.QUOTA_BYTES - newDataSize + 1);

    await save(newKey, newData);

    // 1. It should have moved the old data to local
    expect(mockChromeStorage.local.set).toHaveBeenCalledWith({ [prefixedExistingKey]: compressedExistingData });

    // 2. It should have then saved the new data to local as well
    expect(mockChromeStorage.local.set).toHaveBeenCalledWith({ [prefixedNewKey]: compressedNewData });

    // 3. And it should have cleared the old data from sync
    expect(mockChromeStorage.sync.remove).toHaveBeenCalledWith([prefixedExistingKey]);

    // 4. Verify final state (get should now find the migrated data in local)
    mockChromeStorage.local.get.mockResolvedValue({ [prefixedExistingKey]: compressedExistingData });
    const migratedData = await get(existingKey);
    expect(migratedData).toEqual(existingData);
  });

  it('should save to local storage if data exceeds QUOTA_BYTES_PER_ITEM', async () => {
    const key = 'largeItemKey';
    const prefixedKey = `hybrid:${key}`;
    // Create a string that will exceed the per-item quota
    const largeValue = { message: 'a'.repeat(mockChromeStorage.sync.QUOTA_BYTES_PER_ITEM) };
    const compressedValue = compress(JSON.stringify(largeValue));

    await save(key, largeValue);

    expect(mockChromeStorage.local.set).toHaveBeenCalledWith({ [prefixedKey]: compressedValue });
    expect(mockChromeStorage.sync.set).not.toHaveBeenCalled();
  });

  it('should handle errors gracefully during save', async () => {
    const key = 'errorKey';
    const value = { message: 'some data' };
    const error = new Error('Failed to save');
    mockChromeStorage.sync.set.mockRejectedValue(error);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await save(key, value);

    expect(consoleSpy).toHaveBeenCalledWith("Error saving data to hybrid storage:", error);
    consoleSpy.mockRestore();
  });
});
