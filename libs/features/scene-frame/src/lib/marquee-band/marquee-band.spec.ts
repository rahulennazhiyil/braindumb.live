import { TestBed } from '@angular/core/testing';
import { MarqueeBand } from './marquee-band';

describe('MarqueeBand', () => {
  it('renders the label content as ASCII strip', async () => {
    await TestBed.configureTestingModule({ imports: [MarqueeBand] }).compileComponents();
    const fixture = TestBed.createComponent(MarqueeBand);
    fixture.componentRef.setInput('label', 'SCENE 02 / projects');
    fixture.detectChanges();

    const root = fixture.nativeElement.firstElementChild as HTMLElement;
    expect(root.classList.contains('marquee-band')).toBe(true);
    expect(root.getAttribute('aria-hidden')).toBe('true');
    expect(root.textContent).toContain('SCENE 02 / projects');
  });

  it('repeats the label so the strip stays full-width', async () => {
    await TestBed.configureTestingModule({ imports: [MarqueeBand] }).compileComponents();
    const fixture = TestBed.createComponent(MarqueeBand);
    fixture.componentRef.setInput('label', 'X');
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.marquee-band__item');
    expect(items.length).toBeGreaterThan(1);
  });
});
