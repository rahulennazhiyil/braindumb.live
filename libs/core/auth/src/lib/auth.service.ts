import { isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Injectable,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { SUPABASE_CLIENT } from '@rahul-dev/core-supabase';
import type { AuthError, Session, User } from '@supabase/supabase-js';

export interface SignInResult {
  readonly ok: boolean;
  readonly error?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly #supabase = inject(SUPABASE_CLIENT);
  readonly #platformId = inject(PLATFORM_ID);
  readonly #destroyRef = inject(DestroyRef);

  readonly #session = signal<Session | null>(null);
  readonly #ready = signal(false);

  readonly session = this.#session.asReadonly();
  readonly ready = this.#ready.asReadonly();
  readonly user = computed<User | null>(() => this.#session()?.user ?? null);
  readonly isAuthenticated = computed(() => this.#session() !== null);

  constructor() {
    if (!isPlatformBrowser(this.#platformId)) {
      // SSR has no session — mark ready so guards don't hang.
      this.#ready.set(true);
      return;
    }

    // Hydrate initial session, then subscribe to future auth events.
    // Always flip `ready` — a network error during hydration shouldn't stall
    // downstream consumers (the guard's deny path still works either way).
    void this.#supabase.auth
      .getSession()
      .then(({ data }) => this.#session.set(data.session))
      .catch(() => undefined)
      .finally(() => this.#ready.set(true));

    const { data: sub } = this.#supabase.auth.onAuthStateChange(
      (_event, session) => this.#session.set(session),
    );
    this.#destroyRef.onDestroy(() => sub.subscription.unsubscribe());
  }

  async signIn(email: string, password: string): Promise<SignInResult> {
    const { error } = await this.#supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { ok: false, error: toMessage(error) };
    return { ok: true };
  }

  async signOut(): Promise<void> {
    await this.#supabase.auth.signOut();
  }
}

function toMessage(error: AuthError): string {
  // Avoid leaking Supabase internals into UI copy.
  if (error.message.toLowerCase().includes('invalid')) {
    return 'Invalid credentials.';
  }
  return 'Sign-in failed. Try again.';
}
