import { TestBed } from '@angular/core/testing';
import { GrainOverlay } from './grain-overlay';

describe('GrainOverlay', () => {
  it('renders an aria-hidden full-viewport overlay', async () => {
    await TestBed.configureTestingModule({ imports: [GrainOverlay] }).compileComponents();
    const fixture = TestBed.createComponent(GrainOverlay);
    fixture.detectChanges();
    const root = fixture.nativeElement.firstElementChild as HTMLElement;

    expect(root).not.toBeNull();
    expect(root.getAttribute('aria-hidden')).toBe('true');
    expect(root.classList.contains('grain-overlay')).toBe(true);
  });

  it('embeds an SVG turbulence filter', async () => {
    await TestBed.configureTestingModule({ imports: [GrainOverlay] }).compileComponents();
    const fixture = TestBed.createComponent(GrainOverlay);
    fixture.detectChanges();
    const turbulence = fixture.nativeElement.querySelector('svg feTurbulence');
    expect(turbulence).not.toBeNull();
  });
});
