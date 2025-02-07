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

        // Calculer le poids total de toutes les collectes en attente
        const totalPendingWeight = pendingCollections.reduce(
          (total, c) => total + c.totalEstimatedWeight, 
          0
        );

        // Ajouter le poids de la nouvelle collecte
        const newTotalWeight = totalPendingWeight + (collection.totalEstimatedWeight || 0);

        if (newTotalWeight > 10000) {
          return throwError(() => 
            new Error(`Le poids total de vos collectes en attente (${totalPendingWeight/1000}kg) plus cette nouvelle collecte (${collection.totalEstimatedWeight!/1000}kg) ne doit pas dépasser 10kg`)
          );
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

  updateCollection(id: string, collection: Partial<Collection>): Observable<Collection> {
    return this.storageService.getCollection(id).pipe(
      switchMap(existingCollection => {
        if (!existingCollection) {
          return throwError(() => new Error('Collection not found'));
        }

        // Vérifier le poids total des collections en attente
        return this.getPendingCollections().pipe(
          map(collections => collections.filter(c => 
            c.customerEmail === existingCollection.customerEmail && 
            c.status === 'PENDING' &&
            c.id !== id  // Exclure la collection en cours de modification
          )),
          switchMap(pendingCollections => {
            // Calculer le poids total des autres collections en attente
            const totalPendingWeight = pendingCollections.reduce(
              (total, c) => total + c.totalEstimatedWeight,
              0
            );

            // Ajouter le nouveau poids de la collection modifiée
            const newTotalWeight = totalPendingWeight + (collection.totalEstimatedWeight || 0);

            if (newTotalWeight > 10000) {
              return throwError(() => 
                new Error(`Le poids total de vos collectes en attente (${totalPendingWeight/1000}kg) plus cette collecte (${collection.totalEstimatedWeight!/1000}kg) ne doit pas dépasser 10kg`)
              );
            }

            const updatedCollection = {
              ...existingCollection,
              ...collection,
              updatedAt: new Date()
            };

            return this.storageService.saveCollection(updatedCollection);
          })
        );
      })
    );
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


  updateCollectionStatus(id: string, status: CollectionStatus, data?: any): Observable<Collection> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.getCollection(id).pipe(
      switchMap(collection => {
        if (!collection) {
          return throwError(() => new Error('Collection not found'));
        }

        const updatedCollection = {
          ...collection,
          status,
          collectorEmail: status === 'OCCUPIED' ? currentUser.email : collection.collectorEmail,
          updatedAt: new Date(),
          ...(status === 'COMPLETED' && { completedAt: new Date() }),
          ...(status === 'REJECTED' && { rejectionReason: data?.rejectionReason }),
          ...(data || {})
        };

        return this.storageService.saveCollection(updatedCollection).pipe(
          tap(() => {
            console.log('Collection updated:', updatedCollection);
          })
        );
      })
    );
  }

  getPendingCollections(): Observable<Collection[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    console.log('Current user:', currentUser); // Debug log

    return this.storageService.getPendingCollections(
      currentUser.email,
      currentUser.role === 'COLLECTOR'
    ).pipe(
      map(collections => {
        console.log('Collections before filter:', collections); // Debug log

        if (currentUser.role === 'COLLECTOR' && currentUser.address?.city) {
          const collectorCity = currentUser.address.city.toLowerCase();
          const filtered = collections.filter(collection => 
            collection.address.city.toLowerCase() === collectorCity
          );
          console.log('Filtered collections:', filtered); // Debug log
          console.log('cities :', currentUser.address.city); // Debug log
          return filtered;
        }
        return collections;
      })
    );
  }
  
}
