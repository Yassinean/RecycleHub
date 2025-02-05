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

      request.onerror = () => {
        console.error('Error opening database:', request.error);
        reject(request.error);
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'email' });
          userStore.createIndex('role', 'role', { unique: false });
          console.log('Users store created');
        }

        if (!db.objectStoreNames.contains('collections')) {
          const collectionStore = db.createObjectStore('collections', {
            keyPath: 'id',
            autoIncrement: true,
          });
          collectionStore.createIndex('userEmail', 'userEmail', { unique: false });
          collectionStore.createIndex('status', 'status', { unique: false });
          console.log('Collections store created');
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('Database opened successfully');
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
          
          console.log('Adding data to store:', storeName, data);
          const request = store.add(data);

          request.onsuccess = () => {
            console.log('Data added successfully');
            resolve(data);
          };
          
          request.onerror = () => {
            console.error('Error adding data:', request.error);
            reject(request.error);
          };

          transaction.oncomplete = () => {
            console.log('Transaction completed');
          };

          transaction.onerror = () => {
            console.error('Transaction error:', transaction.error);
          };
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

  deleteDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(this.dbName);
      
      request.onerror = () => {
        console.error('Error deleting database:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        console.log('Database deleted successfully');
        this.db = null as any;
        resolve();
      };
    });
  }

  getAllUsers(): Observable<any[]> {
    return from(
      this.withDB((db) => {
        return new Promise<any[]>((resolve, reject) => {
          const transaction = db.transaction('users', 'readonly');
          const store = transaction.objectStore('users');
          const request = store.getAll();

          request.onsuccess = () => {
            console.log('All users:', request.result);
            resolve(request.result);
          };
          request.onerror = () => reject(request.error);
        });
      })
    );
  }

  put<T>(storeName: string, data: T): Observable<T> {
    return from(
      this.withDB((db) => {
        return new Promise<T>((resolve, reject) => {
          const transaction = db.transaction(storeName, 'readwrite');
          const store = transaction.objectStore(storeName);
          const request = store.put(data);

          request.onsuccess = () => resolve(data);
          request.onerror = () => reject(request.error);
        });
      })
    );
  }

  getAllFromIndex<T>(storeName: string, indexName: string, value: any): Observable<T[]> {
    return from(
      this.withDB((db) => {
        return new Promise<T[]>((resolve, reject) => {
          const transaction = db.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          const index = store.index(indexName);
          const request = index.getAll(value);

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
