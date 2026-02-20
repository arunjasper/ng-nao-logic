import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkOrderForm } from './work-order-form';

describe('WorkOrderForm', () => {
  let component: WorkOrderForm;
  let fixture: ComponentFixture<WorkOrderForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkOrderForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkOrderForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
