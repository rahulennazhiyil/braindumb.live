import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

/**
 * Temporary guard used by /admin until Phase 6/8 wires Supabase-backed auth.
 * Deny-by-default: unauthenticated visitors are redirected to /contact per
 * blueprint §5.6 ("This area is for Rahul. Reach me here →").
 */
export const authGuard: CanActivateFn = (): UrlTree => {
  const router = inject(Router);
  return router.createUrlTree(['/contact']);
};
