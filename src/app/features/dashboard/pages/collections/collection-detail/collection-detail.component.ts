import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Collection } from '../../../../../core/models/collection.model';
import { Store } from '@ngrx/store';
import * as CollectionActions from '../../../../../core/store/actions/collection.actions';
import { selectSelectedCollection, selectCollectionsLoading, selectCollectionsError } from '../../../../../core/store/selectors/collection.selectors';
import { selectAuthUser } from '../../../../../core/store/selectors/auth.selectors';
import { withLatestFrom, take, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-collection-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './collection-detail.component.html'
})
export class CollectionDetailComponent implements OnInit {
  collection$ = this.store.select(selectSelectedCollection);
  currentUser$ = this.store.select(selectAuthUser);
  loading$ = this.store.select(selectCollectionsLoading);
  error$ = this.store.select(selectCollectionsError);
  actualWeightForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private store: Store,
    private router: Router
  ) {
    this.actualWeightForm = this.fb.group({
      wasteItems: this.fb.array([])
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.store.dispatch(CollectionActions.loadCollection({ id }));
  }

  private initializeActualWeightForm(collection: Collection) {
    const weightControls = this.actualWeightForm.get('wasteItems') as FormArray;
    collection.wasteItems.forEach(item => {
      weightControls.push(
        this.fb.group({
          type: [item.type],
          estimatedWeight: [item.estimatedWeight],
          actualWeight: ['', [
            Validators.required,
            Validators.min(0),
            Validators.max(item.estimatedWeight * 1.2) // 20% de marge
          ]]
        })
      );
    });
  }

  onAcceptCollection(collectionId: string | undefined) {
    if (!collectionId) return;
    
    this.currentUser$.pipe(take(1)).subscribe(user => {
      this.store.dispatch(CollectionActions.updateCollectionStatus({
        id: collectionId,
        status: 'IN_PROGRESS',
        data: {
          collectorEmail: user?.email
        }
      }));
    });
  }

  onRejectCollection(collectionId: string | undefined) {
    if (!collectionId) return;
    
    this.store.dispatch(CollectionActions.updateCollectionStatus({
      id: collectionId,
      status: 'REJECTED'
    }));
  }

  onCompleteCollection(collectionId: string | undefined) {
    if (!collectionId || this.actualWeightForm.invalid) return;

    const formValue = this.actualWeightForm.value;
    const totalActualWeight = formValue.wasteItems.reduce(
      (total: number, item: any) => total + item.actualWeight,
      0
    );

    this.store.dispatch(CollectionActions.updateCollectionStatus({
      id: collectionId,
      status: 'COMPLETED',
      data: {
        wasteItems: formValue.wasteItems,
        totalActualWeight
      }
    }));
  }

  canAccept(): Observable<boolean> {
    return this.currentUser$.pipe(
      withLatestFrom(this.collection$),
      map(([user, collection]) => 
        user?.role === 'COLLECTOR' &&
        collection?.status === 'PENDING' &&
        !collection.collectorEmail
      ),
      take(1)
    );
  }

  canComplete(): Observable<boolean> {
    return this.currentUser$.pipe(
      withLatestFrom(this.collection$),
      map(([user, collection]) => 
        user?.role === 'COLLECTOR' &&
        collection?.status === 'IN_PROGRESS' &&
        collection.collectorEmail === user.email
      ),
      take(1)
    );
  }

  canModify$ = this.currentUser$.pipe(
    withLatestFrom(this.collection$),
    map(([user, collection]) => 
      user?.email === collection?.customerEmail && 
      collection?.status === 'PENDING'
    )
  );

  onEditCollection(id: string | undefined) {
    if (!id) return;
    this.router.navigate(['/dashboard/collections/edit', id]);
  }

  onDeleteCollection(id: string | undefined) {
    if (!id) return;
    if (confirm('Êtes-vous sûr de vouloir supprimer cette collecte ?')) {
      this.store.dispatch(CollectionActions.deleteCollection({ id }));
    }
  }
} 