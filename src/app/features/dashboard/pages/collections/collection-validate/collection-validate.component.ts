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
          this.fb.control('', [Validators.required, Validators.min(0)])
        );
        this.validateForm.addControl(
          `photos_${index}`,
          this.fb.control('')
        );
      });
    });
  }

  getWasteTypeLabel(type: WasteType): string {
    return this.wasteTypes.find(t => t.type === type)?.label || type;
  }

  onSubmit() {
    if (this.validateForm.invalid || !this.collection) return;

    const updatedWasteItems = this.collection.wasteItems.map((item, index) => {
      const actualWeight = Number(this.validateForm.get(`weight_${index}`)?.value);
      // Vérifier si le poids réel est trop différent du poids estimé
      if (Math.abs(actualWeight - item.estimatedWeight) > item.estimatedWeight * 0.2) {
        if (!confirm(`Le poids réel (${actualWeight}g) est très différent du poids estimé (${item.estimatedWeight}g). Voulez-vous continuer ?`)) {
          throw new Error('Validation annulée');
        }
      }
      return {
        ...item,
        actualWeight,
        photos: this.validateForm.get(`photos_${index}`)?.value || []
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
  }

  onReject() {
    if (!this.collection?.id) return;

    const reason = prompt('Motif du rejet :');
    if (reason === null) return;

    this.store.dispatch(CollectionActions.updateCollectionStatus({
      id: this.collection.id,
      status: 'REJECTED',
      data: { rejectionReason: reason }
    }));
  }
} 