import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { About } from './about';

const baseProviders = [
  provideRouter([]),
  { provide: PLATFORM_ID, useValue: 'server' },
];

describe('About', () => {
  it('wraps the page in [appSceneScrollLock]', async () => {
    await TestBed.configureTestingModule({
      imports: [About],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(About);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[appSceneScrollLock]'),
    ).toBeTruthy();
  });

  it('renders three [appSceneFrame] sections', async () => {
    await TestBed.configureTestingModule({
      imports: [About],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(About);
    fixture.detectChanges();
    const scenes = fixture.nativeElement.querySelectorAll(
      'section[appSceneFrame]',
    );
    expect(scenes.length).toBe(3);
  });

  it('inserts marquee bands between scenes', async () => {
    await TestBed.configureTestingModule({
      imports: [About],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(About);
    fixture.detectChanges();
    const bands = fixture.nativeElement.querySelectorAll('app-marquee-band');
    expect(bands.length).toBeGreaterThanOrEqual(2);
  });

  it('decrypts the bio kicker', async () => {
    await TestBed.configureTestingModule({
      imports: [About],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(About);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[aria-label="whoami --about"]'),
    ).toBeTruthy();
  });

  it('renders the bio name via <app-kinetic-heading>', async () => {
    await TestBed.configureTestingModule({
      imports: [About],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(About);
    fixture.detectChanges();
    const kinetic = fixture.nativeElement.querySelector(
      '.bio__name app-kinetic-heading [aria-label]',
    );
    expect(kinetic?.getAttribute('aria-label')).toBe('Rahul E');
  });

  it('decrypts career + tech-stack kickers', async () => {
    await TestBed.configureTestingModule({
      imports: [About],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(About);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[aria-label="git log --career"]'),
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[aria-label="npm list --depth=0"]'),
    ).toBeTruthy();
  });

  it('renders kinetic Career and Tech Stack titles', async () => {
    await TestBed.configureTestingModule({
      imports: [About],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(About);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[aria-label="Career"]'),
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[aria-label="Tech Stack"]'),
    ).toBeTruthy();
  });
});
