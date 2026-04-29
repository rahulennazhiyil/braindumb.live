import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TERMINAL_AUTH } from '@rahul-dev/shared-terminal';
import { describe, expect, it, vi } from 'vitest';
import { Home } from './home';

const baseProviders = [
  provideRouter([]),
  { provide: TERMINAL_AUTH, useValue: { authenticate: vi.fn() } },
  { provide: PLATFORM_ID, useValue: 'server' },
];

describe('Home', () => {
  it('renders the kinetic name with aria-label = "Rahul E"', async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    const heading = fixture.nativeElement.querySelector(
      '.hero__name app-kinetic-heading [aria-label]',
    ) as HTMLElement | null;
    expect(heading).toBeTruthy();
    expect(heading?.getAttribute('aria-label')).toBe('Rahul E');
  });

  it('attaches appDecryptText to the hero kicker', async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    const kicker = fixture.nativeElement.querySelector(
      '.hero__kicker [aria-label="whoami --verbose"]',
    ) as HTMLElement | null;
    expect(kicker).toBeTruthy();
  });

  it('attaches appDecryptText to the hero tagline', async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    const tagline = fixture.nativeElement.querySelector(
      '.hero__role [aria-label="Angular · TypeScript · D3.js"]',
    ) as HTMLElement | null;
    expect(tagline).toBeTruthy();
  });

  it('marks every top-level page section as a SceneFrame host', async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    const scenes = fixture.nativeElement.querySelectorAll(
      'section[appSceneFrame]',
    );
    expect(scenes.length).toBeGreaterThanOrEqual(4);
  });

  it('wraps the page root in an [appSceneScrollLock] container', async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector('[appSceneScrollLock]');
    expect(root).toBeTruthy();
  });

  it('inserts marquee bands between scenes', async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    const bands = fixture.nativeElement.querySelectorAll('app-marquee-band');
    expect(bands.length).toBeGreaterThanOrEqual(3);
  });

  it('decrypts the featured-work and explore section kickers', async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[aria-label="git log --featured"]'),
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[aria-label="ls -la"]'),
    ).toBeTruthy();
  });

  it('renders kinetic titles for featured-work and explore sections', async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[aria-label="Selected work"]'),
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[aria-label="What else is here"]'),
    ).toBeTruthy();
  });

  it('decrypts the contact kicker', async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    const contact = fixture.nativeElement.querySelector(
      '.contact__kicker [aria-label="transmission/open"]',
    );
    expect(contact).toBeTruthy();
  });
});
