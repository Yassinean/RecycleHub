import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { selectCollections } from '../../../../core/store/selectors/collection.selectors';
import { selectAuthUser } from '../../../../core/store/selectors/auth.selectors';
import { Collection } from '../../../../core/models/collection.model';
import { VOUCHER_OPTIONS, VoucherOption } from '../../../../core/models/voucher.model';
import * as AuthActions from '../../../../core/store/actions/auth.actions';
import { AuthService } from '../../../../core/services/auth.service';

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
        .filter(c => c.status === 'COMPLETED')
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    )
  );

  voucherOptions = VOUCHER_OPTIONS;

  private readonly POINTS_PER_KG: Record<string, number> = {
    PLASTIC: 2,
    GLASS: 1,
    PAPER: 1,
    METAL: 5,
  };

  currentPoints = 0;

  constructor(
    private store: Store,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser$.subscribe(user => {
      this.currentPoints = user?.points || 0;
    });
  }

  calculatePoints(collection: Collection): number {
    return collection.wasteItems.reduce((total, item) => {
      if (item.actualWeight) {
        return total + (item.actualWeight / 1000) * this.POINTS_PER_KG[item.type];
      }
      return total;
    }, 0);
  }

  canConvert(points: number): boolean {
    return this.currentPoints >= points;
  }

  convertPoints(option: VoucherOption) {
    if (!this.canConvert(option.points)) {
      return;
    }

    if (confirm(`Voulez-vous convertir ${option.points} points en ${option.label} ?`)) {
      this.store.dispatch(AuthActions.convertPoints({ 
        points: option.points,
        voucher: option
      }));
    }
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

  // Pour le total des points gagnés
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
    return this.currentPoints >= Math.min(...VOUCHER_OPTIONS.map(v => v.points));
  }
} 