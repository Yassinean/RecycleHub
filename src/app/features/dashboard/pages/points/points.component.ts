import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { selectCollections } from '../../../../core/store/selectors/collection.selectors';
import { selectAuthUser } from '../../../../core/store/selectors/auth.selectors';
import { Collection } from '../../../../core/models/collection.model';
import { VOUCHER_OPTIONS, VoucherOption } from '../../../../core/models/voucher.model';
import * as AuthActions from '../../../../core/store/actions/auth.actions';
import { AuthService } from '../../../../core/services/auth.service';
import { VoucherService } from '../../../../core/services/voucher.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-points',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './points.component.html'
})
export class PointsComponent implements OnInit {
  currentUser$ = this.store.select(selectAuthUser);
  completedCollections$ = this.store.select(selectCollections).pipe(
    map(collections => 
      collections
        .filter(c => 
          c.status === 'COMPLETED' && 
          c.customerEmail === this.authService.getCurrentUser()?.email
        )
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    )
  );

  voucherOptions = VOUCHER_OPTIONS;

  readonly POINTS_PER_KG = {
    PLASTIC: 2,
    GLASS: 1,
    PAPER: 1,
    METAL: 5,
  };

  availablePoints = 0;  // Points disponibles pour la conversion

  constructor(
    private store: Store,
    private authService: AuthService,
    private voucherService: VoucherService,
    private router: Router
  ) {}

  ngOnInit() {
    // Mettre à jour les points disponibles quand l'utilisateur change
    this.currentUser$.subscribe(user => {
      this.availablePoints = user?.points || 0;
    });
  }

  // Calcul des points pour une collection
  calculatePoints(collection: Collection): number {
    return collection.wasteItems.reduce((total, item) => {
      if (item.actualWeight) {
        return total + (item.actualWeight / 1000) * this.POINTS_PER_KG[item.type];
      }
      return total;
    }, 0);
  }

  // Vérifier si on peut convertir un certain nombre de points
  canConvert(points: number): boolean {
    const currentUser = this.authService.getCurrentUser();
    const currentPoints = currentUser?.points || 0;
    return currentPoints >= points;
  }

  convertPoints(option: VoucherOption) {
    if (!this.canConvert(option.points)) {
      alert('Points insuffisants pour cette conversion');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const remainingPoints = (currentUser.points || 0) - option.points;
    if (remainingPoints < 0) {
      alert('Points insuffisants pour cette conversion');
      return;
    }

    if (confirm(`Voulez-vous convertir ${option.points} points en ${option.label} ?`)) {
      // Vérifier si l'utilisateur a déjà un bon d'achat similaire non utilisé
      this.voucherService.getUserVouchers().subscribe(vouchers => {
        const existingSimilarVoucher = vouchers.find(v => 
          v.points === option.points && 
          v.value === option.value && 
          !v.isUsed &&
          new Date(v.expiresAt) > new Date()
        );

        if (existingSimilarVoucher) {
          if (confirm('Vous avez déjà un bon d\'achat similaire non utilisé. Voulez-vous quand même en créer un nouveau ?')) {
            this.createNewVoucher(option, currentUser);
          }
        } else {
          this.createNewVoucher(option, currentUser);
        }
      });
    }
  }

  private createNewVoucher(option: VoucherOption, currentUser: User) {
    this.voucherService.createVoucher(option.points, option.value).subscribe(
      (voucher) => {
        // Mettre à jour les points de l'utilisateur
        currentUser.points = (currentUser.points || 0) - option.points;
        this.authService.updateUser(currentUser).subscribe(() => {
          // Supprimer l'alerte et naviguer directement
          this.router.navigate(['/dashboard/vouchers']);
        });
      },
      (error) => {
        console.error('Erreur lors de la conversion des points:', error);
        alert('Une erreur est survenue lors de la conversion des points.');
      }
    );
  }

  // Méthode pour obtenir le nombre de points disponibles
  getAvailablePoints(): number {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.points || 0;
  }

  // Méthodes utilitaires pour le template
  getPointsClass(points: number): string {
    return this.canConvert(points) ? 'text-green-600' : 'text-gray-400';
  }

  getButtonClass(points: number): string {
    return this.canConvert(points) 
      ? 'bg-green-600 hover:bg-green-700 text-white'
      : 'bg-gray-200 text-gray-400 cursor-not-allowed';
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Total des points gagnés (historique)
  getTotalPointsEarned(): number {
    let total = 0;
    this.completedCollections$.subscribe(collections => {
      total = collections.reduce((acc, collection) => {
        return acc + this.calculatePoints(collection);
      }, 0);
    });
    return total;
  }

  // Pour vérifier si l'utilisateur peut convertir des points
  get hasEnoughPoints(): boolean {
    return this.availablePoints >= Math.min(...VOUCHER_OPTIONS.map(v => v.points));
  }
} 