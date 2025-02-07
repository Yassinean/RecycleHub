import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { CollectionService } from '../../services/collection.service';
import * as CollectionActions from '../actions/collection.actions';
import { Collection } from '../../models/collection.model';
import { Router } from '@angular/router';

@Injectable()
export class CollectionEffects {
  loadCollections$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CollectionActions.loadCollections),
      mergeMap(() =>
        this.collectionService.getPendingCollections().pipe(
          map(collections => CollectionActions.loadCollectionsSuccess({ collections })),
          catchError(error => of(CollectionActions.loadCollectionsFailure({ error: error.message })))
        )
      )
    )
  );

  createCollection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CollectionActions.createCollection),
      mergeMap(({ collection }) =>
        this.collectionService.createCollection(collection as Collection).pipe(
          map(newCollection => CollectionActions.createCollectionSuccess({ collection: newCollection })),
          catchError(error => of(CollectionActions.createCollectionFailure({ error: error.message })))
        )
      )
    )
  );

  deleteCollection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CollectionActions.deleteCollection),
      mergeMap(({ id }) =>
        this.collectionService.deleteCollection(id).pipe(
          map(() => CollectionActions.deleteCollectionSuccess({ id })),
          catchError(error => of(CollectionActions.deleteCollectionFailure({ error: error.message })))
        )
      )
    )
  );

  createCollectionSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CollectionActions.createCollectionSuccess),
        tap(() => this.router.navigate(['/dashboard/collections']))
      ),
    { dispatch: false }
  );

  updateCollectionSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CollectionActions.updateCollectionSuccess),
      map(() => CollectionActions.loadCollections())
    )
  );

  deleteCollectionSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CollectionActions.deleteCollectionSuccess),
        tap(() => this.router.navigate(['/dashboard/collections']))
      ),
    { dispatch: false }
  );

  updateCollection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CollectionActions.updateCollection),
      mergeMap(({ id, collection }) =>
        this.collectionService.updateCollection(id, collection).pipe(
          map(updatedCollection => CollectionActions.updateCollectionSuccess({ collection: updatedCollection })),
          catchError(error => of(CollectionActions.updateCollectionFailure({ error: error.message })))
        )
      )
    )
  );

  loadCollection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CollectionActions.loadCollection),
      mergeMap(({ id }) =>
        this.collectionService.getCollection(id).pipe(
          map(collection => CollectionActions.loadCollectionSuccess({ collection })),
          catchError(error => of(CollectionActions.loadCollectionFailure({ error: error.message })))
        )
      )
    )
  );

  updateCollectionStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CollectionActions.updateCollectionStatus),
      mergeMap(({ id, status, data }) =>
        this.collectionService.updateCollectionStatus(id, status, data).pipe(
          map(collection => CollectionActions.updateCollectionSuccess({ collection })),
          catchError(error => of(CollectionActions.updateCollectionFailure({ error: error.message })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private collectionService: CollectionService,
    private router: Router
  ) {}
} 