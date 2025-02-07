import { createReducer, on } from '@ngrx/store';
import { Collection } from '../../models/collection.model';
import * as CollectionActions from '../actions/collection.actions';

export interface CollectionState {
  collections: Collection[];
  selectedCollection: Collection | null;
  loading: boolean;
  error: string | null;
}

export const initialState: CollectionState = {
  collections: [],
  selectedCollection: null,
  loading: false,
  error: null
};

export const collectionReducer = createReducer(
  initialState,
  on(CollectionActions.loadCollections, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(CollectionActions.loadCollectionsSuccess, (state, { collections }) => ({
    ...state,
    collections,
    loading: false,
    error: null
  })),
  on(CollectionActions.loadCollectionsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),
  on(CollectionActions.loadCollection, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(CollectionActions.loadCollectionSuccess, (state, { collection }) => ({
    ...state,
    selectedCollection: collection,
    loading: false,
    error: null
  })),
  on(CollectionActions.loadCollectionFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),
  on(CollectionActions.createCollection, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(CollectionActions.createCollectionSuccess, (state, { collection }) => ({
    ...state,
    collections: [...state.collections, collection],
    loading: false,
    error: null
  })),
  on(CollectionActions.createCollectionFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),
  on(CollectionActions.updateCollectionStatus, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(CollectionActions.selectCollection, (state, { collection }) => ({
    ...state,
    selectedCollection: collection
  })),
  on(CollectionActions.deselectCollection, (state) => ({
    ...state,
    selectedCollection: null
  })),
  on(CollectionActions.deleteCollection, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(CollectionActions.deleteCollectionSuccess, (state, { id }) => ({
    ...state,
    collections: state.collections.filter(collection => collection.id !== id),
    loading: false,
    error: null
  })),
  on(CollectionActions.deleteCollectionFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  }))
); 