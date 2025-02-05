import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CollectionService } from '../../../../core/services/collection.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Collection } from '../../../../core/models/collection.model';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './collections.component.html'
})
export class CollectionsComponent implements OnInit {
  collections: Collection[] = [];
  currentUser: User | null = null;
  loading = true;
  error = '';

  constructor(
    private collectionService: CollectionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadCollections();
  }

  private loadCollections(): void {
    this.loading = true;
    this.collectionService.getPendingCollections().subscribe({
      next: (collections) => {
        this.collections = collections;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }
} 