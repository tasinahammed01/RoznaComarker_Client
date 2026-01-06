import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

/**
 * Auth Guard - Protects routes that require authentication
 * Redirects to login if user is not authenticated
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map((user) => {
      if (user) {
        return true;
      } else {
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
      }
    })
  );
};

/**
 * Role-based Guard - Protects routes based on user role
 * Usage: canActivate: [roleGuard('teacher')] or roleGuard('student')
 */
export const roleGuard = (requiredRole: string): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.currentUser$.pipe(
      take(1),
      map((user) => {
        if (!user) {
          router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
          return false;
        }

        const userRole = localStorage.getItem('role');
        if (userRole === requiredRole) {
          return true;
        } else {
          // Redirect to appropriate dashboard based on user's actual role
          const actualRole = userRole || 'student';
          router.navigate([`/${actualRole}/my-classes`]);
          return false;
        }
      })
    );
  };
};
