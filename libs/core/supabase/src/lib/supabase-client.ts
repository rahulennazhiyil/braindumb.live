import { isPlatformBrowser } from '@angular/common';
import {
  InjectionToken,
  PLATFORM_ID,
  Provider,
  inject,
} from '@angular/core';
import { APP_CONFIG } from '@rahul-dev/core-config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Token used by all Supabase-backed services to resolve a configured client.
 * Services should prefer injecting this token over constructing clients
 * directly — tests swap it for a mock, SSR can opt out by providing a stub.
 */
export const SUPABASE_CLIENT = new InjectionToken<SupabaseClient>(
  'SUPABASE_CLIENT',
);

export function createSupabaseClientProvider(): Provider {
  return {
    provide: SUPABASE_CLIENT,
    useFactory: (): SupabaseClient => {
      const { supabase } = inject(APP_CONFIG);
      const platformId = inject(PLATFORM_ID);

      // In SSR or when credentials are missing, build an unconfigured client.
      // Services that hit the unconfigured client will receive network errors
      // from supabase-js; they guard against this by reading isConfigured.
      return createClient(
        supabase.url || 'https://placeholder.invalid',
        supabase.anonKey || 'placeholder-anon-key',
        {
          auth: {
            persistSession: isPlatformBrowser(platformId),
            autoRefreshToken: isPlatformBrowser(platformId),
            detectSessionInUrl: isPlatformBrowser(platformId),
          },
        },
      );
    },
  };
}
