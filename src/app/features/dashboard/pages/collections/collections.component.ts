import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import * as CollectionActions from '../../../../core/store/actions/collection.actions';
import { selectCollections, selectCollectionsLoading, selectCollectionsError } from '../../../../core/store/selectors/collection.selectors';
import { selectAuthUser } from '../../../../core/store/selectors/auth.selectors';
import { map, withLatestFrom } from 'rxjs';

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './collections.component.html'
})
export class CollectionsComponent implements OnInit {
  collections$ = this.store.select(selectCollections);
  currentUser$ = this.store.select(selectAuthUser);
  loading$ = this.store.select(selectCollectionsLoading);
  error$ = this.store.select(selectCollectionsError);

  constructor(private store: Store, private router: Router) {}

  ngOnInit(): void {
    this.store.dispatch(CollectionActions.loadCollections());
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
} 