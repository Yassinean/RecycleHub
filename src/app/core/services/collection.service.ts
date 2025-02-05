import { Injectable } from '@angular/core';
import { Observable, from, throwError, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import {
  Collection,
  CollectionStatus,
  WasteType,
} from '../models/collection.model';
import { IndexedDBService } from './indexed-db.service';
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
    private indexedDB: IndexedDBService,
    private authService: AuthService
  ) {}

  createCollection(
    collection: Omit<Collection, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ): Observable<Collection> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    // Vérifier le nombre de collectes en attente
    return this.getPendingCollections().pipe(
      map((collections) => {
        if (collections.length >= 3) {
          throw new Error('Vous avez déjà 3 demandes de collecte en attente');
        }

        // Vérifier le poids total
        if (collection.totalEstimatedWeight > 10000) {
          // 10kg en grammes
          throw new Error('Le poids total ne doit pas dépasser 10kg');
        }

        const newCollection: Collection = {
          ...collection,
          customerEmail: currentUser.email,
          status: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        return newCollection;
      }),
      switchMap((newCollection) =>
        this.indexedDB.add('collections', newCollection)
      )
    );
  }

  getPendingCollections(): Observable<Collection[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.indexedDB
      .getAllFromIndex<Collection>('collections', 'status', 'PENDING')
      .pipe(
        map((collections) => {
          if (currentUser.role === 'COLLECTOR') {
            // Pour les collecteurs, filtrer par ville
            return collections.filter(
              (c) => c.address.city === currentUser.address.city
            );
          } else {
            // Pour les particuliers, filtrer par email
            return collections.filter(
              (c) => c.customerEmail === currentUser.email
            );
          }
        })
      );
  }

  updateCollectionStatus(
    collectionId: string,
    status: CollectionStatus,
    data?: Partial<Collection>
  ): Observable<Collection> {
    return this.indexedDB.get<Collection>('collections', collectionId).pipe(
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

        return this.indexedDB.put('collections', updatedCollection).pipe(
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
    this.indexedDB
      .get<User>('users', collection.customerEmail)
      .pipe(
        map((user) => {
          if (!user) throw new Error('User not found');
          return {
            ...user,
            points: (user.points || 0) + Math.floor(totalPoints),
          };
        }),
        switchMap((updatedUser) => this.indexedDB.put('users', updatedUser))
      )
      .subscribe();
  }

  getCollection(id: string): Observable<Collection> {
    return this.indexedDB.get<Collection>('collections', id).pipe(
      map(collection => {
        if (!collection) {
          throw new Error('Collection not found');
        }
        return collection;
      })
    );
  }
}
