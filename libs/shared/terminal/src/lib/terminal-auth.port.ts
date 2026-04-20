import { InjectionToken } from '@angular/core';

export interface TerminalAuthResult {
  readonly ok: boolean;
  readonly error?: string;
}

/**
 * Dependency-inversion seam between the terminal (type:shared) and the
 * real AuthService (type:core). Host app provides an implementation that
 * wraps AuthService.signIn so the terminal stays in the shared tier.
 */
export interface TerminalAuthenticator {
  authenticate(password: string): Promise<TerminalAuthResult>;
}

export const TERMINAL_AUTH = new InjectionToken<TerminalAuthenticator>(
  'TERMINAL_AUTH',
);
