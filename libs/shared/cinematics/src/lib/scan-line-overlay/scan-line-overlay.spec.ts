import { TestBed } from '@angular/core/testing';
import { ScanLineOverlay } from './scan-line-overlay';

describe('ScanLineOverlay', () => {
  it('renders an aria-hidden full-viewport scan-line layer', async () => {
    await TestBed.configureTestingModule({ imports: [ScanLineOverlay] }).compileComponents();
    const fixture = TestBed.createComponent(ScanLineOverlay);
    fixture.detectChanges();
    const root = fixture.nativeElement.firstElementChild as HTMLElement;

    expect(root).not.toBeNull();
    expect(root.getAttribute('aria-hidden')).toBe('true');
    expect(root.classList.contains('scan-line-overlay')).toBe(true);
  });
});
