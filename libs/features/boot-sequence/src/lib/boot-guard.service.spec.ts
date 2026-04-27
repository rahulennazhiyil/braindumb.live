import { TestBed } from '@angular/core/testing';
import { BootGuardService } from './boot-guard.service';

describe('BootGuardService', () => {
  beforeEach(() => {
    localStorage.removeItem('rahul-dev:boot-seen');
    TestBed.configureTestingModule({ providers: [BootGuardService] });
  });

  afterEach(() => {
    localStorage.removeItem('rahul-dev:boot-seen');
  });

  it('shouldPlayLong is true on first call', () => {
    const svc = TestBed.inject(BootGuardService);
    expect(svc.shouldPlayLong()).toBe(true);
  });

  it('shouldPlayLong is false after markPlayed', () => {
    const svc = TestBed.inject(BootGuardService);
    svc.markPlayed();
    expect(svc.shouldPlayLong()).toBe(false);
  });

  it('reset() restores first-visit state', () => {
    const svc = TestBed.inject(BootGuardService);
    svc.markPlayed();
    svc.reset();
    expect(svc.shouldPlayLong()).toBe(true);
  });
});
