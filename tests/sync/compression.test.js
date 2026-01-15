import { describe, it, expect } from 'vitest';
import { compress, decompress } from '../../src/sync/compression.js';

describe('LZString compression', () => {
  it('should compress and decompress a string successfully', () => {
    const originalString = 'This is a test string for compression.';
    const compressedString = compress(originalString);
    const decompressedString = decompress(compressedString);
    expect(decompressedString).toBe(originalString);
  });
});
