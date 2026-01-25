import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'public/data');

const ALLOWED_FILES = /^[a-z0-9-]+\.json$/;

function validateFilename(filename: string): string {
  if (!ALLOWED_FILES.test(filename)) {
    throw new Error(`Invalid filename: ${filename}`);
  }

  const resolved = path.resolve(DATA_DIR, filename);
  if (!resolved.startsWith(DATA_DIR)) {
    throw new Error('Path traversal detected');
  }

  return resolved;
}

export async function getCollection<T = any>(filename: string): Promise<T> {
  try {
    const filePath = validateFilename(filename);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    try {
      return JSON.parse(fileContent) as T;
    } catch (parseError) {
      console.error(`Error parsing JSON from ${filename}:`, parseError);
      return [] as unknown as T;
    }
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [] as unknown as T;
  }
}

export async function saveCollection<T>(filename: string, data: T): Promise<boolean> {
  try {
    const filePath = validateFilename(filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error saving ${filename}:`, error);
    throw error;
  }
}

export async function getItem<T = any>(collectionName: string, id: string): Promise<T | undefined> {
  const collection = await getCollection<any[]>(collectionName);
  if (!Array.isArray(collection)) {
    return undefined;
  }
  return collection.find((item: any) => item.id === id);
}

export async function saveItem<T extends { id: string }>(collectionName: string, item: T): Promise<T> {
  const collection = await getCollection<T[] | Record<string, any>>(collectionName);

  // Handle object-type collections (like site-meta)
  if (!Array.isArray(collection)) {
    const merged = { ...collection, ...item };
    await saveCollection(collectionName, merged);
    return merged as T;
  }

  // Cast as array since we handled non-array
  const arr = collection as T[];
  const index = arr.findIndex((i: T) => i.id === item.id);

  if (index !== -1) {
    arr[index] = { ...arr[index], ...item };
  } else {
    arr.push(item);
  }

  await saveCollection(collectionName, arr);
  return item;
}

export async function deleteItem(collectionName: string, id: string): Promise<boolean> {
  const collection = await getCollection<any[]>(collectionName);
  if (!Array.isArray(collection)) return false;

  const newCollection = collection.filter((item: any) => item.id !== id);
  await saveCollection(collectionName, newCollection);
  return true;
}

export async function saveSingleObject<T extends object>(filename: string, data: T): Promise<T> {
  try {
    const filePath = validateFilename(filename);
    const existing = await getCollection<T>(filename);
    const merged = Array.isArray(existing) ? data : { ...existing, ...data };
    await fs.writeFile(filePath, JSON.stringify(merged, null, 2), 'utf-8');
    return merged;
  } catch (error) {
    console.error(`Error saving ${filename}:`, error);
    throw error;
  }
}
