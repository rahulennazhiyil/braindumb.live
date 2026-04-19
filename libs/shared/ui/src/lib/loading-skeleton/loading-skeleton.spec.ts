import { TestBed } from '@angular/core/testing';
import { LoadingSkeleton } from './loading-skeleton';

describe('LoadingSkeleton', () => {
  it('renders requested number of lines', async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSkeleton],
    }).compileComponents();
    const fixture = TestBed.createComponent(LoadingSkeleton);
    fixture.componentRef.setInput('lines', 3);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.skeleton-bar').length).toBe(3);
  });
});
