import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Collection, CollectionStatus } from '../../../../../core/models/collection.model';
import { CollectionService } from '../../../../../core/services/collection.service';
import { selectAuthUser } from '../../../../../core/store/selectors/auth.selectors';

@Component({
  selector: 'app-collection-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './collection-history.component.html'
})
export class CollectionHistoryComponent implements OnInit {
  completedCollections$: Observable<Collection[]>;
  currentUser$ = this.store.select(selectAuthUser);

  readonly statusLabels: Record<CollectionStatus, string> = {
    'PENDING': 'En attente',
    'OCCUPIED': 'Occupée',
    'IN_PROGRESS': 'En cours',
    'COMPLETED': 'Validée',
    'REJECTED': 'Rejetée'
  };

  readonly statusClasses: Record<CollectionStatus, string> = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'OCCUPIED': 'bg-blue-100 text-blue-800',
    'IN_PROGRESS': 'bg-purple-100 text-purple-800',
    'COMPLETED': 'bg-green-100 text-green-800',
    'REJECTED': 'bg-red-100 text-red-800'
  };

  constructor(
    private collectionService: CollectionService,
    private store: Store
  ) {
    this.completedCollections$ = this.collectionService.getCompletedCollections();
  }

  ngOnInit(): void {}

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calculatePoints(collection: Collection): number {
    return collection.wasteItems.reduce((total, item) => {
      if (item.actualWeight) {
        return total + (item.actualWeight / 1000);
      }
      return total;
    }, 0);
  }
}