import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DecryptText } from './decrypt-text.directive';

@Component({
  selector: 'app-decrypt-host',
  imports: [DecryptText],
  template: `<span [appDecryptText]="'rahul.dev'" [autoplay]="false">placeholder</span>`,
})
class HostCmp {}

describe('DecryptText', () => {
  it('renders the final text by default for SSR / reduced motion fallback', async () => {
    await TestBed.configureTestingModule({ imports: [HostCmp] }).compileComponents();
    const fixture = TestBed.createComponent(HostCmp);
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector('span') as HTMLElement;
    expect(span.textContent).toBe('rahul.dev');
  });

  it('sets aria-label to the final text so screen readers see one stable string', async () => {
    await TestBed.configureTestingModule({ imports: [HostCmp] }).compileComponents();
    const fixture = TestBed.createComponent(HostCmp);
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector('span') as HTMLElement;
    expect(span.getAttribute('aria-label')).toBe('rahul.dev');
  });
});
