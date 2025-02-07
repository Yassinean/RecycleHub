import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { MetaReducer, provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import { routes } from './app.routes';
import { authReducer } from './core/store/reducers/auth.reducer';
import { collectionReducer } from './core/store/reducers/collection.reducer';
import { AuthEffects } from './core/store/effects/auth.effects';
import { CollectionEffects } from './core/store/effects/collection.effects';
import { localStorageSync } from 'ngrx-store-localstorage';

export function localStorageSyncReducer(reducer: any): any {
  return localStorageSync({
    keys: ["auth"],
    rehydrate: true,
  })(reducer)
}
const metaReducers: MetaReducer[] = [localStorageSyncReducer]

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideStore({
      auth: authReducer,
      collections: collectionReducer
    }, { metaReducers }),
    provideEffects([AuthEffects, CollectionEffects])
  ]
};
