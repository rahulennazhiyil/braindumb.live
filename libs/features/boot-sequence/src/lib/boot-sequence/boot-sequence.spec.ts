import { TestBed } from '@angular/core/testing';
import { BootSequence } from './boot-sequence';

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
});
