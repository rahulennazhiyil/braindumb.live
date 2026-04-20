import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Allows navigation when the visitor has a valid Supabase session; otherwise
 * redirects to /contact per blueprint §5.6. Until Phase 8 adds the terminal
 * login overlay, the only way to get a session is via the Supabase dashboard
 * (manual email/password entry — single-admin account).
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  return router.createUrlTree(['/contact']);
};
