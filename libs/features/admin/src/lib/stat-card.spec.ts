import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { StatCard } from './stat-card';

describe('StatCard', () => {
  it('renders label + value', async () => {
    await TestBed.configureTestingModule({ imports: [StatCard] }).compileComponents();
    const fixture = TestBed.createComponent(StatCard);
    fixture.componentRef.setInput('label', 'Projects');
    fixture.componentRef.setInput('value', 7);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Projects');
    expect(fixture.nativeElement.textContent).toContain('7');
  });

  it('shows ellipsis when loading', async () => {
    await TestBed.configureTestingModule({ imports: [StatCard] }).compileComponents();
    const fixture = TestBed.createComponent(StatCard);
    fixture.componentRef.setInput('label', 'Loading');
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('…');
  });
});
