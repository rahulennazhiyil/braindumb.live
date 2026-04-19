import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FinanceAnalyzer } from './finance-analyzer';

describe('FinanceAnalyzer', () => {
  let component: FinanceAnalyzer;
  let fixture: ComponentFixture<FinanceAnalyzer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinanceAnalyzer],
    }).compileComponents();

    fixture = TestBed.createComponent(FinanceAnalyzer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
