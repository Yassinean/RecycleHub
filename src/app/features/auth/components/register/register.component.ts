import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { DEFAULT_PROFILE_IMAGE } from '../../../../core/constants/default-profile';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../../../core/store/actions/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../../../core/store/selectors/auth.selectors';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading$ = this.store.select(selectAuthLoading);
  error$ = this.store.select(selectAuthError);
  submitted = false;
  imagePreview: string | null = null;
  DEFAULT_PROFILE_IMAGE = DEFAULT_PROFILE_IMAGE;

  constructor(
    private formBuilder: FormBuilder,
    private store: Store
  ) {
    // Réinitialiser la base de données pour les tests
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
      if (!file.type.startsWith('image/')) {
        this.store.dispatch(AuthActions.registerFailure({ error: 'Veuillez sélectionner une image' }));
        return;
      }
      if (file.size > 5000000) {
        this.store.dispatch(AuthActions.registerFailure({ error: 'L\'image ne doit pas dépasser 5MB' }));
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

    if (this.registerForm.invalid) {
      return;
    }

    const userData = {
      ...this.registerForm.value,
      dateOfBirth: new Date(this.registerForm.value.dateOfBirth),
      profilePicture: this.imagePreview || DEFAULT_PROFILE_IMAGE,
      role: 'CUSTOMER',
      points: 0
    };

    this.store.dispatch(AuthActions.register({ user: userData }));
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