import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import * as AuthActions from '../actions/auth.actions';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';

@Injectable()
export class AuthEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map(user => AuthActions.loginSuccess({ user })),
          catchError(error => of(AuthActions.loginFailure({ error: error.message })))
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(() => this.router.navigate(['/dashboard']))
      ),
    { dispatch: false }
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      mergeMap(({ user }) =>
        this.authService.register(user).pipe(
          map(registeredUser => AuthActions.registerSuccess({ user: registeredUser })),
          catchError(error => of(AuthActions.registerFailure({ error: error.message })))
        )
      )
    )
  );

  registerSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerSuccess),
        tap(() => this.router.navigate(['/auth/login']))
      ),
    { dispatch: false }
  );

  convertPoints$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.convertPoints),
      mergeMap(({ points, voucher }) =>
        this.storageService.getUser(this.authService.getCurrentUser()?.email!).pipe(
          mergeMap(user => {
            if (!user) {
              throw new Error('User not found');
            }
            if (user.points! < points) {
              throw new Error('Not enough points');
            }
            
            const updatedUser = {
              ...user,
              points: user.points! - points
            };
            
            return this.storageService.saveUser(updatedUser);
          }),
          map(user => AuthActions.convertPointsSuccess({ user })),
          catchError(error => of(AuthActions.convertPointsFailure({ error: error.message })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router,
    private storageService: StorageService
  ) {}
} 