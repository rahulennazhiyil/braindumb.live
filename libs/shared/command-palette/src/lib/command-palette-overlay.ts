import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  CornerDownLeft,
  LucideAngularModule,
  Search,
} from 'lucide-angular';
import type { CommandGroup } from './command';
import { CommandPaletteService } from './command-palette.service';

const GROUP_LABEL: Record<CommandGroup, string> = {
  navigate: 'Navigate',
  theme: 'Theme',
  action: 'Actions',
};

@Component({
  selector: 'app-command-palette',
  imports: [LucideAngularModule],
  templateUrl: './command-palette-overlay.html',
  styleUrl: './command-palette-overlay.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandPaletteOverlay {
  private readonly service = inject(CommandPaletteService);
  private readonly injector = inject(Injector);
  private readonly input =
    viewChild<ElementRef<HTMLInputElement>>('searchInput');

  protected readonly isOpen = this.service.isOpen;
  protected readonly query = this.service.query;
  protected readonly selectedIndex = this.service.selectedIndex;
  protected readonly results = this.service.results;
  protected readonly Search = Search;
  protected readonly CornerDownLeft = CornerDownLeft;
  protected readonly tick = signal(0);

  /** Group results for the rendered list — keeps the order fuzzy-search gave us. */
  protected readonly grouped = computed<
    ReadonlyArray<{ label: string; group: CommandGroup; indices: number[] }>
  >(() => {
    const byGroup = new Map<CommandGroup, number[]>();
    this.results().forEach((cmd, i) => {
      const bucket = byGroup.get(cmd.group) ?? [];
      bucket.push(i);
      byGroup.set(cmd.group, bucket);
    });
    return Array.from(byGroup.entries()).map(([group, indices]) => ({
      group,
      label: GROUP_LABEL[group],
      indices,
    }));
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        afterNextRender(
          () => {
            const el = this.input()?.nativeElement;
            el?.focus();
            el?.select();
          },
          { injector: this.injector },
        );
      }
    });
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.isOpen()) this.service.close();
  }

  @HostListener('document:keydown.arrowdown', ['$event'])
  protected onArrowDown(event: Event): void {
    if (!this.isOpen()) return;
    event.preventDefault();
    this.service.moveSelection(1);
  }

  @HostListener('document:keydown.arrowup', ['$event'])
  protected onArrowUp(event: Event): void {
    if (!this.isOpen()) return;
    event.preventDefault();
    this.service.moveSelection(-1);
  }

  @HostListener('document:keydown.enter', ['$event'])
  protected onEnter(event: Event): void {
    if (!this.isOpen()) return;
    event.preventDefault();
    void this.service.runSelected();
  }

  protected onQueryInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.service.setQuery(value);
  }

  protected select(index: number): void {
    this.service.selectIndex(index);
    void this.service.runSelected();
  }

  protected hover(index: number): void {
    this.service.selectIndex(index);
  }
}
