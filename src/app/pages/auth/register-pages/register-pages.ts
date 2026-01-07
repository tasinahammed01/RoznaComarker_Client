import { CommonModule } from '@angular/common';
import { Component, inject, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';
import { DeviceService } from '../../../services/device.service';
import { GoogleAuthService } from '../../../services/google-auth.service';

@Component({
  selector: 'app-register-pages',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register-pages.html',
  styleUrl: './register-pages.css',
})
export class RegisterPages implements AfterViewInit {
  registerForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  device = inject(DeviceService);
  private authService = inject(AuthService);
  private googleAuthService = inject(GoogleAuthService);
  private alert = inject(AlertService);
  private router = inject(Router);

  ngAfterViewInit() {
    // Initialize Google Sign-In buttons
    setTimeout(() => {
      // Desktop button
      const desktopButton = document.getElementById('google-signup-button');
      if (desktopButton) {
        this.googleAuthService.renderButton('google-signup-button', (credential) => {
          const role = this.registerForm.get('role')?.value;
          if (!role) {
            this.alert.showWarning('Role Required', 'Please select a role first.');
            return;
          }
          this.handleGoogleSignUp(credential, role);
        });
      }

      // Mobile button (only if element exists)
      const mobileButton = document.getElementById('google-signup-button-mobile');
      if (mobileButton) {
        this.googleAuthService.renderButton('google-signup-button-mobile', (credential) => {
          const role = this.registerForm.get('role')?.value;
          if (!role) {
            this.alert.showWarning('Role Required', 'Please select a role first.');
            return;
          }
          this.handleGoogleSignUp(credential, role);
        });
      }
    }, 1000);
  }

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
      // Register directly with backend (no Firebase)
      const response = await this.authService.register(email, password, role, displayName).toPromise();

      if (response) {
        this.alert.showSuccess('Registration Successful', 'Your account has been created successfully!');

        // Navigate based on role returned from backend
        const userRole = response.user.role;
        if (userRole === 'student') {
          this.router.navigate(['/student/my-classes']);
        } else if (userRole === 'teacher') {
          this.router.navigate(['/teacher/my-classes']);
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);

      // Handle backend errors
      let errorMessage = 'An error occurred during registration. Please try again.';

      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      this.alert.showError('Registration Failed', errorMessage);
    } finally {
      this.isLoading = false;
    }
  }

  async signUpWithGoogle() {
    this.isLoading = true;
    
    try {
      const role = this.registerForm.get('role')?.value;
      
      if (!role) {
        this.alert.showWarning('Role Required', 'Please select a role first.');
        this.isLoading = false;
        return;
      }
      
      const idToken = await this.googleAuthService.signIn();
      
      if (idToken) {
        await this.handleGoogleSignUp(idToken, role);
      }
    } catch (error: any) {
      console.error('Google sign-up error:', error);
      let errorMessage = 'An error occurred during Google sign-up. Please try again.';
      
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      this.alert.showError('Google Sign-Up Failed', errorMessage);
    } finally {
      this.isLoading = false;
    }
  }

  private async handleGoogleSignUp(idToken: string, role: string) {
    try {
      // Send to backend with role
      const response = await this.authService.googleAuth(idToken, role).toPromise();
      
      if (response) {
        this.alert.showSuccess('Registration Successful', 'Your account has been created successfully!');
        
        const userRole = response.user.role;
        if (userRole === 'student') {
          this.router.navigate(['/student/my-classes']);
        } else if (userRole === 'teacher') {
          this.router.navigate(['/teacher/my-classes']);
        }
      }
    } catch (error: any) {
      console.error('Backend auth error:', error);
      throw error;
    }
  }
}
