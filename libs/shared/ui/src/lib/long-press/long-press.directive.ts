import {
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  output,
} from '@angular/core';

/**
 * Fires `appLongPress` after the host has been pressed continuously for
 * `holdMs` milliseconds. Cancels on pointer up, leave, or move past
 * MOVE_TOLERANCE pixels — so accidental scrolls don't trigger.
 *
 * Usage:
 *   <button (appLongPress)="onSecret()" [holdMs]="700">…</button>
 */
const MOVE_TOLERANCE = 10;

@Directive({ selector: '[appLongPress]', standalone: true })
export class LongPress {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly holdMs = input<number>(650);
  readonly appLongPress = output<void>();

  private timer: ReturnType<typeof setTimeout> | null = null;
  private startX = 0;
  private startY = 0;

  constructor() {
    const host = this.el.nativeElement;

    const cancel = () => {
      if (this.timer !== null) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    };

    const onDown = (e: PointerEvent) => {
      this.startX = e.clientX;
      this.startY = e.clientY;
      cancel();
      this.timer = setTimeout(() => {
        this.timer = null;
        this.appLongPress.emit();
      }, this.holdMs());
    };

    const onMove = (e: PointerEvent) => {
      if (this.timer === null) return;
      const dx = Math.abs(e.clientX - this.startX);
      const dy = Math.abs(e.clientY - this.startY);
      if (dx > MOVE_TOLERANCE || dy > MOVE_TOLERANCE) cancel();
    };

    host.addEventListener('pointerdown', onDown);
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerup', cancel);
    host.addEventListener('pointercancel', cancel);
    host.addEventListener('pointerleave', cancel);

    this.destroyRef.onDestroy(() => {
      cancel();
      host.removeEventListener('pointerdown', onDown);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerup', cancel);
      host.removeEventListener('pointercancel', cancel);
      host.removeEventListener('pointerleave', cancel);
    });
  }
}
