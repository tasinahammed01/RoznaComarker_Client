import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User, onAuthStateChanged, sendPasswordResetEmail, updateProfile } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { AlertService } from './alert.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  private alertService = inject(AlertService);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Listen to auth state changes
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
    });
  }

  /**
   * Get current user synchronously
   */
  get currentUser(): User | null {
    return this.auth.currentUser;
  }

  /**
   * Sign in with email and password
   */
  signIn(email: string, password: string): Observable<User> {
    return from(signInWithEmailAndPassword(this.auth, email, password).then((userCredential) => {
      return userCredential.user;
    }));
  }

  /**
   * Sign up with email and password
   */
  signUp(email: string, password: string, displayName?: string): Observable<User> {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password).then(async (userCredential) => {
        const user = userCredential.user;
        if (displayName) {
          await updateProfile(user, { displayName });
        }
        return user;
      })
    );
  }

  /**
   * Sign out current user
   */
  signOut(): Observable<void> {
    return from(signOut(this.auth));
  }

  /**
   * Send password reset email
   */
  sendPasswordResetEmail(email: string): Observable<void> {
    return from(sendPasswordResetEmail(this.auth, email));
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.auth.currentUser !== null;
  }

  /**
   * Get user ID token
   */
  async getIdToken(): Promise<string | null> {
    if (this.auth.currentUser) {
      return await this.auth.currentUser.getIdToken();
    }
    return null;
  }
}
