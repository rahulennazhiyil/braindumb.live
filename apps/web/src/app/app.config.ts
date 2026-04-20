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
import { PageViewTracker } from '@rahul-dev/core-analytics';
import { AuthService } from '@rahul-dev/core-auth';
import { APP_CONFIG, provideAppConfig } from '@rahul-dev/core-config';
import { createSupabaseClientProvider } from '@rahul-dev/core-supabase';
import { ThemeService } from '@rahul-dev/shared-theme';
import {
  SudoKeystrokeTrap,
  TERMINAL_AUTH,
  type TerminalAuthenticator,
} from '@rahul-dev/shared-terminal';
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
      admin: { email: '' },
    }),
    createSupabaseClientProvider(),

    // Phase 8: adapter that lets the (shared) terminal call the (core) auth
    // service without breaking the module-boundary rule.
    {
      provide: TERMINAL_AUTH,
      useFactory: (): TerminalAuthenticator => {
        const auth = inject(AuthService);
        const config = inject(APP_CONFIG);
        return {
          async authenticate(password) {
            if (!config.admin.email) {
              return { ok: false, error: 'Admin not configured.' };
            }
            return auth.signIn(config.admin.email, password);
          },
        };
      },
    },

    provideAppInitializer(() => {
      inject(ThemeService);
      // Force AuthService to construct so it hydrates the session early.
      inject(AuthService);
      // Wire the global "sudo su" keystroke trap.
      inject(SudoKeystrokeTrap);
      // Phase 11: start page-view tracking. No-ops on SSR and when
      // config.analytics.enabled is false (default).
      inject(PageViewTracker).start();
    }),
  ],
};
