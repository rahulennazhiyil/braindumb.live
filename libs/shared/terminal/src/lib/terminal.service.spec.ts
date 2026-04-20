import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  TERMINAL_AUTH,
  type TerminalAuthenticator,
} from './terminal-auth.port';
import { TerminalService } from './terminal.service';

describe('TerminalService', () => {
  let auth: { authenticate: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(() => {
    auth = { authenticate: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: TERMINAL_AUTH,
          useValue: auth as unknown as TerminalAuthenticator,
        },
      ],
    });
    router = TestBed.inject(Router);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts closed, idle', () => {
    const svc = TestBed.inject(TerminalService);
    expect(svc.isOpen()).toBe(false);
    expect(svc.status()).toBe('idle');
  });

  it('open() sets state; close() resets', () => {
    const svc = TestBed.inject(TerminalService);
    svc.open();
    expect(svc.isOpen()).toBe(true);
    svc.close();
    expect(svc.isOpen()).toBe(false);
    expect(svc.status()).toBe('idle');
  });

  it('submit with success → granted then navigates to /admin', async () => {
    auth.authenticate.mockResolvedValue({ ok: true });
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const svc = TestBed.inject(TerminalService);
    svc.open();
    await svc.submit('correct');
    expect(svc.status()).toBe('granted');
    expect(svc.isOpen()).toBe(true); // still open until timer fires
    vi.advanceTimersByTime(800);
    expect(navigate).toHaveBeenCalledWith(['/admin']);
    expect(svc.isOpen()).toBe(false);
  });

  it('submit with failure → denied with error', async () => {
    auth.authenticate.mockResolvedValue({ ok: false, error: 'nope' });
    const svc = TestBed.inject(TerminalService);
    svc.open();
    await svc.submit('wrong');
    expect(svc.status()).toBe('denied');
    expect(svc.lastError()).toBe('nope');
    expect(svc.isOpen()).toBe(true);
  });

  it('empty password is a no-op (stays idle)', async () => {
    const svc = TestBed.inject(TerminalService);
    svc.open();
    await svc.submit('');
    expect(auth.authenticate).not.toHaveBeenCalled();
    expect(svc.status()).toBe('idle');
  });
});
