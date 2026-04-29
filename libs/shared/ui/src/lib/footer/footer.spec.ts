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

  it('emits replayIntroTriggered when the ~$ replay-intro target is clicked', async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();

    let fired = false;
    fixture.componentInstance.replayIntroTriggered.subscribe(() => (fired = true));

    const target = fixture.nativeElement.querySelector(
      '[data-testid="footer-replay-intro"]',
    ) as HTMLButtonElement;
    expect(target).toBeTruthy();
    target.click();
    expect(fired).toBe(true);
  });
});
