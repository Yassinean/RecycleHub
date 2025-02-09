import { Injectable } from '@angular/core';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';
import { StorageService } from './storage.service';
import { map, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USER_KEY = 'currentUser';
  private currentUserSubject: BehaviorSubject<User | null>;

  constructor(private storageService: StorageService) {
    const storedUser = localStorage.getItem(this.USER_KEY);
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser ? JSON.parse(storedUser) : null);
  }

  register(user: User): Observable<User> {
    return this.storageService.getUser(user.email).pipe(
      switchMap(existingUser => {
        if (existingUser) {
          return throwError(() => new Error('Cet email est déjà utilisé'));
        }
        return this.storageService.saveUser(user);
      })
    );
  }

  login(email: string, password: string): Observable<User> {
    return this.storageService.getUser(email).pipe(
      map(user => {
        if (!user || user.password !== password) {
          throw new Error('Email ou mot de passe incorrect');
        }

        const { password: _, ...userWithoutPassword } = user;
        localStorage.setItem(this.USER_KEY, JSON.stringify(userWithoutPassword));
        this.currentUserSubject.next(userWithoutPassword); // Update observable

        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);

        return user;
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
    // const storedUser = localStorage.getItem(this.USER_KEY);
    // if (storedUser) {
    //   const user = JSON.parse(storedUser);
    //   this.currentUserSubject.next(user);
    //   return user;
    // }
    // return null;
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  updateUser(user: User): Observable<User> {
    return this.storageService.saveUser(user).pipe(
      tap(updatedUser => {
        localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
        this.currentUserSubject.next(updatedUser);
      })
    );
  }
}
