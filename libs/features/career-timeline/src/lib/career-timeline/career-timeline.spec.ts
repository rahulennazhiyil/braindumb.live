import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CareerTimeline } from './career-timeline';

describe('CareerTimeline', () => {
  let component: CareerTimeline;
  let fixture: ComponentFixture<CareerTimeline>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CareerTimeline],
    }).compileComponents();

    fixture = TestBed.createComponent(CareerTimeline);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
