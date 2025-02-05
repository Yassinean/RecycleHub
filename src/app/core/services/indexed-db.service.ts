import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IndexedDBService {
  private dbName = 'recycleHubDB';
  private version = 1;
  private db!: IDBDatabase;

  constructor() {
    this.initDB();
  }

  private initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Créer les object stores
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'email' });
          userStore.createIndex('role', 'role', { unique: false });
        }

        if (!db.objectStoreNames.contains('collections')) {
          const collectionStore = db.createObjectStore('collections', {
            keyPath: 'id',
            autoIncrement: true,
          });
          collectionStore.createIndex('userEmail', 'userEmail', {
            unique: false,
          });
          collectionStore.createIndex('status', 'status', { unique: false });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
    });
  }

  add<T>(storeName: string, data: T): Observable<T> {
    return from(
      this.withDB((db) => {
        return new Promise<T>((resolve, reject) => {
          const transaction = db.transaction(storeName, 'readwrite');
          const store = transaction.objectStore(storeName);
          const request = store.add(data);

          request.onsuccess = () => resolve(data);
          request.onerror = () => reject(request.error);
        });
      })
    );
  }

  get<T>(storeName: string, key: string): Observable<T> {
    return from(
      this.withDB((db) => {
        return new Promise<T>((resolve, reject) => {
          const transaction = db.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          const request = store.get(key);

          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      })
    );
  }

  private async withDB<T>(fn: (db: IDBDatabase) => Promise<T>): Promise<T> {
    if (!this.db) {
      await this.initDB();
    }
    return fn(this.db);
  }
}
