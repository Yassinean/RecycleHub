import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, switchMap, take, takeUntil } from 'rxjs/operators';
import { Subject, of } from 'rxjs';
import { selectCollections } from '../../../../core/store/selectors/collection.selectors';
import { selectAuthUser } from '../../../../core/store/selectors/auth.selectors';
import { Collection } from '../../../../core/models/collection.model';
import { VOUCHER_OPTIONS, VoucherOption } from '../../../../core/models/voucher.model';
import { AuthService } from '../../../../core/services/auth.service';
import { VoucherService } from '../../../../core/services/voucher.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-points',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './points.component.html'
})
export class PointsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

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

  totalPointsEarned$ = this.completedCollections$.pipe(
    map(collections =>
      collections.reduce((acc, collection) => acc + this.calculatePoints(collection), 0)
    )
  );

  voucherOptions = VOUCHER_OPTIONS;

  readonly POINTS_PER_KG = {
    PLASTIC: 2,
    GLASS: 1,
    PAPER: 1,
    METAL: 5,
  };

  availablePoints = 0;

  constructor(
    private store: Store,
    private authService: AuthService,
    private voucherService: VoucherService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.availablePoints = user?.points || 0;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
    if (!currentUser) { return; }

    if (confirm(`Voulez-vous convertir ${option.points} points en ${option.label} ?`)) {
      this.voucherService.getUserVouchers().pipe(
        take(1),
        switchMap(vouchers => {
          const existingSimilarVoucher = vouchers.find(v =>
            v.points === option.points &&
            v.value === option.value &&
            !v.isUsed &&
            new Date(v.expiresAt) > new Date()
          );
          if (existingSimilarVoucher) {
            if (!confirm('Vous avez déjà un bon d\'achat similaire non utilisé. Voulez-vous quand même en créer un nouveau ?')) {
              return of(null);
            }
          }
          return this.voucherService.createVoucher(option.points, option.value).pipe(take(1));
        }),
        switchMap(voucher => {
          if (!voucher) { return of(null); }
      
          const updatedUser: User = { ...currentUser, points: (currentUser.points || 0) - option.points };
          return this.authService.updateUser(updatedUser).pipe(take(1));
        })
      ).subscribe({
        next: () => this.router.navigate(['/dashboard/vouchers']),
        error: error => {
          console.error('Erreur lors de la conversion des points:', error);
          alert('Une erreur est survenue lors de la conversion des points.');
        }
      });
    }
  }

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

  get hasEnoughPoints(): boolean {
    return this.availablePoints >= Math.min(...this.voucherOptions.map(v => v.points));
  }

  getTotalPointsEarned() {
    return this.authService.getCurrentUser()?.points || 0;
  }
}
