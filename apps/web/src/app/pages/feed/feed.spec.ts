import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FeedService } from '@rahul-dev/core-supabase';
import { describe, expect, it, vi } from 'vitest';
import { Feed } from './feed';

const stubService = {
  list: vi.fn().mockResolvedValue([]),
};

const baseProviders = [
  provideRouter([]),
  { provide: FeedService, useValue: stubService },
  { provide: PLATFORM_ID, useValue: 'server' },
];

describe('Feed', () => {
  it('renders inside a [appSceneFrame] section', async () => {
    await TestBed.configureTestingModule({
      imports: [Feed],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(Feed);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('section[appSceneFrame]'),
    ).toBeTruthy();
  });

  it('decrypts the feed kicker', async () => {
    await TestBed.configureTestingModule({
      imports: [Feed],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(Feed);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[aria-label="tail -f feed.log"]'),
    ).toBeTruthy();
  });

  it('renders the kinetic Feed title', async () => {
    await TestBed.configureTestingModule({
      imports: [Feed],
      providers: baseProviders,
    }).compileComponents();
    const fixture = TestBed.createComponent(Feed);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[aria-label="Feed"]'),
    ).toBeTruthy();
  });
});
