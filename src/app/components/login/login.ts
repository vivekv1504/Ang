import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  rememberMe: boolean = false;
  showPassword: boolean = false;
  emailTouched: boolean = false;
  passwordTouched: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user credentials are saved
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    
    if (savedEmail && savedPassword) {
      this.email = savedEmail;
      this.password = atob(savedPassword); // Decode password
      this.rememberMe = true;
    }
  }

  // Email validation
  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  // Get email error message
  getEmailError(): string {
    if (!this.emailTouched) return '';
    if (!this.email) return 'Email is required';
    if (!this.isEmailValid()) return 'Please enter a valid email address';
    return '';
  }

  // Get password error message
  getPasswordError(): string {
    if (!this.passwordTouched) return '';
    if (!this.password) return 'Password is required';
    if (this.password.length < 6) return 'Password must be at least 6 characters';
    return '';
  }

  // Toggle password visibility
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Quick demo login
  quickLogin(role: 'owner' | 'customer'): void {
    if (role === 'owner') {
      this.email = 'owner@sipstop.com';
      this.password = 'owner123';
    } else {
      this.email = 'customer@sipstop.com';
      this.password = 'customer123';
    }
    
    // Trigger login after a short delay for better UX
    setTimeout(() => {
      this.onLogin();
    }, 300);
  }

  onLogin(): void {
    // Mark fields as touched for validation
    this.emailTouched = true;
    this.passwordTouched = true;

    // Validate
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password';
      return;
    }

    if (!this.isEmailValid()) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (user) => {
        this.isLoading = false;
        if (user) {
          // Handle Remember Me
          if (this.rememberMe) {
            localStorage.setItem('rememberedEmail', this.email);
            localStorage.setItem('rememberedPassword', btoa(this.password)); // Encode password
          } else {
            localStorage.removeItem('rememberedEmail');
            localStorage.removeItem('rememberedPassword');
          }

          // Show success message
          this.successMessage = `Welcome back, ${user.name || 'User'}!`;
          
          // Redirect based on role after short delay
          setTimeout(() => {
            if (user.role === 'owner') {
              this.router.navigate(['/admin-dashboard']);
            } else {
              this.router.navigate(['/customer-products']);
            }
          }, 800);
        } else {
          this.errorMessage = 'Invalid email or password';
          this.shakeForm();
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'An error occurred. Please try again.';
        console.error('Login error:', error);
        this.shakeForm();
      }
    });
  }

  // Shake form on error
  private shakeForm(): void {
    const formElement = document.querySelector('.login-card');
    if (formElement) {
      formElement.classList.add('shake');
      setTimeout(() => {
        formElement.classList.remove('shake');
      }, 500);
    }
  }

  // Handle forgot password
  onForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }
}
