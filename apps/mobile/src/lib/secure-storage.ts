import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Supabase auth storage backed by the OS keystore (expo-secure-store).
 * SecureStore values are limited to ~2 KB and a Supabase session can be larger,
 * so values are split into chunks: `<key>.n` holds the chunk count, `<key>.0..n-1` the data.
 * On web (dev preview only) it falls back to localStorage.
 */
const CHUNK_SIZE = 1800;

const countKey = (key: string) => `${key}.n`;
const chunkKey = (key: string, index: number) => `${key}.${index}`;

async function readCount(key: string): Promise<number> {
  const raw = await SecureStore.getItemAsync(countKey(key));
  const count = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(count) ? count : 0;
}

async function removeChunks(key: string, fromIndex: number, toExclusive: number) {
  const deletes: Promise<void>[] = [];
  for (let i = fromIndex; i < toExclusive; i++) {
    deletes.push(SecureStore.deleteItemAsync(chunkKey(key, i)));
  }
  await Promise.all(deletes);
}

const nativeStorage = {
  async getItem(key: string): Promise<string | null> {
    const count = await readCount(key);
    if (count === 0) return null;
    const parts = await Promise.all(
      Array.from({ length: count }, (_, i) => SecureStore.getItemAsync(chunkKey(key, i))),
    );
    // A missing chunk means the value is corrupt; treat as signed out.
    if (parts.some((part) => part === null)) return null;
    return parts.join('');
  },

  async setItem(key: string, value: string): Promise<void> {
    const previousCount = await readCount(key);
    const chunks = value.match(new RegExp(`[\\s\\S]{1,${CHUNK_SIZE}}`, 'g')) ?? [''];
    await Promise.all(chunks.map((chunk, i) => SecureStore.setItemAsync(chunkKey(key, i), chunk)));
    await SecureStore.setItemAsync(countKey(key), String(chunks.length));
    if (previousCount > chunks.length) await removeChunks(key, chunks.length, previousCount);
  },

  async removeItem(key: string): Promise<void> {
    const count = await readCount(key);
    await removeChunks(key, 0, count);
    await SecureStore.deleteItemAsync(countKey(key));
  },
};

const webStorage = {
  async getItem(key: string) {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
  },
  async setItem(key: string, value: string) {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
  },
  async removeItem(key: string) {
    if (typeof window !== 'undefined') window.localStorage.removeItem(key);
  },
};

export const secureStorage = Platform.OS === 'web' ? webStorage : nativeStorage;
