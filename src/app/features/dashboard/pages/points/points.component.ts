import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectAuthUser } from '../../../../core/store/selectors/auth.selectors';
import { selectCollections } from '../../../../core/store/selectors/collection.selectors';
import { map } from 'rxjs/operators';
import { Collection } from '../../../../core/models/collection.model';
import { VOUCHER_OPTIONS, VoucherOption } from '../../../../core/models/voucher.model';
import * as  AuthActions from '../../../../core/store/actions/auth.actions';

@Component({
  selector: 'app-points',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './points.component.html',
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

  private currentPoints = 0;

  constructor(private store: Store) {}

  ngOnInit() {
    this.currentUser$.subscribe(user => this.currentPoints = user?.points || 0);
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
      // Dispatch action to convert points
      this.store.dispatch(AuthActions.convertPoints({ 
        points: option.points,
        voucher: option
      }));
    }
  }
} 