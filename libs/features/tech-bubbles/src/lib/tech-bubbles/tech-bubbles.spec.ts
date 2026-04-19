import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TechBubbles } from './tech-bubbles';

describe('TechBubbles', () => {
  let component: TechBubbles;
  let fixture: ComponentFixture<TechBubbles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechBubbles],
    }).compileComponents();

    fixture = TestBed.createComponent(TechBubbles);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
