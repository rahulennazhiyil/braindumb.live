import { TestBed } from '@angular/core/testing';
import { BootSequence } from './boot-sequence';

function dispatchKey(key: string): void {
  window.dispatchEvent(new KeyboardEvent('keydown', { key }));
}

describe('BootSequence', () => {
  it('renders an aria-live region that consumers can announce', async () => {
    await TestBed.configureTestingModule({ imports: [BootSequence] }).compileComponents();
    const fixture = TestBed.createComponent(BootSequence);
    fixture.detectChanges();
    const root = fixture.nativeElement.firstElementChild as HTMLElement;
    expect(root.classList.contains('boot-sequence')).toBe(true);
    expect(root.getAttribute('role')).toBe('status');
  });

  it('exposes a `done` output signal that consumers can listen to', async () => {
    await TestBed.configureTestingModule({ imports: [BootSequence] }).compileComponents();
    const fixture = TestBed.createComponent(BootSequence);
    fixture.detectChanges();
    expect(typeof fixture.componentInstance.done).toBe('object');
  });

  it('skip() emits done synchronously', async () => {
    await TestBed.configureTestingModule({ imports: [BootSequence] }).compileComponents();
    const fixture = TestBed.createComponent(BootSequence);
    fixture.detectChanges();
    let fired = false;
    fixture.componentInstance.done.subscribe(() => (fired = true));
    fixture.componentInstance.skip();
    expect(fired).toBe(true);
  });

  it('exposes a `konamiTriggered` output', async () => {
    await TestBed.configureTestingModule({ imports: [BootSequence] }).compileComponents();
    const fixture = TestBed.createComponent(BootSequence);
    fixture.detectChanges();
    expect(typeof fixture.componentInstance.konamiTriggered).toBe('object');
  });

  it('emits konamiTriggered + done after the ↑↑↓↓ sequence', async () => {
    await TestBed.configureTestingModule({ imports: [BootSequence] }).compileComponents();
    const fixture = TestBed.createComponent(BootSequence);
    fixture.detectChanges();
    let konami = false;
    let done = false;
    fixture.componentInstance.konamiTriggered.subscribe(() => (konami = true));
    fixture.componentInstance.done.subscribe(() => (done = true));

    dispatchKey('ArrowUp');
    expect(done).toBe(false);

    dispatchKey('ArrowUp');
    dispatchKey('ArrowDown');
    dispatchKey('ArrowDown');

    expect(konami).toBe(true);
    expect(done).toBe(true);

    fixture.destroy();
  });

  it('non-arrow keys still skip immediately (no konami)', async () => {
    await TestBed.configureTestingModule({ imports: [BootSequence] }).compileComponents();
    const fixture = TestBed.createComponent(BootSequence);
    fixture.detectChanges();
    let konami = false;
    let done = false;
    fixture.componentInstance.konamiTriggered.subscribe(() => (konami = true));
    fixture.componentInstance.done.subscribe(() => (done = true));

    dispatchKey('Enter');

    expect(done).toBe(true);
    expect(konami).toBe(false);

    fixture.destroy();
  });
});
