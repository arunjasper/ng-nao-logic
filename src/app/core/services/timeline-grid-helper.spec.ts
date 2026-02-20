import { TestBed } from '@angular/core/testing';

import { TimelineGridHelper } from './timeline-grid-helper';

describe('TimelineGridHelper', () => {
  let service: TimelineGridHelper;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimelineGridHelper);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
