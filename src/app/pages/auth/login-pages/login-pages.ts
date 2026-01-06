import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../../services/alert.service';
import { Router, RouterLink } from '@angular/router';
import { DeviceService } from '../../../services/device.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login-pages',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login-pages.html',
  styleUrl: './login-pages.css',
})
export class LoginPages {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  device = inject(DeviceService);
  private authService = inject(AuthService);
  private alert = inject(AlertService);
  private router = inject(Router);

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['', Validators.required],
      remember: [false],
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.alert.showWarning('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    const { email, password, role } = this.loginForm.value;

    if (!role || role === '' || role === undefined) {
      this.alert.showWarning('Role Required', 'Please select a role.');
      return;
    }

    this.isLoading = true;

    try {
      // Sign in with Firebase Authentication
      const user = await this.authService.signIn(email, password).toPromise();
      
      if (user) {
        // Store role in localStorage (you might want to store this in Firestore user document instead)
        localStorage.setItem('role', role);
        localStorage.setItem('uid', user.uid);
        
        this.alert.showSuccess('Login Successful', 'Welcome back!');
        
        // Navigate based on role
        if (role === 'student') {
          this.router.navigate(['/student/my-classes']);
        } else {
          this.router.navigate(['/teacher/my-classes']);
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific Firebase auth errors
      let errorMessage = 'An error occurred during login. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      this.alert.showError('Login Failed', errorMessage);
    } finally {
      this.isLoading = false;
    }
  }
}
