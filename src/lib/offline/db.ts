"use client";

export interface QueueItem {
  id: string;
  actionType: "CREATE_ORDER" | "PROCESS_PAYMENT" | "SUBMIT_FEEDBACK";
  payload: any;
  createdAt: string;
  retryCount: number;
  status: "pending" | "syncing" | "failed";
  errorMessage?: string;
}

export interface CacheItem {
  key: string;
  data: any;
  updatedAt: string;
}

const DB_NAME = "rms_offline_db";
const DB_VERSION = 1;
const STORE_QUEUE = "queue";
const STORE_CACHE = "cache";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_QUEUE)) {
        db.createObjectStore(STORE_QUEUE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_CACHE)) {
        db.createObjectStore(STORE_CACHE, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Queue Operations
export async function enqueueOfflineAction(
  actionType: QueueItem["actionType"],
  payload: any
): Promise<QueueItem> {
  const db = await openDB();
  const item: QueueItem = {
    id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actionType,
    payload,
    createdAt: new Date().toISOString(),
    retryCount: 0,
    status: "pending",
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_QUEUE, "readwrite");
    const store = tx.objectStore(STORE_QUEUE);
    const request = store.add(item);

    request.onsuccess = () => resolve(item);
    request.onerror = () => reject(request.error);
  });
}

export async function getOfflineQueue(): Promise<QueueItem[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_QUEUE, "readonly");
      const store = tx.objectStore(STORE_QUEUE);
      const request = store.getAll();

      request.onsuccess = () => {
        const items: QueueItem[] = request.result || [];
        // Sort by creation time ascending
        items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("Failed to get offline queue from IndexedDB:", err);
    return [];
  }
}

export async function updateQueueItemStatus(
  id: string,
  status: QueueItem["status"],
  errorMessage?: string,
  incrementRetry = false
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_QUEUE, "readwrite");
    const store = tx.objectStore(STORE_QUEUE);
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const item: QueueItem = getReq.result;
      if (!item) {
        resolve();
        return;
      }

      item.status = status;
      if (errorMessage) item.errorMessage = errorMessage;
      if (incrementRetry) item.retryCount += 1;

      const putReq = store.put(item);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function removeQueueItem(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_QUEUE, "readwrite");
    const store = tx.objectStore(STORE_QUEUE);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearCompletedQueue(): Promise<void> {
  const items = await getOfflineQueue();
  for (const item of items) {
    if (item.status === "syncing") continue; // Keep syncing items
    await removeQueueItem(item.id);
  }
}

// Cache Operations
export async function setCachedData(key: string, data: any): Promise<void> {
  try {
    const db = await openDB();
    const item: CacheItem = {
      key,
      data,
      updatedAt: new Date().toISOString(),
    };
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CACHE, "readwrite");
      const store = tx.objectStore(STORE_CACHE);
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("Failed to set cached data in IndexedDB:", err);
  }
}

export async function getCachedData<T = any>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CACHE, "readonly");
      const store = tx.objectStore(STORE_CACHE);
      const req = store.get(key);
      req.onsuccess = () => {
        const item: CacheItem = req.result;
        resolve(item ? item.data : null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("Failed to get cached data from IndexedDB:", err);
    return null;
  }
}
