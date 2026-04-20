import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { AuthService } from '@rahul-dev/core-auth';
import { provideAppConfig } from '@rahul-dev/core-config';
import { createSupabaseClientProvider } from '@rahul-dev/core-supabase';
import { ThemeService } from '@rahul-dev/shared-theme';
import { appRoutes } from './app.routes';
import { AppErrorHandler } from './core/app-error-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    { provide: ErrorHandler, useClass: AppErrorHandler },

    // Phase 6 runtime config. Real Supabase credentials are swapped in via
    // Vercel env vars at build time (or a provider override in tests).
    provideAppConfig({
      supabase: { url: '', anonKey: '' },
      analytics: { enabled: false },
    }),
    createSupabaseClientProvider(),

    provideAppInitializer(() => {
      inject(ThemeService);
      // Force AuthService to construct so it hydrates the session early.
      inject(AuthService);
    }),
  ],
};
