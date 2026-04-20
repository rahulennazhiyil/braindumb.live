import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SUPABASE_CLIENT } from '@rahul-dev/core-supabase';
import type { Session } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';

function makeSupabaseMock(initialSession: Session | null) {
  const listeners: Array<(_event: string, s: Session | null) => void> = [];
  const unsubscribe = vi.fn();
  return {
    listeners,
    unsubscribe,
    client: {
      auth: {
        getSession: vi.fn(async () => ({
          data: { session: initialSession },
        })),
        onAuthStateChange: vi.fn((cb) => {
          listeners.push(cb);
          return { data: { subscription: { unsubscribe } } };
        }),
        signInWithPassword: vi.fn(async () => ({ error: null })),
        signOut: vi.fn(async () => ({ error: null })),
      },
    } as unknown,
  };
}

describe('AuthService', () => {
  beforeEach(() => {
    // default browser platform
  });

  it('starts unauthenticated on server platform and marks ready', () => {
    const mock = makeSupabaseMock(null);
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: SUPABASE_CLIENT, useValue: mock.client },
      ],
    });
    const svc = TestBed.inject(AuthService);
    expect(svc.isAuthenticated()).toBe(false);
    expect(svc.ready()).toBe(true);
    expect(svc.user()).toBeNull();
  });

  it('hydrates existing session on browser', async () => {
    const session = { user: { id: 'u1' } } as unknown as Session;
    const mock = makeSupabaseMock(session);
    TestBed.configureTestingModule({
      providers: [
        { provide: SUPABASE_CLIENT, useValue: mock.client },
      ],
    });
    const svc = TestBed.inject(AuthService);
    // Allow the hydration promise to resolve.
    await Promise.resolve();
    await Promise.resolve();
    TestBed.flushEffects();
    expect(svc.isAuthenticated()).toBe(true);
    expect(svc.session()).toBe(session);
  });

  it('updates session when onAuthStateChange fires', async () => {
    const mock = makeSupabaseMock(null);
    TestBed.configureTestingModule({
      providers: [{ provide: SUPABASE_CLIENT, useValue: mock.client }],
    });
    const svc = TestBed.inject(AuthService);
    await Promise.resolve();
    expect(svc.isAuthenticated()).toBe(false);

    const newSession = { user: { id: 'u1' } } as unknown as Session;
    mock.listeners[0]('SIGNED_IN', newSession);
    expect(svc.isAuthenticated()).toBe(true);

    mock.listeners[0]('SIGNED_OUT', null);
    expect(svc.isAuthenticated()).toBe(false);
  });

  it('signIn returns ok=true on success', async () => {
    const mock = makeSupabaseMock(null);
    TestBed.configureTestingModule({
      providers: [{ provide: SUPABASE_CLIENT, useValue: mock.client }],
    });
    const svc = TestBed.inject(AuthService);
    const result = await svc.signIn('a@b.com', 'pw');
    expect(result.ok).toBe(true);
  });

  it('signIn maps "invalid" errors to a clean message', async () => {
    const mock = makeSupabaseMock(null);
    (mock.client as { auth: Record<string, unknown> }).auth[
      'signInWithPassword'
    ] = vi.fn(async () => ({
      error: { message: 'Invalid login credentials' } as never,
    }));
    TestBed.configureTestingModule({
      providers: [{ provide: SUPABASE_CLIENT, useValue: mock.client }],
    });
    const svc = TestBed.inject(AuthService);
    const result = await svc.signIn('a@b.com', 'wrong');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Invalid credentials.');
  });
});
