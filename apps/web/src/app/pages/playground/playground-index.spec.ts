import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { PlaygroundIndex } from './playground-index';

const baseProviders = [
  provideRouter([]),
  { provide: PLATFORM_ID, useValue: 'server' },
];

describe('PlaygroundIndex', () => {
  it('renders inside a [appSceneFrame] section', async () => {
    await TestBed.configureTestingModule({
      imports: [PlaygroundIndex],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(PlaygroundIndex);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('section[appSceneFrame]'),
    ).toBeTruthy();
  });

  it('decrypts the playground kicker', async () => {
    await TestBed.configureTestingModule({
      imports: [PlaygroundIndex],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(PlaygroundIndex);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[aria-label="ls ./playground"]'),
    ).toBeTruthy();
  });

  it('renders the kinetic playground title', async () => {
    await TestBed.configureTestingModule({
      imports: [PlaygroundIndex],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(PlaygroundIndex);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector(
        '[aria-label="Visualization playground"]',
      ),
    ).toBeTruthy();
  });
});
