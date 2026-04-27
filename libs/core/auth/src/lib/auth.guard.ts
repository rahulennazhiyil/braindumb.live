import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { APP_CONFIG } from '@rahul-dev/core-config';
import { AuthService } from './auth.service';

/**
 * Allows navigation only when the visitor holds a Supabase session AND the
 * session's email matches the single configured admin email. Belt-and-braces
 * in case Supabase is ever set to allow public signups — a random signed-in
 * user still can't reach /admin.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const config = inject(APP_CONFIG);

  const adminEmail = config.admin.email.trim().toLowerCase();
  const userEmail = auth.user()?.email?.trim().toLowerCase() ?? '';
  const allowed =
    auth.isAuthenticated() && adminEmail !== '' && userEmail === adminEmail;

  if (allowed) return true;
  return router.createUrlTree(['/contact'], {
    queryParams: { from: 'admin' },
  });
};
