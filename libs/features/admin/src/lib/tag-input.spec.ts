import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { TagInput } from './tag-input';

describe('TagInput', () => {
  it('renders existing tags', async () => {
    await TestBed.configureTestingModule({ imports: [TagInput] }).compileComponents();
    const fixture = TestBed.createComponent(TagInput);
    fixture.componentRef.setInput('tags', ['angular', 'd3']);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('angular');
    expect(fixture.nativeElement.textContent).toContain('d3');
  });
});
