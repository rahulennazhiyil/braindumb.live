import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { Privacy } from './privacy';

const baseProviders = [
  provideRouter([]),
  { provide: PLATFORM_ID, useValue: 'server' },
];

describe('Privacy', () => {
  it('renders inside a [appSceneFrame] section', async () => {
    await TestBed.configureTestingModule({
      imports: [Privacy],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(Privacy);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('section[appSceneFrame]'),
    ).toBeTruthy();
  });

  it('decrypts the privacy kicker', async () => {
    await TestBed.configureTestingModule({
      imports: [Privacy],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(Privacy);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[aria-label="cat /privacy"]'),
    ).toBeTruthy();
  });

  it('renders the kinetic Privacy title', async () => {
    await TestBed.configureTestingModule({
      imports: [Privacy],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(Privacy);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[aria-label="Privacy"]'),
    ).toBeTruthy();
  });
});
