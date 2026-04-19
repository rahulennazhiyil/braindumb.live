import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeroGraph } from './hero-graph';

describe('HeroGraph', () => {
  let component: HeroGraph;
  let fixture: ComponentFixture<HeroGraph>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroGraph],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroGraph);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
