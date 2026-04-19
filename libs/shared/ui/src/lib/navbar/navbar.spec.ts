import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Navbar } from './navbar';

describe('Navbar', () => {
  it('renders nav links', async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(Navbar);
    fixture.componentRef.setInput('links', [
      { label: 'About', href: '/about' },
      { label: 'Projects', href: '/projects' },
    ]);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('ul li');
    expect(items.length).toBeGreaterThanOrEqual(2);
  });
});
