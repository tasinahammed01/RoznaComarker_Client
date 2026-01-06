import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';
import { DeviceService } from '../../../services/device.service';

@Component({
  selector: 'app-register-pages',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register-pages.html',
  styleUrl: './register-pages.css',
})
export class RegisterPages {
  registerForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  device = inject(DeviceService);
  private authService = inject(AuthService);
  private alert = inject(AlertService);
  private router = inject(Router);

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        role: ['', Validators.required],
        displayName: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async onSubmit() {
    if (this.registerForm.invalid) {
      this.alert.showWarning('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    const { email, password, role, displayName } = this.registerForm.value;

    if (!role || role === '' || role === undefined) {
      this.alert.showWarning('Role Required', 'Please select a role.');
      return;
    }

    this.isLoading = true;

    try {
      // Create user with Firebase Authentication
      const user = await this.authService.signUp(email, password, displayName).toPromise();

      if (user) {
        // Store role in localStorage (you might want to store this in Firestore user document instead)
        localStorage.setItem('role', role);
        localStorage.setItem('uid', user.uid);

        this.alert.showSuccess('Registration Successful', 'Your account has been created successfully!');

        // Navigate based on role
        if (role === 'student') {
          this.router.navigate(['/student/my-classes']);
        } else {
          this.router.navigate(['/teacher/my-classes']);
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);

      // Handle specific Firebase auth errors
      let errorMessage = 'An error occurred during registration. Please try again.';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email address is already registered. Please use a different email or try logging in.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      }

      this.alert.showError('Registration Failed', errorMessage);
    } finally {
      this.isLoading = false;
    }
  }
}
