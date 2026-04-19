import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VisitorInsights } from './visitor-insights';

describe('VisitorInsights', () => {
  let component: VisitorInsights;
  let fixture: ComponentFixture<VisitorInsights>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitorInsights],
    }).compileComponents();

    fixture = TestBed.createComponent(VisitorInsights);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
