import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../../services/alert.service';
import { Router, RouterLink } from '@angular/router';
import { DeviceService } from '../../../services/device.service';
import { AuthService } from '../../../services/auth.service';
import { GoogleAuthService } from '../../../services/google-auth.service';

@Component({
  selector: 'app-login-pages',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login-pages.html',
  styleUrl: './login-pages.css',
})
export class LoginPages implements AfterViewInit {
  loginForm: FormGroup;
  showPassword = false;
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
      const desktopButton = document.getElementById('google-signin-button');
      if (desktopButton) {
        this.googleAuthService.renderButton('google-signin-button', (credential) => {
          this.handleGoogleSignIn(credential);
        });
      }

      // Mobile button (only if element exists)
      const mobileButton = document.getElementById('google-signin-button-mobile');
      if (mobileButton) {
        this.googleAuthService.renderButton('google-signin-button-mobile', (credential) => {
          this.handleGoogleSignIn(credential);
        });
      }
    }, 1000);
  }

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
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

    const { email, password } = this.loginForm.value;

    this.isLoading = true;

    try {
      // Login directly with backend (no Firebase)
      const response = await this.authService.login(email, password).toPromise();
      
      if (response) {
        this.alert.showSuccess('Login Successful', 'Welcome back!');
        
        // Navigate based on role returned from backend
        const role = response.user.role;
        if (role === 'student') {
          this.router.navigate(['/student/my-classes']);
        } else if (role === 'teacher') {
          this.router.navigate(['/teacher/my-classes']);
        } else {
          this.alert.showWarning('Role Not Found', 'Please contact support.');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle backend errors
      let errorMessage = 'An error occurred during login. Please try again.';
      
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      this.alert.showError('Login Failed', errorMessage);
    } finally {
      this.isLoading = false;
    }
  }

  async signInWithGoogle() {
    this.isLoading = true;
    
    try {
      const idToken = await this.googleAuthService.signIn();
      
      if (idToken) {
        await this.handleGoogleSignIn(idToken);
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      let errorMessage = 'An error occurred during Google sign-in. Please try again.';
      
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      this.alert.showError('Google Sign-In Failed', errorMessage);
    } finally {
      this.isLoading = false;
    }
  }

  private async handleGoogleSignIn(idToken: string) {
    try {
      // Send to backend for verification
      const response = await this.authService.googleAuth(idToken).toPromise();
      
      if (response) {
        this.alert.showSuccess('Login Successful', 'Welcome back!');
        
        const role = response.user.role;
        if (role === 'student') {
          this.router.navigate(['/student/my-classes']);
        } else if (role === 'teacher') {
          this.router.navigate(['/teacher/my-classes']);
        }
      }
    } catch (error: any) {
      console.error('Backend auth error:', error);
      throw error;
    }
  }
}
