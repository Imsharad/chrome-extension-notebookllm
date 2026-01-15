import LZString from 'lz-string';

export function compress(string) {
  return LZString.compress(string);
}

export function decompress(string) {
  return LZString.decompress(string);
}
