import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderScheduler } from './work-order-scheduler';

describe('WorkOrder', () => {
  let component: WorkOrderScheduler;
  let fixture: ComponentFixture<WorkOrderScheduler>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkOrderScheduler]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkOrderScheduler);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
