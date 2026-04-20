import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Command } from './command';
import { CommandPaletteService } from './command-palette.service';

function cmd(id: string, extra: Partial<Command> = {}): Command {
  return {
    id,
    label: id,
    group: 'action',
    run: vi.fn(),
    ...extra,
  };
}

describe('CommandPaletteService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('starts closed with an empty registry', () => {
    const svc = TestBed.inject(CommandPaletteService);
    expect(svc.isOpen()).toBe(false);
    expect(svc.commands()).toEqual([]);
  });

  it('registers commands and returns an unregister handle', () => {
    const svc = TestBed.inject(CommandPaletteService);
    const dispose = svc.register([cmd('a'), cmd('b')]);
    expect(svc.commands().map((c) => c.id)).toEqual(['a', 'b']);
    dispose();
    expect(svc.commands()).toEqual([]);
  });

  it('dedupes commands by id', () => {
    const svc = TestBed.inject(CommandPaletteService);
    svc.register([cmd('a'), cmd('a', { label: 'dup' })]);
    expect(svc.commands().map((c) => c.label)).toEqual(['a']);
  });

  it('filters via fuzzy search on label and keywords', () => {
    const svc = TestBed.inject(CommandPaletteService);
    svc.register([
      cmd('nav:home', { label: 'Go to Home' }),
      cmd('nav:projects', { label: 'Go to Projects', keywords: ['portfolio'] }),
      cmd('theme:terminal', { label: 'Theme: terminal', group: 'theme' }),
    ]);
    svc.setQuery('portfolio');
    expect(svc.results().map((r) => r.id)).toEqual(['nav:projects']);
    svc.setQuery('theme');
    expect(svc.results()[0]?.id).toBe('theme:terminal');
    svc.setQuery('');
    expect(svc.results()).toHaveLength(3);
  });

  it('moves selection and wraps around', () => {
    const svc = TestBed.inject(CommandPaletteService);
    svc.register([cmd('a'), cmd('b'), cmd('c')]);
    expect(svc.selectedIndex()).toBe(0);
    svc.moveSelection(1);
    expect(svc.selectedIndex()).toBe(1);
    svc.moveSelection(-2);
    expect(svc.selectedIndex()).toBe(2);
  });

  it('runs the selected command and closes the palette', async () => {
    const run = vi.fn();
    const svc = TestBed.inject(CommandPaletteService);
    svc.register([cmd('a', { run }), cmd('b')]);
    svc.open();
    svc.selectIndex(0);
    await svc.runSelected();
    expect(run).toHaveBeenCalledOnce();
    expect(svc.isOpen()).toBe(false);
  });
});
