import { TestBed } from '@angular/core/testing';
import { Footer } from './footer';

describe('Footer', () => {
  it('renders current year by default', async () => {
    await TestBed.configureTestingModule({ imports: [Footer] }).compileComponents();
    const fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(
      new Date().getFullYear().toString(),
    );
  });
});
