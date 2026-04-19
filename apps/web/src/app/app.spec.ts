import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { App } from './app';

describe('App shell', () => {
  it('renders navbar, outlet, and footer', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('app-navbar')).toBeTruthy();
    expect(root.querySelector('router-outlet')).toBeTruthy();
    expect(root.querySelector('app-footer')).toBeTruthy();
  });
});
