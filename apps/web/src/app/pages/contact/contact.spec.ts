import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ContactService } from '@rahul-dev/core-supabase';
import { describe, expect, it, vi } from 'vitest';
import { Contact } from './contact';

const stubService = {
  submit: vi.fn().mockResolvedValue(undefined),
};

const baseProviders = [
  provideRouter([]),
  { provide: ContactService, useValue: stubService },
  { provide: PLATFORM_ID, useValue: 'server' },
];

describe('Contact', () => {
  it('renders inside a [appSceneFrame] section', async () => {
    await TestBed.configureTestingModule({
      imports: [Contact],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(Contact);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('section[appSceneFrame]'),
    ).toBeTruthy();
  });

  it('decrypts the contact kicker', async () => {
    await TestBed.configureTestingModule({
      imports: [Contact],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(Contact);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[aria-label="echo $EMAIL"]'),
    ).toBeTruthy();
  });

  it('renders the kinetic Contact title', async () => {
    await TestBed.configureTestingModule({
      imports: [Contact],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(Contact);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[aria-label="Contact"]'),
    ).toBeTruthy();
  });
});
