import { TestBed } from '@angular/core/testing';
import { TagChip } from './tag-chip';

describe('TagChip', () => {
  it('creates', async () => {
    await TestBed.configureTestingModule({ imports: [TagChip] }).compileComponents();
    const fixture = TestBed.createComponent(TagChip);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('span')).toBeTruthy();
  });
});
