import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { DemoFrame } from './demo-frame';

const baseProviders = [
  provideRouter([]),
  { provide: PLATFORM_ID, useValue: 'server' },
];

describe('DemoFrame', () => {
  it('renders inside a [appSceneFrame] section', async () => {
    await TestBed.configureTestingModule({
      imports: [DemoFrame],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(DemoFrame);
    fixture.componentRef.setInput('kicker', 'cat ./demo');
    fixture.componentRef.setInput('title', 'Demo');
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('section[appSceneFrame]'),
    ).toBeTruthy();
  });

  it('decrypts the kicker input', async () => {
    await TestBed.configureTestingModule({
      imports: [DemoFrame],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(DemoFrame);
    fixture.componentRef.setInput('kicker', 'cat ./demo');
    fixture.componentRef.setInput('title', 'Demo');
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[aria-label="cat ./demo"]'),
    ).toBeTruthy();
  });

  it('renders kinetic heading from title input', async () => {
    await TestBed.configureTestingModule({
      imports: [DemoFrame],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(DemoFrame);
    fixture.componentRef.setInput('kicker', 'cat ./demo');
    fixture.componentRef.setInput('title', 'K8s cluster');
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[aria-label="K8s cluster"]'),
    ).toBeTruthy();
  });
});
