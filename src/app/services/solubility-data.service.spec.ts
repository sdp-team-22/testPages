import { TestBed } from '@angular/core/testing';

import { SolubilityDataService } from './solubility-data.service';

describe('SolubilityDataService', () => {
  let service: SolubilityDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SolubilityDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});


