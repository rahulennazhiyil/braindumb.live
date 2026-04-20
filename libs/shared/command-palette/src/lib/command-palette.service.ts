import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Injectable,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import Fuse from 'fuse.js';
import type { Command } from './command';

/**
 * Global command palette. Opens on Cmd+K / Ctrl+K when no input/textarea is
 * focused. The host app registers commands via `register()`. Service runs
 * in the root injector so any component can bring commands along.
 */
@Injectable({ providedIn: 'root' })
export class CommandPaletteService {
  readonly #platformId = inject(PLATFORM_ID);
  readonly #document = inject(DOCUMENT);
  readonly #destroyRef = inject(DestroyRef);

  readonly #isOpen = signal(false);
  readonly #query = signal('');
  readonly #selectedIndex = signal(0);
  readonly #commands = signal<readonly Command[]>([]);

  readonly isOpen = this.#isOpen.asReadonly();
  readonly query = this.#query.asReadonly();
  readonly selectedIndex = this.#selectedIndex.asReadonly();
  readonly commands = this.#commands.asReadonly();

  readonly results = computed<readonly Command[]>(() => {
    const q = this.#query().trim();
    const all = this.#commands();
    if (q === '') return all;
    const fuse = new Fuse(all as Command[], {
      keys: ['label', 'keywords', 'group'],
      threshold: 0.35,
      ignoreLocation: true,
    });
    return fuse.search(q).map((r) => r.item);
  });

  constructor() {
    if (!isPlatformBrowser(this.#platformId)) return;

    const keydown = (event: KeyboardEvent) => this.onKeydown(event);
    this.#document.addEventListener('keydown', keydown);
    this.#destroyRef.onDestroy(() =>
      this.#document.removeEventListener('keydown', keydown),
    );
  }

  register(commands: readonly Command[]): () => void {
    const current = this.#commands();
    const next = dedupe([...current, ...commands]);
    this.#commands.set(next);
    // Unregister by id so a host re-registering the same logical commands
    // later (with fresh object references) doesn't accidentally leave
    // old-reference handles pointing at nothing.
    const ids = new Set(commands.map((c) => c.id));
    return () => {
      this.#commands.set(this.#commands().filter((c) => !ids.has(c.id)));
    };
  }

  open(): void {
    if (this.#isOpen()) return;
    this.#query.set('');
    this.#selectedIndex.set(0);
    this.#isOpen.set(true);
  }

  close(): void {
    this.#isOpen.set(false);
  }

  setQuery(q: string): void {
    this.#query.set(q);
    this.#selectedIndex.set(0);
  }

  moveSelection(delta: number): void {
    const count = this.results().length;
    if (count === 0) return;
    const next = (this.#selectedIndex() + delta + count) % count;
    this.#selectedIndex.set(next);
  }

  selectIndex(index: number): void {
    this.#selectedIndex.set(index);
  }

  async runSelected(): Promise<void> {
    const cmd = this.results()[this.#selectedIndex()];
    if (!cmd) return;
    this.close();
    await cmd.run();
  }

  private onKeydown(event: KeyboardEvent): void {
    // Cmd/Ctrl+K opens the palette from anywhere except text inputs.
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      const target = event.target as HTMLElement | null;
      if (isEditable(target) && !this.#isOpen()) return;
      event.preventDefault();
      if (this.#isOpen()) this.close();
      else this.open();
    }
  }
}

function isEditable(el: HTMLElement | null): boolean {
  if (!el) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

function dedupe(commands: readonly Command[]): readonly Command[] {
  const seen = new Set<string>();
  const out: Command[] = [];
  for (const cmd of commands) {
    if (seen.has(cmd.id)) continue;
    seen.add(cmd.id);
    out.push(cmd);
  }
  return out;
}
