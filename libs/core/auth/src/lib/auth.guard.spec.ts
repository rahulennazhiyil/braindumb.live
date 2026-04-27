import { TestBed } from '@angular/core/testing';
import {
  provideRouter,
  Router,
  type ActivatedRouteSnapshot,
  type RouterStateSnapshot,
  type UrlTree,
} from '@angular/router';
import { provideAppConfig } from '@rahul-dev/core-config';
import { SUPABASE_CLIENT } from '@rahul-dev/core-supabase';
import { describe, expect, it, vi } from 'vitest';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

const ADMIN_EMAIL = 'admin@example.test';

function makeMockClient(session: unknown) {
  return {
    auth: {
      getSession: vi.fn(async () => ({ data: { session } })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signInWithPassword: vi.fn(async () => ({ error: null })),
      signOut: vi.fn(async () => ({ error: null })),
    },
  };
}

describe('authGuard', () => {
  const dummyRoute = {} as ActivatedRouteSnapshot;
  const dummyState = { url: '/admin/dashboard' } as RouterStateSnapshot;

  it('redirects to /contact when unauthenticated', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideAppConfig({ admin: { email: ADMIN_EMAIL } }),
        { provide: SUPABASE_CLIENT, useValue: makeMockClient(null) },
      ],
    });
    const router = TestBed.inject(Router);
    const result = TestBed.runInInjectionContext(() =>
      authGuard(dummyRoute, dummyState),
    ) as UrlTree;
    expect(router.serializeUrl(result)).toBe('/contact?from=admin');
  });

  it('allows navigation when authenticated as the admin email', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideAppConfig({ admin: { email: ADMIN_EMAIL } }),
        {
          provide: SUPABASE_CLIENT,
          useValue: makeMockClient({
            user: { id: 'u1', email: ADMIN_EMAIL },
          }),
        },
      ],
    });
    const auth = TestBed.inject(AuthService);
    await Promise.resolve();
    await Promise.resolve();
    expect(auth.isAuthenticated()).toBe(true);
    const result = TestBed.runInInjectionContext(() =>
      authGuard(dummyRoute, dummyState),
    );
    expect(result).toBe(true);
  });

  it('redirects when authenticated as a non-admin email', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideAppConfig({ admin: { email: ADMIN_EMAIL } }),
        {
          provide: SUPABASE_CLIENT,
          useValue: makeMockClient({
            user: { id: 'u2', email: 'intruder@example.test' },
          }),
        },
      ],
    });
    const router = TestBed.inject(Router);
    const auth = TestBed.inject(AuthService);
    await Promise.resolve();
    await Promise.resolve();
    expect(auth.isAuthenticated()).toBe(true);
    const result = TestBed.runInInjectionContext(() =>
      authGuard(dummyRoute, dummyState),
    ) as UrlTree;
    expect(router.serializeUrl(result)).toBe('/contact?from=admin');
  });
});
