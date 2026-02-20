import { TestBed } from '@angular/core/testing';

import { WorkOrderTimelineStateService } from './work-order-timeline-state.service';

describe('WorkOrderTimelineStateService', () => {
  let service: WorkOrderTimelineStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkOrderTimelineStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
