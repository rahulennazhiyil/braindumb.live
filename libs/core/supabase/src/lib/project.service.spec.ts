import { TestBed } from '@angular/core/testing';
import { provideAppConfig } from '@rahul-dev/core-config';
import { describe, expect, it, vi } from 'vitest';
import { ProjectService } from './project.service';
import { SUPABASE_CLIENT } from './supabase-client';

type MockRow = Record<string, unknown>;

function makeQuery(result: { data?: unknown; error?: unknown }) {
  const q: Record<string, unknown> = {};
  const chain = vi.fn(() => q);
  q['select'] = chain;
  q['eq'] = chain;
  q['order'] = chain;
  q['maybeSingle'] = vi.fn(async () => result);
  q['single'] = vi.fn(async () => result);
  q['insert'] = chain;
  q['update'] = chain;
  q['delete'] = chain;
  q['then'] = undefined;
  // Allow `await query` (without a terminal call) to resolve to the list.
  Object.defineProperty(q, 'then', {
    value: (resolve: (v: unknown) => void) => resolve(result),
  });
  return q;
}

function makeSupabase(result: { data?: unknown; error?: unknown }) {
  const from = vi.fn(() => makeQuery(result));
  return { from } as unknown;
}

describe('ProjectService', () => {
  it('listPublished returns rows on success', async () => {
    const rows: MockRow[] = [{ id: '1', title: 'SCRAII', slug: 'scraii' }];
    TestBed.configureTestingModule({
      providers: [
        provideAppConfig({}),
        { provide: SUPABASE_CLIENT, useValue: makeSupabase({ data: rows, error: null }) },
      ],
    });
    const svc = TestBed.inject(ProjectService);
    const result = await svc.listPublished();
    expect(result).toEqual(rows);
  });

  it('findBySlug returns null when not found', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideAppConfig({}),
        { provide: SUPABASE_CLIENT, useValue: makeSupabase({ data: null, error: null }) },
      ],
    });
    const svc = TestBed.inject(ProjectService);
    expect(await svc.findBySlug('missing')).toBeNull();
  });

  it('throws when Supabase returns an error', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideAppConfig({}),
        {
          provide: SUPABASE_CLIENT,
          useValue: makeSupabase({ data: null, error: new Error('RLS') }),
        },
      ],
    });
    const svc = TestBed.inject(ProjectService);
    await expect(svc.listPublished()).rejects.toThrow('RLS');
  });
});
