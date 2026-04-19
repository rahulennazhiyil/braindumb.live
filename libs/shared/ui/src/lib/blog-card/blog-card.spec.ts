import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BlogCard } from './blog-card';

describe('BlogCard', () => {
  it('renders title, excerpt, and formatted date', async () => {
    await TestBed.configureTestingModule({
      imports: [BlogCard],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(BlogCard);
    fixture.componentRef.setInput('title', 'RxJS streams');
    fixture.componentRef.setInput('excerpt', 'Hot observable patterns.');
    fixture.componentRef.setInput('publishedAt', new Date('2026-04-01'));
    fixture.detectChanges();
    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('RxJS streams');
    expect(text).toContain('Apr 1, 2026');
  });
});
