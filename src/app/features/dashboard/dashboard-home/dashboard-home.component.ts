import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CollectionService } from '../../../core/services/collection.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-home.component.html'
})
export class DashboardHomeComponent implements OnInit {
  currentUser: User | null = null;

  constructor(private authService: AuthService , private collectionService: CollectionService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.collectionService.getPendingCollectionsCount();
  }

  pendingCollectionsCount() {
    return this.collectionService.getPendingCollectionsCount();
  }

  completedCollectionsCount() {
    return this.collectionService.getCompletedCollectionsCount();
  }

  
} 