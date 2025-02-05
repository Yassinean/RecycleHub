import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Collection, WasteType } from '../../../../../core/models/collection.model';
import { CollectionService } from '../../../../../core/services/collection.service';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-collection-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './collection-form.component.html'
})
export class CollectionFormComponent implements OnInit {
  collectionForm: FormGroup;
  loading = false;
  error = '';
  isEditMode = false;
  collectionId?: string;
  today = new Date();
  
  readonly wasteTypes: { type: WasteType; label: string }[] = [
    { type: 'PLASTIC', label: 'Plastique' },
    { type: 'GLASS', label: 'Verre' },
    { type: 'PAPER', label: 'Papier' },
    { type: 'METAL', label: 'Métal' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private collectionService: CollectionService,
    private authService: AuthService
  ) {
    this.collectionForm = this.fb.group({
      wasteItems: this.fb.array([], [Validators.required, Validators.minLength(1)]),
      scheduledDate: ['', [
        Validators.required,
        this.futureDateValidator()
      ]],
      scheduledTime: ['', [
        Validators.required,
        Validators.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
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

  addWasteItem() {
    const wasteItem = this.fb.group({
      type: ['PLASTIC', Validators.required],
      estimatedWeight: ['', [
        Validators.required,
        Validators.min(100),
        Validators.max(10000),
        Validators.pattern(/^[0-9]+$/)
      ]]
    });

    this.wasteItems.push(wasteItem);
  }

  removeWasteItem(index: number) {
    this.wasteItems.removeAt(index);
  }

  private loadCollection(id: string) {
    this.loading = true;
    this.collectionService.getCollection(id).subscribe({
      next: (collection) => {
        // Vider le FormArray existant
        while (this.wasteItems.length) {
          this.wasteItems.removeAt(0);
        }

        // Ajouter chaque déchet au FormArray
        collection.wasteItems.forEach(item => {
          this.wasteItems.push(
            this.fb.group({
              type: [item.type, Validators.required],
              estimatedWeight: [item.estimatedWeight, [Validators.required, Validators.min(100), Validators.max(10000)]]
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

        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
        // Rediriger vers la liste en cas d'erreur
        this.router.navigate(['/dashboard/collections']);
      }
    });
  }

  onSubmit() {
    if (this.collectionForm.invalid) {
      return;
    }

    this.loading = true;
    const formValue = this.collectionForm.value;

    // Calculer le poids total estimé
    const totalEstimatedWeight = formValue.wasteItems.reduce(
      (total: number, item: any) => total + item.estimatedWeight,
      0
    );

    const collectionData = {
      ...formValue,
      totalEstimatedWeight,
      scheduledDate: new Date(formValue.scheduledDate)
    };

    const request = this.isEditMode
      ? this.collectionService.updateCollectionStatus(this.collectionId!, 'PENDING', collectionData)
      : this.collectionService.createCollection(collectionData);

    request.subscribe({
      next: () => {
        this.router.navigate(['/dashboard/collections']);
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }
} 