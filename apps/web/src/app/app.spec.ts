import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TERMINAL_AUTH } from '@rahul-dev/shared-terminal';
import { describe, expect, it, vi } from 'vitest';
import { App } from './app';

describe('App shell', () => {
  it('renders navbar, outlet, footer, and terminal overlay', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        {
          provide: TERMINAL_AUTH,
          useValue: { authenticate: vi.fn() },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('app-navbar')).toBeTruthy();
    expect(root.querySelector('router-outlet')).toBeTruthy();
    expect(root.querySelector('app-footer')).toBeTruthy();
    expect(root.querySelector('app-terminal-overlay')).toBeTruthy();
  });
});
