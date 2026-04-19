import { TestBed } from '@angular/core/testing';
import { SectionHeading } from './section-heading';

describe('SectionHeading', () => {
  it('renders title', async () => {
    await TestBed.configureTestingModule({
      imports: [SectionHeading],
    }).compileComponents();
    const fixture = TestBed.createComponent(SectionHeading);
    fixture.componentRef.setInput('title', 'Projects');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h2').textContent).toContain(
      'Projects',
    );
  });
});
