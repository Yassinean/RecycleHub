import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { DEFAULT_PROFILE_IMAGE } from '../../../../core/constants/default-profile';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  currentUser: User | null = null;
  imagePreview: string = DEFAULT_PROFILE_IMAGE;
  isEditing = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private store: Store
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: [{ value: '', disabled: true }],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^0[567][0-9]{8}$/)]],
      address: this.fb.group({
        street: ['', [Validators.required, Validators.minLength(5)]],
        city: ['', [Validators.required]],
        postalCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]]
      })
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.profileForm.patchValue(this.currentUser);
      this.imagePreview = this.currentUser.profilePicture || DEFAULT_PROFILE_IMAGE;
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing && this.currentUser) {
      this.profileForm.patchValue(this.currentUser);
    }
  }

  onSubmit() {
    if (this.profileForm.invalid) return;

    const updatedUser: User = {
      ...this.currentUser!,
      ...this.profileForm.getRawValue(),
      profilePicture: this.imagePreview
    };

    this.authService.updateUser(updatedUser).subscribe(
      (user) => {
        this.currentUser = user;
        this.isEditing = false;
        alert('Profil mis à jour avec succès');
      },
      (error) => {
        console.error('Erreur lors de la mise à jour du profil:', error);
        alert('Erreur lors de la mise à jour du profil');
      }
    );
  }
} 