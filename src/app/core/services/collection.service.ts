import { Injectable } from '@angular/core';
import { Observable, from, throwError, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import {
  Collection,
  CollectionStatus,
  WasteType,
} from '../models/collection.model';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  private readonly POINTS_PER_KG: Record<WasteType, number> = {
    PLASTIC: 2,
    GLASS: 1,
    PAPER: 1,
    METAL: 5,
  };

  constructor(
    private storageService: StorageService,
    private authService: AuthService
  ) {}

  createCollection(collection: Partial<Collection>): Observable<Collection> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    // Vérifier le poids total
    if (collection.totalEstimatedWeight && collection.totalEstimatedWeight > 10000) {
      return throwError(() => new Error('Le poids total ne doit pas dépasser 10kg'));
    }

    // Vérifier le nombre de collectes en attente
    return this.getPendingCollections().pipe(
      switchMap(collections => {
        const pendingCollections = collections.filter(c => 
          c.customerEmail === currentUser.email && 
          c.status === 'PENDING'
        );

        if (pendingCollections.length >= 3) {
          return throwError(() => new Error('Vous avez déjà 3 demandes de collecte en attente'));
        }

        const newCollection: Collection = {
          ...collection as Collection,
          customerEmail: currentUser.email,
          status: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        return this.storageService.saveCollection(newCollection);
      })
    );
  }

  getPendingCollections(): Observable<Collection[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.storageService.getPendingCollections(
      currentUser.email,
      currentUser.role === 'COLLECTOR'
    );
  }

  updateCollectionStatus(
    collectionId: string,
    status: CollectionStatus,
    data?: Partial<Collection>
  ): Observable<Collection> {
    return this.storageService.getCollection(collectionId).pipe(
      switchMap((collection) => {
        if (!collection) {
          return throwError(() => new Error('Collection not found'));
        }

        const updatedCollection: Collection = {
          ...collection,
          ...data,
          status,
          updatedAt: new Date(),
          ...(status === 'COMPLETED' && { completedAt: new Date() }),
        };

        return this.storageService.saveCollection(updatedCollection).pipe(
          tap(() => {
            // Si la collecte est terminée, mettre à jour les points du client
            if (status === 'COMPLETED' && updatedCollection.totalActualWeight) {
              this.updateCustomerPoints(updatedCollection);
            }
          })
        );
      })
    );
  }

  private updateCustomerPoints(collection: Collection): void {
    const totalPoints = collection.wasteItems.reduce((acc, item) => {
      if (item.actualWeight) {
        // Convertir les grammes en kg et multiplier par les points par kg
        return acc + (item.actualWeight / 1000) * this.POINTS_PER_KG[item.type];
      }
      return acc;
    }, 0);

    // Mettre à jour les points de l'utilisateur
    this.storageService.getUser(collection.customerEmail).pipe(
      map((user) => {
        if (!user) throw new Error('User not found');
        return {
          ...user,
          points: (user.points || 0) + Math.floor(totalPoints),
        };
      }),
      switchMap((updatedUser) => this.storageService.saveUser(updatedUser))
    )
      .subscribe();
  }

  getCollection(id: string): Observable<Collection> {
    return this.storageService.getCollection(id).pipe(
      map(collection => {
        if (!collection) {
          throw new Error('Collection not found');
        }
        return collection;
      })
    );
  }

  deleteCollection(id: string): Observable<void> {
    return this.storageService.deleteCollection(id);
  }

  updateCollection(id: string, collection: Partial<Collection>): Observable<Collection> {
    return this.storageService.getCollection(id).pipe(
      switchMap(existingCollection => {
        if (!existingCollection) {
          return throwError(() => new Error('Collection not found'));
        }
        const updatedCollection = {
          ...existingCollection,
          ...collection,
          updatedAt: new Date()
        };
        return this.storageService.saveCollection(updatedCollection);
      })
    );
  }
}
