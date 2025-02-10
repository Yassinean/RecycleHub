import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { Store } from '@ngrx/store';
import { selectAuthUser } from '../../../../core/store/selectors/auth.selectors';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-layout.component.html'
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isSidebarCollapsed = false;
  private userSubscription: Subscription;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private store: Store
  ) {
    // S'abonner aux changements de l'utilisateur dans le store
    this.userSubscription = this.store.select(selectAuthUser).subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnInit() {
    // Initialiser l'utilisateur au chargement
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnDestroy() {
    // Se désabonner pour éviter les fuites de mémoire
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  getTotalPointsEarned() {
    return this.authService.getCurrentUser()?.points || 0;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
} 