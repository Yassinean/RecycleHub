import { createAction, props } from '@ngrx/store';
import { Collection, CollectionStatus } from '../../models/collection.model';

export const loadCollections = createAction('[Collection] Load Collections');

export const loadCollectionsSuccess = createAction(
  '[Collection] Load Collections Success',
  props<{ collections: Collection[] }>()
);

export const loadCollectionsFailure = createAction(
  '[Collection] Load Collections Failure',
  props<{ error: string }>()
);

export const createCollection = createAction(
  '[Collection] Create Collection',
  props<{ collection: Partial<Collection> }>()
);

export const createCollectionSuccess = createAction(
  '[Collection] Create Collection Success',
  props<{ collection: Collection }>()
);

export const createCollectionFailure = createAction(
  '[Collection] Create Collection Failure',
  props<{ error: string }>()
);

export const updateCollectionStatus = createAction(
  '[Collection] Update Status',
  props<{ 
    id: string; 
    status: CollectionStatus; 
    data?: Partial<Collection>;
  }>()
);

export const updateCollectionStatusSuccess = createAction(
  '[Collection] Update Status Success',
  props<{ collection: Collection }>()
);

export const updateCollectionStatusFailure = createAction(
  '[Collection] Update Status Failure',
  props<{ error: string }>()
);

export const loadCollection = createAction(
  '[Collection] Load Collection',
  props<{ id: string }>()
);

export const loadCollectionSuccess = createAction(
  '[Collection] Load Collection Success',
  props<{ collection: Collection }>()
);

export const loadCollectionFailure = createAction(
  '[Collection] Load Collection Failure',
  props<{ error: string }>()
);

export const selectCollection = createAction(
  '[Collection] Select Collection',
  props<{ collection: Collection }>()
);

export const deselectCollection = createAction(
  '[Collection] Deselect Collection'
);

export const deleteCollection = createAction(
  '[Collection] Delete Collection',
  props<{ id: string }>()
);

export const deleteCollectionSuccess = createAction(
  '[Collection] Delete Collection Success',
  props<{ id: string }>()
);

export const deleteCollectionFailure = createAction(
  '[Collection] Delete Collection Failure',
  props<{ error: string }>()
);

export const updateCollection = createAction(
  '[Collection] Update Collection',
  props<{ id: string, collection: Partial<Collection> }>()
);

export const updateCollectionSuccess = createAction(
  '[Collection] Update Collection Success',
  props<{ collection: Collection }>()
);

export const updateCollectionFailure = createAction(
  '[Collection] Update Collection Failure',
  props<{ error: string }>()
); 