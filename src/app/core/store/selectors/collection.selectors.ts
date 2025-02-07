import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CollectionState } from '../reducers/collection.reducer';

export const selectCollectionState = createFeatureSelector<CollectionState>('collections');

export const selectCollections = createSelector(
  selectCollectionState,
  (state) => state.collections
);

export const selectCollectionsLoading = createSelector(
  selectCollectionState,
  (state) => state.loading
);

export const selectCollectionsError = createSelector(
  selectCollectionState,
  (state) => state.error
);

export const selectSelectedCollection = createSelector(
  selectCollectionState,
  (state) => state.selectedCollection
); 