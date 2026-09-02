// Safe storage utility with in-memory fallback for sandboxed iframes and blockages
const isStorageAvailable = () => {
  try {
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

const storageAvailable = isStorageAvailable();
const memoryStorage: Record<string, string> = {};

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (storageAvailable) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      console.warn("Storage item retrieval failed, resorting to memory fallback.", e);
    }
    return key in memoryStorage ? memoryStorage[key] : null;
  },

  setItem: (key: string, value: string): void => {
    try {
      if (storageAvailable) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      console.warn("Storage setItem failed, writing to memory fallback.", e);
    }
    memoryStorage[key] = String(value);
  },

  removeItem: (key: string): void => {
    try {
      if (storageAvailable) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch (e) {
      console.warn("Storage removeItem failed, deleting from memory fallback.", e);
    }
    delete memoryStorage[key];
  },

  clear: (): void => {
    try {
      if (storageAvailable) {
        window.localStorage.clear();
        return;
      }
    } catch (e) {
      console.warn("Storage clear failed, clearing memory store.", e);
    }
    for (const key in memoryStorage) {
      delete memoryStorage[key];
    }
  },
};
