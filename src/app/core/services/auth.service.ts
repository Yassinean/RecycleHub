import { Injectable } from '@angular/core';
import { Observable, from, throwError, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { IndexedDBService } from './indexed-db.service';
import { CryptoService } from './crypto.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: User | null = null;

  constructor(
    private indexedDB: IndexedDBService,
    private cryptoService: CryptoService
  ) {}

  register(user: User): Observable<User> {
    if (!user.email || !user.password) {
      return throwError(() => new Error('Email and password are required'));
    }

    return this.indexedDB.get<User>('users', user.email).pipe(
      catchError(() => of(null)),
      switchMap(existingUser => {
        if (existingUser) {
          return throwError(() => new Error('User already exists'));
        }
        // Hasher le mot de passe avant de stocker l'utilisateur
        return from(this.cryptoService.hashPassword(user.password!));
      }),
      map(hashedPassword => ({
        ...user,
        password: hashedPassword,
        points: 0,
        role: 'CUSTOMER' as const
      })),
      switchMap(userWithHashedPassword => 
        this.indexedDB.add('users', userWithHashedPassword)
      )
    );
  }

  login(email: string, password: string): Observable<User> {
    return this.indexedDB.get<User>('users', email).pipe(
      switchMap(user => {
        if (!user) {
          return throwError(() => new Error('Invalid email or password'));
        }
        
        return from(this.cryptoService.comparePasswords(password, user.password!))
          .pipe(
            map(isMatch => {
              if (!isMatch) {
                throw new Error('Invalid email or password');
              }
              
              // Ne pas inclure le mot de passe hashé dans l'objet stocké en session
              const { password: _, ...userWithoutPassword } = user;
              this.currentUser = userWithoutPassword;
              localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
              
              return userWithoutPassword;
            })
          );
      })
    );
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  getCurrentUser(): User | null {
    if (!this.currentUser) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    }
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  // Mise à jour de la méthode d'initialisation des collecteurs
  initializeCollectors(collectors: User[]): Observable<void> {
    return from(Promise.all(
      collectors.map(async collector => {
        const hashedPassword = await this.cryptoService.hashPassword(collector.password!);
        const collectorWithHashedPassword = {
          ...collector,
          password: hashedPassword,
          role: 'COLLECTOR' as const
        };
        return this.indexedDB.add('users', collectorWithHashedPassword).toPromise();
      })
    )).pipe(
      map(() => void 0)
    );
  }
}