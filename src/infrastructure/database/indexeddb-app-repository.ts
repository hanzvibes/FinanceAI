import type { AppRepository } from "@/shared/repository/app-repository";
import type { AppState } from "@/shared/types/domain";

const DB_NAME = "financeai";
const DB_VERSION = 1;
const STORE = "app";
const STATE_KEY = "state";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const indexedDbAppRepository: AppRepository = {
  async load() {
    const db = await openDatabase();
    return new Promise<AppState | null>((resolve, reject) => {
      const transaction = db.transaction(STORE, "readonly");
      const request = transaction.objectStore(STORE).get(STATE_KEY);
      request.onsuccess = () => resolve((request.result as AppState | undefined) ?? null);
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => db.close();
    });
  },
  async save(state) {
    const db = await openDatabase();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE, "readwrite");
      transaction.objectStore(STORE).put(state, STATE_KEY);
      transaction.oncomplete = () => { db.close(); resolve(); };
      transaction.onerror = () => { db.close(); reject(transaction.error); };
    });
  },
  async clear() {
    const db = await openDatabase();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE, "readwrite");
      transaction.objectStore(STORE).delete(STATE_KEY);
      transaction.oncomplete = () => { db.close(); resolve(); };
      transaction.onerror = () => { db.close(); reject(transaction.error); };
    });
  },
};
