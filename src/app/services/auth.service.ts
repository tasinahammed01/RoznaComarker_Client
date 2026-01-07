import { Injectable, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AlertService } from './alert.service';
import { ApiService } from './api.service';

interface AuthResponse {
  token: string;
  user: {
    userId: string;
    email: string;
    role: string;
    displayName?: string;
    photoURL?: string;
  };
}

interface User {
  userId: string;
  email: string;
  role: string;
  displayName?: string;
  photoURL?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private alertService = inject(AlertService);
  private apiService = inject(ApiService);
  private ngZone = inject(NgZone);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Load user from token on service initialization
    this.loadUserFromToken();
  }

  /**
   * Load user from JWT token
   */
  private loadUserFromToken() {
    const token = this.getJwtToken();
    if (token && this.hasValidToken()) {
      // Decode JWT to get user info
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUserSubject.next({
          userId: payload.userId,
          email: payload.email,
          role: payload.role
        });
      } catch (error) {
        console.error('Error decoding token:', error);
        this.clearAuth();
      }
    }
  }

  /**
   * Register with email and password
   */
  register(email: string, password: string, role: string, displayName?: string): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/register', {
      email,
      password,
      role,
      displayName
    }).pipe(
      tap((response) => {
        // Store JWT and user info
        localStorage.setItem('jwt', response.token);
        localStorage.setItem('userId', response.user.userId);
        localStorage.setItem('email', response.user.email);
        localStorage.setItem('role', response.user.role);
        this.currentUserSubject.next(response.user);
      }),
      catchError((error) => {
        console.error('Registration error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Login with email and password
   */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/login', {
      email,
      password
    }).pipe(
      tap((response) => {
        // Store JWT and user info
        localStorage.setItem('jwt', response.token);
        localStorage.setItem('userId', response.user.userId);
        localStorage.setItem('email', response.user.email);
        localStorage.setItem('role', response.user.role);
        this.currentUserSubject.next(response.user);
      }),
      catchError((error) => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Google OAuth login/register
   */
  googleAuth(idToken: string, role?: string): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/google', {
      idToken,
      role
    }).pipe(
      tap((response) => {
        // Store JWT and user info
        localStorage.setItem('jwt', response.token);
        localStorage.setItem('userId', response.user.userId);
        localStorage.setItem('email', response.user.email);
        localStorage.setItem('role', response.user.role);
        this.currentUserSubject.next(response.user);
      }),
      catchError((error) => {
        console.error('Google auth error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Sign out current user
   */
  signOut(): Observable<void> {
    this.clearAuth();
    return new Observable(observer => {
      observer.next();
      observer.complete();
    });
  }

  /**
   * Clear authentication data
   */
  private clearAuth() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    this.currentUserSubject.next(null);
  }

  /**
   * Get current user
   */
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get JWT token from localStorage
   */
  getJwtToken(): string | null {
    return localStorage.getItem('jwt');
  }

  /**
   * Check if user has valid JWT
   */
  hasValidToken(): boolean {
    const token = this.getJwtToken();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < exp;
    } catch {
      return false;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.hasValidToken() && this.currentUser !== null;
  }
}
