import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import * as CollectionActions from '../../../../core/store/actions/collection.actions';
import { selectCollections, selectCollectionsLoading, selectCollectionsError } from '../../../../core/store/selectors/collection.selectors';
import { selectAuthUser } from '../../../../core/store/selectors/auth.selectors';
import { map, withLatestFrom, Subject } from 'rxjs';
import { CollectionStatus } from '../../../../core/models/collection.model';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './collections.component.html'
})
export class CollectionsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  collections$ = this.store.select(selectCollections);
  currentUser$ = this.store.select(selectAuthUser);
  loading$ = this.store.select(selectCollectionsLoading);
  error$ = this.store.select(selectCollectionsError);

  totalPendingWeight$ = this.store.select(selectCollections).pipe(
    map(collections => collections
      .filter(c => c.status === 'PENDING')
      .reduce((total, c) => total + c.totalEstimatedWeight, 0)
    )
  );

  canAddCollection$ = this.totalPendingWeight$.pipe(
    map(totalWeight => totalWeight < 10000)
  );

  readonly statusLabels: Record<CollectionStatus, string> = {
    'PENDING': 'En attente',
    'OCCUPIED': 'Occupée',
    'IN_PROGRESS': 'En cours',
    'COMPLETED': 'Validée',
    'REJECTED': 'Rejetée'
  };

  constructor(private store: Store, private router: Router) {}

  ngOnInit(): void {
    console.log('CollectionsComponent initialized'); // Debug log
    
    this.currentUser$.subscribe(user => {
      console.log('Current user in component:', user); // Debug log
    });

    this.store.dispatch(CollectionActions.loadCollections());

    this.collections$.subscribe(collections => {
      console.log('Collections in component:', collections); // Debug log
    });

    this.store.select(selectCollectionsError)
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        if (error) {
          console.error('Erreur lors du chargement des collections:', error);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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

  canModify$ = this.currentUser$.pipe(
    withLatestFrom(this.collections$),
    map(([user, collections]) => collections.map(collection => 
      user?.email === collection?.customerEmail && 
      collection?.status === 'PENDING'
    ))
  );

  onUpdateStatus(id: string | undefined, status: CollectionStatus) {
    if (!id) return;
    this.store.dispatch(CollectionActions.updateCollectionStatus({ 
      id, 
      status 
    }));
    this.store.dispatch(CollectionActions.loadCollections());
  }

  getStatusClass(status: CollectionStatus): string {
    const classes = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'OCCUPIED': 'bg-blue-100 text-blue-800',
      'IN_PROGRESS': 'bg-purple-100 text-purple-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800'
    };
    return classes[status] || '';
  }
} 