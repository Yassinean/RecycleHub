import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { Collection, WasteType } from "../../../../../core/models/collection.model";
import { selectSelectedCollection } from "../../../../../core/store/selectors/collection.selectors";
import * as CollectionActions from "../../../../../core/store/actions/collection.actions";

@Component({
  selector: 'app-collection-validate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './collection-validate.component.html',
})
export class CollectionValidateComponent implements OnInit {
  validateForm: FormGroup;
  collection: Collection | null = null;
  submitted = false;
  
  readonly wasteTypes: { type: WasteType; label: string }[] = [
    { type: 'PLASTIC', label: 'Plastique' },
    { type: 'GLASS', label: 'Verre' },
    { type: 'PAPER', label: 'Papier' },
    { type: 'METAL', label: 'Métal' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store
  ) {
    this.validateForm = this.fb.group({});
  }

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (!id) {
      this.router.navigate(['/dashboard/collections']);
      return;
    }

    this.store.dispatch(CollectionActions.loadCollection({ id }));
    
    this.store.select(selectSelectedCollection).subscribe(collection => {
      if (!collection) return;
      
      this.collection = collection;
      
      // Créer les contrôles dynamiquement pour chaque déchet
      collection.wasteItems.forEach((item, index) => {
        this.validateForm.addControl(
          `weight_${index}`,
          this.fb.control('', [
            Validators.required,
            Validators.min(item.estimatedWeight * 0.8),
            Validators.max(item.estimatedWeight * 1.2), // Maximum 20% de plus que le poids estimé
            Validators.pattern(/^\d+$/) // Nombres entiers uniquement
          ])
        );
        this.validateForm.addControl(
          `photos_${index}`,
          this.fb.control(null, [Validators.nullValidator])
        );
      });
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.validateForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;
    if (errors['required']) return 'Ce champ est requis';
    if (errors['max']) return `Le poids ne peut pas dépasser ${this.getMaxWeight(controlName)}g`;
    if (errors['pattern']) return 'Veuillez entrer un nombre entier';
    if (errors['min']) return `Le poids ne peut pas être inférieur à ${this.getMinWeight(controlName)}g`;
    return '';
  }

  // Obtenir le poids maximum autorisé pour un champ
  private getMaxWeight(controlName: string): number {
    const index = parseInt(controlName.split('_')[1]);
    if (this.collection && this.collection.wasteItems[index]) {
      return this.collection.wasteItems[index].estimatedWeight * 1.2;
    }
    return 0;
  }
 
  private getMinWeight(controlName: string): number {
    const index = parseInt(controlName.split('_')[1]);
    if (this.collection && this.collection.wasteItems[index]) {
      return this.collection.wasteItems[index].estimatedWeight * 0.8;
    }
    return 0;
  }

  getWasteTypeLabel(type: WasteType): string {
    return this.wasteTypes.find(t => t.type === type)?.label || type;
  }

  onSubmit() {
    this.submitted = true;

    if (this.validateForm.invalid) {
      Object.keys(this.validateForm.controls).forEach(key => {
        const control = this.validateForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    if (!this.collection) return;

    try {
      const updatedWasteItems = this.collection.wasteItems.map((item, index) => {
        const actualWeight = Number(this.validateForm.get(`weight_${index}`)?.value);
        const photos = this.validateForm.get(`photos_${index}`)?.value;

  
        if (actualWeight > item.estimatedWeight * 1.2 || actualWeight < item.estimatedWeight * 0.8) {
          throw new Error(`Le poids réel pour ${this.getWasteTypeLabel(item.type)} dépasse les limites autorisées`);
        }

        return {
          ...item,
          actualWeight,
          photos: photos || []
        };
      });

      const totalActualWeight = updatedWasteItems.reduce(
        (total, item) => total + (item.actualWeight || 0),
        0
      );

      this.store.dispatch(CollectionActions.updateCollectionStatus({
        id: this.collection.id!,
        status: 'COMPLETED',
        data: {
          wasteItems: updatedWasteItems,
          totalActualWeight
        }
      }));
    } catch (error: any) {
      alert(error.message);
    }
  }

  onReject() {
    if (!this.collection?.id) return;

    const reason = prompt('Motif du rejet :');
    if (reason === null) return;
    if (reason.trim() === '') {
      alert('Veuillez fournir un motif de rejet');
      return;
    }

    this.store.dispatch(CollectionActions.updateCollectionStatus({
      id: this.collection.id,
      status: 'REJECTED',
      data: { rejectionReason: reason }
    }));
  }

  onFileSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        alert('La taille du fichier ne doit pas dépasser 5MB');
        event.target.value = '';
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image');
        event.target.value = '';
        return;
      }

      this.validateForm.patchValue({ [`photos_${index}`]: file });
    }
  }
}