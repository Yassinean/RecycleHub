import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-layout.component.html'
})
export class DashboardLayoutComponent {
  currentUser: User | null = null;


  constructor(private authService: AuthService, private router: Router) {
    this.currentUser = this.authService.getCurrentUser();
  }

  getTotalPointsEarned() {
    return this.authService.getCurrentUser()?.points || 0;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
} 