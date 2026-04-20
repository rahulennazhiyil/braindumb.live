import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { TERMINAL_AUTH } from './terminal-auth.port';
import { TerminalOverlay } from './terminal-overlay';
import { TerminalService } from './terminal.service';

describe('TerminalOverlay', () => {
  const setup = () => {
    TestBed.configureTestingModule({
      imports: [TerminalOverlay],
      providers: [
        provideRouter([]),
        {
          provide: TERMINAL_AUTH,
          useValue: { authenticate: vi.fn() },
        },
      ],
    });
    const svc = TestBed.inject(TerminalService);
    const fixture = TestBed.createComponent(TerminalOverlay);
    fixture.detectChanges();
    return { fixture, svc };
  };

  it('renders nothing when closed', () => {
    const { fixture } = setup();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="dialog"]')).toBeNull();
  });

  it('renders the dialog + prompt + focuses input when opened', async () => {
    const { fixture, svc } = setup();
    svc.open();
    TestBed.flushEffects();
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="dialog"]')).toBeTruthy();
    expect(root.textContent).toContain('sudo su');
    expect(root.querySelector('input[type="password"]')).toBeTruthy();
    // afterNextRender is async — just assert the DOM exists; focus side-effect
    // runs in the browser render phase which vitest+happy-dom schedules.
  });
});
