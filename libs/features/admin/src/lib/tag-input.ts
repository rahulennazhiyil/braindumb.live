import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
  selector: 'app-tag-input',
  imports: [LucideAngularModule],
  templateUrl: './tag-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagInput {
  readonly tags = input<readonly string[]>([]);
  readonly placeholder = input<string>('Add tag and press Enter');
  readonly tagsChange = output<readonly string[]>();

  protected readonly draft = signal('');
  protected readonly current = computed(() => this.tags() ?? []);
  protected readonly X = X;

  protected add(): void {
    const value = this.draft().trim();
    if (!value) return;
    const current = this.current();
    if (current.includes(value)) {
      this.draft.set('');
      return;
    }
    this.tagsChange.emit([...current, value]);
    this.draft.set('');
  }

  protected remove(tag: string): void {
    this.tagsChange.emit(this.current().filter((t) => t !== tag));
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.add();
    } else if (
      event.key === 'Backspace' &&
      this.draft() === '' &&
      this.current().length > 0
    ) {
      this.tagsChange.emit(this.current().slice(0, -1));
    }
  }
}
