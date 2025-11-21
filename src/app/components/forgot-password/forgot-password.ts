import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  emailSent: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  onSubmit(): void {
    if (!this.email) {
      this.errorMessage = 'Please enter your email address';
      return;
    }

    if (!this.isEmailValid()) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Simulate password reset email
    // In a real application, this would call a backend API
    this.authService.getUsers().subscribe({
      next: (users) => {
        const user = users.find(u => u.email === this.email);
        
        setTimeout(() => {
          this.isLoading = false;
          
          if (user) {
            this.emailSent = true;
            this.successMessage = `Password reset instructions have been sent to ${this.email}`;
            
            // In a real app, you would send an email here
            console.log('Password reset requested for:', this.email);
            console.log('User found:', user.name);
            console.log('In production, send reset email with token link');
          } else {
            // For security, show success even if email doesn't exist
            // This prevents email enumeration attacks
            this.emailSent = true;
            this.successMessage = `If an account exists with ${this.email}, password reset instructions have been sent.`;
          }
        }, 1500); // Simulate API delay
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'An error occurred. Please try again later.';
        console.error('Error:', error);
      }
    });
  }

  backToLogin(): void {
    this.router.navigate(['/login']);
  }
}

