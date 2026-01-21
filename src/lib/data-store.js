import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'public/data');

const ALLOWED_FILES = /^[a-z0-9-]+\.json$/;

function validateFilename(filename) {
  if (!ALLOWED_FILES.test(filename)) {
    throw new Error(`Invalid filename: ${filename}`);
  }

  const resolved = path.resolve(DATA_DIR, filename);
  if (!resolved.startsWith(DATA_DIR)) {
    throw new Error('Path traversal detected');
  }

  return resolved;
}

export async function getCollection(filename) {
  try {
    const filePath = validateFilename(filename);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    try {
      return JSON.parse(fileContent);
    } catch (parseError) {
      console.error(`Error parsing JSON from ${filename}:`, parseError);
      return [];
    }
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

export async function saveCollection(filename, data) {
  try {
    const filePath = validateFilename(filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error saving ${filename}:`, error);
    throw error;
  }
}

export async function getItem(collectionName, id) {
  const collection = await getCollection(collectionName);
  if (!Array.isArray(collection)) {
    return collection;
  }
  return collection.find(item => item.id === id);
}

export async function saveItem(collectionName, item) {
  const collection = await getCollection(collectionName);

  // Handle object-type collections (like site-meta)
  if (!Array.isArray(collection)) {
    const merged = { ...collection, ...item };
    await saveCollection(collectionName, merged);
    return merged;
  }

  const index = collection.findIndex(i => i.id === item.id);

  if (index !== -1) {
    collection[index] = { ...collection[index], ...item };
  } else {
    collection.push(item);
  }

  await saveCollection(collectionName, collection);
  return item;
}

export async function deleteItem(collectionName, id) {
  const collection = await getCollection(collectionName);
  const newCollection = collection.filter(item => item.id !== id);
  await saveCollection(collectionName, newCollection);
  return true;
}

export async function saveSingleObject(filename, data) {
  try {
    const filePath = validateFilename(filename);
    const existing = await getCollection(filename);
    const merged = Array.isArray(existing) ? data : { ...existing, ...data };
    await fs.writeFile(filePath, JSON.stringify(merged, null, 2), 'utf-8');
    return merged;
  } catch (error) {
    console.error(`Error saving ${filename}:`, error);
    throw error;
  }
}
