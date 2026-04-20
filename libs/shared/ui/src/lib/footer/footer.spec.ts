import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Footer } from './footer';

describe('Footer', () => {
  it('renders current year by default', async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(
      new Date().getFullYear().toString(),
    );
  });
});
