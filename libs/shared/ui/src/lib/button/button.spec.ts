import { TestBed } from '@angular/core/testing';
import { Button } from './button';

describe('Button', () => {
  it('creates with default variant', async () => {
    await TestBed.configureTestingModule({ imports: [Button] }).compileComponents();
    const fixture = TestBed.createComponent(Button);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn).toBeTruthy();
    expect(btn.type).toBe('button');
  });
});
