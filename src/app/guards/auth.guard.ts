import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Auth Guard - Protects routes that require authentication
 * Redirects to login if user is not authenticated
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check localStorage for stored credentials (helps on page reload)
  const storedToken = localStorage.getItem('jwt');
  const storedRole = localStorage.getItem('role');

  return authService.currentUser$.pipe(
    take(1),
    timeout(1000), // Quick check
    map((user) => {
      if (user && authService.hasValidToken()) {
        return true;
      } else if (storedToken && storedRole && authService.hasValidToken()) {
        // On reload, if we have valid token, allow access
        return true;
      } else {
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
      }
    }),
    catchError(() => {
      // If timeout or error, check token as fallback
      if (storedToken && storedRole && authService.hasValidToken()) {
        return of(true);
      }
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return of(false);
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

    // Check localStorage for stored credentials
    const storedToken = localStorage.getItem('jwt');
    const storedRole = localStorage.getItem('role');

    return authService.currentUser$.pipe(
      take(1),
      timeout(1000), // Quick check
      map((user) => {
        if (!user && !storedToken) {
          router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
          return false;
        }

        // Get role from localStorage or user object
        const userRole = user?.role || storedRole;
        
        if (userRole === requiredRole) {
          return true;
        } else {
          // Redirect to appropriate dashboard based on user's actual role
          const actualRole = userRole || 'student';
          router.navigate([`/${actualRole}/my-classes`]);
          return false;
        }
      }),
      catchError(() => {
        // If timeout or error, check token as fallback
        if (storedToken && storedRole && authService.hasValidToken()) {
          if (storedRole === requiredRole) {
            return of(true);
          } else {
            router.navigate([`/${storedRole}/my-classes`]);
            return of(false);
          }
        }
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return of(false);
      })
    );
  };
};
