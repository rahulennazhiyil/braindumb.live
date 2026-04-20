import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { SudoKeystrokeTrap } from './sudo-keystroke-trap';
import { TERMINAL_AUTH } from './terminal-auth.port';
import { TerminalService } from './terminal.service';

function dispatchKey(key: string, target: EventTarget = document.body): void {
  const ev = new KeyboardEvent('keydown', { key, bubbles: true });
  Object.defineProperty(ev, 'target', { value: target });
  document.dispatchEvent(ev);
}

describe('SudoKeystrokeTrap', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: TERMINAL_AUTH,
          useValue: { authenticate: vi.fn() },
        },
      ],
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('opens terminal after typing "sudo su"', () => {
    const svc = TestBed.inject(TerminalService);
    TestBed.inject(SudoKeystrokeTrap);
    for (const ch of 'sudo su') dispatchKey(ch);
    expect(svc.isOpen()).toBe(true);
  });

  it('ignores keystrokes targeted at input fields', () => {
    const svc = TestBed.inject(TerminalService);
    TestBed.inject(SudoKeystrokeTrap);
    const input = document.createElement('input');
    document.body.appendChild(input);
    for (const ch of 'sudo su') dispatchKey(ch, input);
    expect(svc.isOpen()).toBe(false);
    input.remove();
  });

  it('resets the buffer after quiet period', () => {
    const svc = TestBed.inject(TerminalService);
    TestBed.inject(SudoKeystrokeTrap);
    for (const ch of 'sudo') dispatchKey(ch);
    vi.advanceTimersByTime(3000);
    for (const ch of ' su') dispatchKey(ch);
    expect(svc.isOpen()).toBe(false);
  });

  it('ignores non-character keys (arrows, modifiers)', () => {
    const svc = TestBed.inject(TerminalService);
    TestBed.inject(SudoKeystrokeTrap);
    dispatchKey('Escape');
    dispatchKey('ArrowDown');
    for (const ch of 'sudo su') dispatchKey(ch);
    expect(svc.isOpen()).toBe(true);
  });
});
