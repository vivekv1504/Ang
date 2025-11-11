import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { User } from '../../models/user';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  encapsulation: ViewEncapsulation.None
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  isEditing = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  // Form fields
  name = '';
  email = '';
  phone = '';
  street = '';
  city = '';
  state = '';
  zipCode = '';
  country = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadUserData();
  }

  loadUserData(): void {
    if (this.user) {
      this.name = this.user.name || '';
      this.email = this.user.email || '';
      this.phone = this.user.phone || '';
      this.street = this.user.address?.street || '';
      this.city = this.user.address?.city || '';
      this.state = this.user.address?.state || '';
      this.zipCode = this.user.address?.zipCode || '';
      this.country = this.user.address?.country || '';
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Reset to original data if canceling
      this.loadUserData();
    }
    this.clearMessages();
  }

  saveProfile(): void {
    if (!this.user || !this.user.id) {
      this.errorMessage = 'User not found';
      return;
    }

    if (!this.name.trim()) {
      this.errorMessage = 'Name is required';
      return;
    }

    this.isSaving = true;
    this.clearMessages();

    const updatedData: Partial<User> = {
      name: this.name.trim(),
      phone: this.phone.trim() || undefined,
      address: {
        street: this.street.trim() || undefined,
        city: this.city.trim() || undefined,
        state: this.state.trim() || undefined,
        zipCode: this.zipCode.trim() || undefined,
        country: this.country.trim() || undefined
      }
    };

    this.authService.updateUserProfile(this.user.id, updatedData).subscribe({
      next: (response) => {
        this.isSaving = false;
        if (response.success) {
          this.successMessage = 'Profile updated successfully!';
          this.isEditing = false;
          this.user = this.authService.getCurrentUser(); // Refresh user data
          this.loadUserData();
          
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Failed to update profile';
        }
      },
      error: (error) => {
        this.isSaving = false;
        this.errorMessage = 'An error occurred while updating profile';
        console.error('Error updating profile:', error);
      }
    });
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  goBack(): void {
    if (this.authService.isOwner()) {
      this.router.navigate(['/admin-dashboard']);
    } else {
      this.router.navigate(['/customer-products']);
    }
  }
}

