import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div class="sm:mx-auto sm:w-full sm:max-w-md mb-8">
            <h2 class="text-center text-3xl font-extrabold text-gray-900">
              Inscription
            </h2>
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Informations personnelles -->
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700">
                  Prénom
                </label>
                <input
                  type="text"
                  id="firstName"
                  formControlName="firstName"
                  placeholder="Votre prénom"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
                  [ngClass]="{'border-red-500': submitted && f['firstName'].errors}"
                >
                <div *ngIf="submitted && f['firstName'].errors" class="mt-2 text-sm text-red-600">
                  <div *ngIf="f['firstName'].errors['required']">Le prénom est requis</div>
                </div>
              </div>

              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700">
                  Nom
                </label>
                <input
                  type="text"
                  id="lastName"
                  formControlName="lastName"
                  placeholder="Votre nom"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
                  [ngClass]="{'border-red-500': submitted && f['lastName'].errors}"
                >
                <div *ngIf="submitted && f['lastName'].errors" class="mt-2 text-sm text-red-600">
                  <div *ngIf="f['lastName'].errors['required']">Le nom est requis</div>
                </div>
              </div>
            </div>

            <!-- Email et mot de passe -->
            <div class="space-y-6">
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  formControlName="email"
                  placeholder="exemple@email.com"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
                  [ngClass]="{'border-red-500': submitted && f['email'].errors}"
                >
                <div *ngIf="submitted && f['email'].errors" class="mt-2 text-sm text-red-600">
                  <div *ngIf="f['email'].errors['required']">L'email est requis</div>
                  <div *ngIf="f['email'].errors['email']">L'email n'est pas valide</div>
                </div>
              </div>

              <div>
                <label for="password" class="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="password"
                  formControlName="password"
                  placeholder="Minimum 6 caractères"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
                  [ngClass]="{'border-red-500': submitted && f['password'].errors}"
                >
                <div *ngIf="submitted && f['password'].errors" class="mt-2 text-sm text-red-600">
                  <div *ngIf="f['password'].errors['required']">Le mot de passe est requis</div>
                  <div *ngIf="f['password'].errors['minlength']">Le mot de passe doit contenir au moins 6 caractères</div>
                </div>
              </div>
            </div>

            <!-- Contact et date de naissance -->
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label for="phoneNumber" class="block text-sm font-medium text-gray-700">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  formControlName="phoneNumber"
                  placeholder="0600000000"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
                  [ngClass]="{'border-red-500': submitted && f['phoneNumber'].errors}"
                >
                <div *ngIf="submitted && f['phoneNumber'].errors" class="mt-2 text-sm text-red-600">
                  <div *ngIf="f['phoneNumber'].errors['required']">Le numéro de téléphone est requis</div>
                  <div *ngIf="f['phoneNumber'].errors['pattern']">Le format n'est pas valide</div>
                </div>
              </div>

              <div>
                <label for="dateOfBirth" class="block text-sm font-medium text-gray-700">
                  Date de naissance
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  formControlName="dateOfBirth"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
                  [ngClass]="{'border-red-500': submitted && f['dateOfBirth'].errors}"
                >
                <div *ngIf="submitted && f['dateOfBirth'].errors" class="mt-2 text-sm text-red-600">
                  <div *ngIf="f['dateOfBirth'].errors['required']">La date de naissance est requise</div>
                </div>
              </div>
            </div>

            <!-- Adresse -->
            <div formGroupName="address" class="space-y-6">
              <div>
                <label for="street" class="block text-sm font-medium text-gray-700">
                  Rue
                </label>
                <input
                  type="text"
                  id="street"
                  formControlName="street"
                  placeholder="Numéro et nom de rue"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
                  [ngClass]="{'border-red-500': submitted && f['address'].get('street')?.errors}"
                >
                <div *ngIf="submitted && f['address'].get('street')?.errors" class="mt-2 text-sm text-red-600">
                  <div *ngIf="f['address'].get('street')?.errors?.['required']">La rue est requise</div>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label for="city" class="block text-sm font-medium text-gray-700">
                    Ville
                  </label>
                  <input
                    type="text"
                    id="city"
                    formControlName="city"
                    placeholder="Votre ville"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
                    [ngClass]="{'border-red-500': submitted && f['address'].get('city')?.errors}"
                  >
                  <div *ngIf="submitted && f['address'].get('city')?.errors" class="mt-2 text-sm text-red-600">
                    <div *ngIf="f['address'].get('city')?.errors?.['required']">La ville est requise</div>
                  </div>
                </div>

                <div>
                  <label for="postalCode" class="block text-sm font-medium text-gray-700">
                    Code postal
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    formControlName="postalCode"
                    placeholder="00000"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
                    [ngClass]="{'border-red-500': submitted && f['address'].get('postalCode')?.errors}"
                  >
                  <div *ngIf="submitted && f['address'].get('postalCode')?.errors" class="mt-2 text-sm text-red-600">
                    <div *ngIf="f['address'].get('postalCode')?.errors?.['required']">Le code postal est requis</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bouton de soumission -->
            <div class="mt-6">
              <button
                type="submit"
                [disabled]="loading"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition duration-150 ease-in-out transform hover:scale-[1.02]"
              >
                {{ loading ? 'Inscription...' : 'S\'inscrire' }}
              </button>
            </div>

            <div *ngIf="error" class="mt-2 text-sm text-red-600 text-center">
              {{ error }}
            </div>
          </form>

          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600">
              Déjà inscrit ?
              <a routerLink="/auth/login" class="font-medium text-green-600 hover:text-green-500 transition duration-150 ease-in-out">
                Se connecter
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^0[567][0-9]{8}$/)]],
      dateOfBirth: ['', Validators.required],
      address: this.formBuilder.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        postalCode: ['', Validators.required]
      })
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';

    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    const userData = {
      ...this.registerForm.value,
      dateOfBirth: new Date(this.registerForm.value.dateOfBirth)
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
} 