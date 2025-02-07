import { Injectable } from '@angular/core';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';
import { StorageService } from './storage.service';
import { map, switchMap } from 'rxjs/operators';

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

        return userWithoutPassword;
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }
}
