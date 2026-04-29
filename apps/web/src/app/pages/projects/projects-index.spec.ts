import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProjectService } from '@rahul-dev/core-supabase';
import { describe, expect, it, vi } from 'vitest';
import { ProjectsIndex } from './projects-index';

const stubService = {
  listPublished: vi.fn().mockResolvedValue([]),
};

const baseProviders = [
  provideRouter([]),
  { provide: ProjectService, useValue: stubService },
  { provide: PLATFORM_ID, useValue: 'server' },
];

describe('ProjectsIndex', () => {
  it('renders inside an [appSceneFrame] section', async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsIndex],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(ProjectsIndex);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('section[appSceneFrame]'),
    ).toBeTruthy();
  });

  it('decrypts the projects kicker', async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsIndex],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(ProjectsIndex);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[aria-label="ls ./projects"]'),
    ).toBeTruthy();
  });

  it('renders the kinetic Projects title', async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsIndex],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(ProjectsIndex);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[aria-label="Projects"]'),
    ).toBeTruthy();
  });
});
