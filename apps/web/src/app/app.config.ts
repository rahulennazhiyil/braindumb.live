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
import { ThemeService } from '@rahul-dev/shared-theme';
import { appRoutes } from './app.routes';
import { AppErrorHandler } from './core/app-error-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    { provide: ErrorHandler, useClass: AppErrorHandler },
    provideAppInitializer(() => {
      inject(ThemeService);
    }),
  ],
};
