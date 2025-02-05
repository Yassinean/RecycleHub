import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Collection } from '../../../../../core/models/collection.model';
import { CollectionService } from '../../../../../core/services/collection.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { User } from '../../../../../core/models/user.model';

@Component({
  selector: 'app-collection-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './collection-detail.component.html'
})
export class CollectionDetailComponent implements OnInit {
  collection: Collection | null = null;
  currentUser: User | null = null;
  loading = true;
  error = '';
  actualWeightForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private collectionService: CollectionService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.actualWeightForm = this.fb.group({
      wasteItems: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    const id = this.route.snapshot.params['id'];
    this.loadCollection(id);
  }

  private loadCollection(id: string) {
    this.loading = true;
    this.collectionService.getCollection(id).subscribe({
      next: (collection) => {
        this.collection = collection;
        if (collection.status === 'IN_PROGRESS') {
          this.initializeActualWeightForm(collection);
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  private initializeActualWeightForm(collection: Collection) {
    const weightControls = this.actualWeightForm.get('wasteItems') as FormArray;
    collection.wasteItems.forEach(item => {
      weightControls.push(
        this.fb.group({
          type: [item.type],
          estimatedWeight: [item.estimatedWeight],
          actualWeight: ['', [
            Validators.required,
            Validators.min(0),
            Validators.max(item.estimatedWeight * 1.2) // 20% de marge
          ]]
        })
      );
    });
  }

  onAcceptCollection() {
    if (!this.collection?.id) return;

    this.loading = true;
    this.collectionService
      .updateCollectionStatus(this.collection.id, 'IN_PROGRESS', {
        collectorEmail: this.currentUser?.email
      })
      .subscribe({
        next: () => {
          this.loadCollection(this.collection!.id!);
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
  }

  onRejectCollection() {
    if (!this.collection) return;

    this.loading = true;
    this.collectionService
      .updateCollectionStatus(this.collection.id!, 'REJECTED')
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard/collections']);
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
  }

  onCompleteCollection() {
    if (!this.collection || this.actualWeightForm.invalid) return;

    this.loading = true;
    const formValue = this.actualWeightForm.value;
    const totalActualWeight = formValue.wasteItems.reduce(
      (total: number, item: any) => total + item.actualWeight,
      0
    );

    this.collectionService
      .updateCollectionStatus(this.collection.id!, 'COMPLETED', {
        wasteItems: formValue.wasteItems,
        totalActualWeight
      })
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard/collections']);
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
  }

  canAccept(): boolean {
    return (
      this.currentUser?.role === 'COLLECTOR' &&
      this.collection?.status === 'PENDING' &&
      !this.collection.collectorEmail
    );
  }

  canComplete(): boolean {
    return (
      this.currentUser?.role === 'COLLECTOR' &&
      this.collection?.status === 'IN_PROGRESS' &&
      this.collection.collectorEmail === this.currentUser.email
    );
  }
} 