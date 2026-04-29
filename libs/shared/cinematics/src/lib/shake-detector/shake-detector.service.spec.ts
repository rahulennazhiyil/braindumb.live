import { TestBed } from '@angular/core/testing';
import { ShakeDetector } from './shake-detector.service';

function fakeMotionEvent(magnitude: number): DeviceMotionEvent {
  return {
    acceleration: { x: magnitude, y: magnitude, z: magnitude },
    accelerationIncludingGravity: { x: 0, y: 0, z: 0 },
    rotationRate: { alpha: 0, beta: 0, gamma: 0 },
    interval: 16,
  } as unknown as DeviceMotionEvent;
}

describe('ShakeDetector', () => {
  it('emits shake$ after 3 high-magnitude events within 1.5s', () => {
    TestBed.configureTestingModule({ providers: [ShakeDetector] });
    const svc = TestBed.inject(ShakeDetector);

    let count = 0;
    svc.shake$.subscribe(() => count++);

    svc.processMotionEvent(fakeMotionEvent(60));
    svc.processMotionEvent(fakeMotionEvent(60));
    svc.processMotionEvent(fakeMotionEvent(60));

    expect(count).toBe(1);
  });

  it('ignores low-magnitude motion (no shake)', () => {
    TestBed.configureTestingModule({ providers: [ShakeDetector] });
    const svc = TestBed.inject(ShakeDetector);

    let count = 0;
    svc.shake$.subscribe(() => count++);

    svc.processMotionEvent(fakeMotionEvent(2));
    svc.processMotionEvent(fakeMotionEvent(2));
    svc.processMotionEvent(fakeMotionEvent(2));

    expect(count).toBe(0);
  });

  it('drops events older than the window', async () => {
    TestBed.configureTestingModule({ providers: [ShakeDetector] });
    const svc = TestBed.inject(ShakeDetector);

    let count = 0;
    svc.shake$.subscribe(() => count++);

    svc.processMotionEvent(fakeMotionEvent(60));
    svc.processMotionEvent(fakeMotionEvent(60));

    await new Promise((resolve) => setTimeout(resolve, 1600));

    svc.processMotionEvent(fakeMotionEvent(60));

    expect(count).toBe(0);
  });

  it('start() is a no-op on the server', async () => {
    TestBed.configureTestingModule({ providers: [ShakeDetector] });
    const svc = TestBed.inject(ShakeDetector);

    await expect(svc.start()).resolves.not.toThrow();
  });
});
