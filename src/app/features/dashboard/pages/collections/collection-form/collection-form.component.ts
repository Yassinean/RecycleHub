import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Collection, WasteType } from '../../../../../core/models/collection.model';
import { CollectionService } from '../../../../../core/services/collection.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { Store } from '@ngrx/store';
import * as CollectionActions from '../../../../../core/store/actions/collection.actions';
import { selectCollectionsLoading, selectCollectionsError, selectCollections, selectSelectedCollection } from '../../../../../core/store/selectors/collection.selectors';
import { selectAuthUser } from '../../../../../core/store/selectors/auth.selectors';
import { map, filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-collection-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './collection-form.component.html'
})
export class CollectionFormComponent implements OnInit {
  collectionForm: FormGroup;
  loading$ = this.store.select(selectCollectionsLoading);
  error$ = this.store.select(selectCollectionsError);
  currentUser$ = this.store.select(selectAuthUser);
  isEditMode = false;
  collectionId?: string;
  today = new Date();
  
  readonly wasteTypes: { type: WasteType; label: string }[] = [
    { type: 'PLASTIC', label: 'Plastique' },
    { type: 'GLASS', label: 'Verre' },
    { type: 'PAPER', label: 'Papier' },
    { type: 'METAL', label: 'Métal' }
  ];

  totalPendingWeight$ = this.store.select(selectCollections).pipe(
    map(collections => collections
      .filter(c => c.status === 'PENDING')
      .reduce((total, c) => total + c.totalEstimatedWeight, 0)
    )
  );

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private collectionService: CollectionService,
    private authService: AuthService,
    private store: Store
  ) {
    this.collectionForm = this.fb.group({
      wasteItems: this.fb.array([], [
        Validators.required, 
        Validators.minLength(1),
        this.totalWeightValidator()
      ]),
      scheduledDate: ['', [
        Validators.required,
        this.futureDateValidator()
      ]],
      scheduledTime: ['', [
        Validators.required,
        Validators.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        this.timeValidator()
      ]],
      address: this.fb.group({
        street: ['', [Validators.required, Validators.minLength(5)]],
        city: ['', [Validators.required, Validators.minLength(2)]],
        postalCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]]
      }),
      notes: ['', Validators.maxLength(500)]
    });
  }

  ngOnInit(): void {
    // Pré-remplir l'adresse avec celle de l'utilisateur
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.address) {
      this.collectionForm.patchValue({
        address: currentUser.address
      });
    }

    // Vérifier si on est en mode édition
    this.collectionId = this.route.snapshot.params['id'];
    if (this.collectionId) {
      this.isEditMode = true;
      this.loadCollection(this.collectionId);
    } else {
      // Ajouter un premier item de déchet par défaut
      this.addWasteItem();
    }
  }

  get wasteItems() {
    return this.collectionForm.get('wasteItems') as FormArray;
  }

  get f() { return this.collectionForm.controls; }
  get address() { return this.f['address'] as FormGroup; }

  private futureDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const selectedDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return selectedDate >= today ? null : { pastDate: true };
    };
  }

  private totalWeightValidator(): ValidatorFn {
    return (formArray: AbstractControl): ValidationErrors | null => {
      const wasteItems = formArray as FormArray;
      const totalWeight = wasteItems.controls.reduce((total, control) => {
        return total + Number(control.get('estimatedWeight')?.value || 0);
      }, 0);

      return totalWeight > 10000 ? { totalWeightExceeded: true } : null;
    };
  }

  private timeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const time = control.value;
      if (!time) return null;

      const [hours] = time.split(':').map(Number);
      if (hours < 9 || hours >= 18) {
        return { timeRange: true };
      }
      return null;
    };
  }

  addWasteItem() {
    const wasteItem = this.fb.group({
      type: ['PLASTIC', Validators.required],
      estimatedWeight: ['', [
        Validators.required,
        Validators.min(1000),  // Minimum 1kg
        Validators.max(10000), // Maximum 10kg
        Validators.pattern(/^[0-9]+$/)
      ]],
      photos: ['']  
    });

    this.wasteItems.push(wasteItem);
  }

  removeWasteItem(index: number) {
    this.wasteItems.removeAt(index);
  }

  private loadCollection(id: string) {
    this.store.dispatch(CollectionActions.loadCollection({ id }));
    
    this.store.select(selectSelectedCollection).pipe(
      filter(collection => !!collection),
      take(1)
    ).subscribe(collection => {
      if (!collection) {
        this.router.navigate(['/dashboard/collections']);
        return;
      }

      // Vider le FormArray existant
      while (this.wasteItems.length) {
        this.wasteItems.removeAt(0);
      }

      // Ajouter chaque déchet au FormArray
      collection.wasteItems.forEach(item => {
        this.wasteItems.push(
          this.fb.group({
            type: [item.type, Validators.required],
            estimatedWeight: [item.estimatedWeight, [
              Validators.required, 
              Validators.min(1000), 
              Validators.max(10000)
            ]],
            photos: [item.photos || []]
          })
        );
      });

      // Formater la date pour l'input date
      const scheduledDate = new Date(collection.scheduledDate)
        .toISOString()
        .split('T')[0];

      // Mettre à jour le formulaire
      this.collectionForm.patchValue({
        scheduledDate,
        scheduledTime: collection.scheduledTime,
        address: collection.address,
        notes: collection.notes
      });
    });
  }

  onSubmit() {
    if (this.collectionForm.invalid) {
      return;
    }

    const formValue = this.collectionForm.value;
    const totalEstimatedWeight = formValue.wasteItems.reduce(
      (total: number, item: any) => total + Number(item.estimatedWeight),
      0
    );

    const collectionData = {
      ...formValue,
      totalEstimatedWeight,
      scheduledDate: new Date(formValue.scheduledDate)
    };

    if (this.isEditMode && this.collectionId) {
      this.store.dispatch(CollectionActions.updateCollection({
        id: this.collectionId,
        collection: collectionData
      }));
    } else {
      this.store.dispatch(CollectionActions.createCollection({
        collection: collectionData
      }));
    }
  }
} 