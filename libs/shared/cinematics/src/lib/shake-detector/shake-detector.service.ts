import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Subject, type Observable } from 'rxjs';

const SHAKE_THRESHOLD = 25;
const WINDOW_MS = 1500;
const REQUIRED_SHAKES = 3;

interface ShakeStamp {
  readonly t: number;
}

interface IosDeviceMotionEvent {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

/**
 * Detects "three sharp shakes within 1.5s" by listening to DeviceMotionEvent.
 *
 * iOS Safari requires `DeviceMotionEvent.requestPermission()` to be called
 * inside a user-gesture handler. The consumer (App) wires `start()` to the
 * first `pointerdown` after page load. On non-iOS browsers `start()` just
 * attaches the listener.
 *
 * Tests inject events directly via `processMotionEvent(event)`; the
 * production listener delegates to that same path.
 */
@Injectable({ providedIn: 'root' })
export class ShakeDetector {
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _shake$ = new Subject<void>();
  readonly shake$: Observable<void> = this._shake$.asObservable();

  private stamps: ShakeStamp[] = [];
  private listenerAttached = false;

  /**
   * Attach the listener (after iOS permission grant if needed).
   * Safe to call multiple times — only attaches once.
   */
  async start(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.listenerAttached) return;
    if (typeof window === 'undefined') return;

    const motionCtor = (
      window as unknown as { DeviceMotionEvent?: IosDeviceMotionEvent }
    ).DeviceMotionEvent;
    if (!motionCtor) return;

    if (typeof motionCtor.requestPermission === 'function') {
      try {
        const result = await motionCtor.requestPermission();
        if (result !== 'granted') return;
      } catch {
        return;
      }
    }

    window.addEventListener(
      'devicemotion',
      (e: DeviceMotionEvent) => this.processMotionEvent(e),
      { passive: true },
    );
    this.listenerAttached = true;
  }

  processMotionEvent(event: DeviceMotionEvent): void {
    const a = event.acceleration;
    if (!a) return;
    const magnitude = Math.sqrt(
      (a.x ?? 0) ** 2 + (a.y ?? 0) ** 2 + (a.z ?? 0) ** 2,
    );
    if (magnitude < SHAKE_THRESHOLD) return;

    const now = Date.now();
    this.stamps.push({ t: now });
    this.stamps = this.stamps.filter((s) => now - s.t <= WINDOW_MS);

    if (this.stamps.length >= REQUIRED_SHAKES) {
      this.stamps = [];
      this._shake$.next();
    }
  }
}
