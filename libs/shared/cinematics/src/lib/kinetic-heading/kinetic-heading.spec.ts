import { TestBed } from '@angular/core/testing';
import { KineticHeading } from './kinetic-heading';

describe('KineticHeading', () => {
  it('renders the text split into per-character spans', async () => {
    await TestBed.configureTestingModule({ imports: [KineticHeading] }).compileComponents();
    const fixture = TestBed.createComponent(KineticHeading);
    fixture.componentRef.setInput('text', 'hello');
    fixture.detectChanges();

    const chars = fixture.nativeElement.querySelectorAll('.kinetic-heading__char');
    expect(chars.length).toBe(5);
    expect(chars[0].textContent).toBe('h');
    expect(chars[4].textContent).toBe('o');
  });

  it('exposes aria-label so screen readers see the full text', async () => {
    await TestBed.configureTestingModule({ imports: [KineticHeading] }).compileComponents();
    const fixture = TestBed.createComponent(KineticHeading);
    fixture.componentRef.setInput('text', 'rahul.dev');
    fixture.detectChanges();

    const root = fixture.nativeElement.firstElementChild as HTMLElement;
    expect(root.getAttribute('aria-label')).toBe('rahul.dev');
  });
});
