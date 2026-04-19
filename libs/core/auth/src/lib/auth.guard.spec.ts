import { TestBed } from '@angular/core/testing';
import {
  provideRouter,
  Router,
  type ActivatedRouteSnapshot,
  type RouterStateSnapshot,
  type UrlTree,
} from '@angular/router';
import { describe, expect, it } from 'vitest';
import { authGuard } from './auth.guard';

describe('authGuard (stub)', () => {
  it('redirects every request to /contact', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const router = TestBed.inject(Router);

    const result = TestBed.runInInjectionContext(() =>
      authGuard(
        {} as ActivatedRouteSnapshot,
        { url: '/admin/dashboard' } as RouterStateSnapshot,
      ),
    ) as UrlTree;

    expect(router.serializeUrl(result)).toBe('/contact');
  });
});
