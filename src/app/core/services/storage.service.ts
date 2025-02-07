import { Injectable } from '@angular/core';
import { Observable, from, throwError, of } from 'rxjs';
import { Collection } from '../models/collection.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly COLLECTIONS_KEY = 'collections';
  private readonly USERS_KEY = 'users';

  // Users
  getUsers(): User[] {
    return JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
  }

  getUser(email: string): Observable<User | null> {
    const users = this.getUsers();
    const user = users.find(u => u.email === email);
    return of(user || null);
  }

  saveUser(user: User): Observable<User> {
    const users = this.getUsers();
    const existingIndex = users.findIndex(u => u.email === user.email);
    
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    return of(user);
  }

  // Collections
  getCollections(): Collection[] {
    return JSON.parse(localStorage.getItem(this.COLLECTIONS_KEY) || '[]');
  }

  getCollection(id: string): Observable<Collection | null> {
    const collections = this.getCollections();
    const collection = collections.find(c => c.id === id);
    return of(collection || null);
  }

  saveCollection(collection: Collection): Observable<Collection> {
    const collections = this.getCollections();
    if (!collection.id) {
      collection.id = Date.now().toString();
    }
    
    const existingIndex = collections.findIndex(c => c.id === collection.id);
    if (existingIndex >= 0) {
      collections[existingIndex] = collection;
    } else {
      collections.push(collection);
    }
    
    localStorage.setItem(this.COLLECTIONS_KEY, JSON.stringify(collections));
    return of(collection);
  }

  deleteCollection(id: string): Observable<void> {
    const collections = this.getCollections();
    const filteredCollections = collections.filter(c => c.id !== id);
    localStorage.setItem(this.COLLECTIONS_KEY, JSON.stringify(filteredCollections));
    return of(void 0);
  }

  getPendingCollections(userEmail: string, isCollector: boolean): Observable<Collection[]> {
    const collections = this.getCollections();
    const filtered = collections.filter(c => {
      if (isCollector) {
        return c.status === 'PENDING' && !c.collectorEmail;
      } else {
        return c.customerEmail === userEmail;
      }
    });
    return of(filtered);
  }
} 