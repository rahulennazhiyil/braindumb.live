import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProjectCard } from './project-card';

describe('ProjectCard', () => {
  it('renders title and description', async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectCard],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(ProjectCard);
    fixture.componentRef.setInput('title', 'SCRAII');
    fixture.componentRef.setInput('description', 'Angular + D3 analytics.');
    fixture.componentRef.setInput('techTags', ['Angular', 'D3.js']);
    fixture.detectChanges();
    const html: string = fixture.nativeElement.textContent;
    expect(html).toContain('SCRAII');
    expect(html).toContain('Angular + D3 analytics');
  });
});
