import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  templateUrl: './button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit'>('button');
  readonly disabled = input<boolean>(false);

  protected readonly classes = computed(() => {
    const base =
      'inline-flex items-center justify-center font-mono uppercase tracking-wider transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none';
    const sizeMap: Record<ButtonSize, string> = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-chip',
      md: 'text-sm px-4 py-2 gap-2 rounded-chip',
      lg: 'text-base px-6 py-3 gap-2.5 rounded-chip',
    };
    const variantMap: Record<ButtonVariant, string> = {
      primary:
        'bg-accent-primary text-bg-primary hover:shadow-glow hover:-translate-y-0.5',
      secondary:
        'bg-bg-surface text-text-primary border border-border hover:border-accent-primary hover:text-accent-primary',
      ghost:
        'bg-transparent text-text-secondary hover:text-accent-primary hover:bg-bg-elevated',
    };
    return `${base} ${sizeMap[this.size()]} ${variantMap[this.variant()]}`;
  });
}
