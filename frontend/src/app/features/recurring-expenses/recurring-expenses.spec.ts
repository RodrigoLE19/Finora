import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringExpenses } from './recurring-expenses';

describe('RecurringExpenses', () => {
  let component: RecurringExpenses;
  let fixture: ComponentFixture<RecurringExpenses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecurringExpenses],
    }).compileComponents();

    fixture = TestBed.createComponent(RecurringExpenses);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
