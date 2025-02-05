import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { IndexedDBService } from '../../../../core/services/indexed-db.service';
import { DEFAULT_PROFILE_IMAGE } from '../../../../core/constants/default-profile';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  imagePreview: string | null = null;
  DEFAULT_PROFILE_IMAGE = DEFAULT_PROFILE_IMAGE;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private indexedDB: IndexedDBService
  ) {
    // Réinitialiser la base de données pour les tests
    this.indexedDB.deleteDatabase().then(() => {
      console.log('Database reset completed');
    });
    
    this.registerForm = this.formBuilder.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      firstName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/)
      ]],
      phoneNumber: ['', [
        Validators.required,
        Validators.pattern(/^0[567][0-9]{8}$/)
      ]],
      dateOfBirth: ['', [
        Validators.required,
        this.ageValidator(18)
      ]],
      address: this.formBuilder.group({
        street: ['', [Validators.required, Validators.minLength(5)]],
        city: ['', [Validators.required, Validators.minLength(2)]],
        postalCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]]
      }),
      role: ['CUSTOMER', Validators.required],
      profilePicture: ['']
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Vérifier le type et la taille du fichier
      if (!file.type.startsWith('image/')) {
        this.error = 'Veuillez sélectionner une image';
        return;
      }
      if (file.size > 5000000) { // 5MB max
        this.error = 'L\'image ne doit pas dépasser 5MB';
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.registerForm.patchValue({
          profilePicture: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';

    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    
    const userData: User = {
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      phoneNumber: this.registerForm.value.phoneNumber,
      dateOfBirth: new Date(this.registerForm.value.dateOfBirth),
      address: {
        street: this.registerForm.value.address.street,
        city: this.registerForm.value.address.city,
        postalCode: this.registerForm.value.address.postalCode
      },
      profilePicture: this.registerForm.value.profilePicture || DEFAULT_PROFILE_IMAGE,
      role: 'CUSTOMER',
      points: 0
    };

    this.authService.register(userData).subscribe({
      next: () => {
        this.router.navigate(['/auth/login'], {
          queryParams: { registered: true }
        });
      },
      error: (error) => {
        this.error = error.message || 'Une erreur est survenue';
        this.loading = false;
      }
    });
  }

  // Validateur pour l'âge minimum
  private ageValidator(minAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const today = new Date();
      const birthDate = new Date(control.value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age >= minAge ? null : { tooYoung: true };
    };
  }
} 