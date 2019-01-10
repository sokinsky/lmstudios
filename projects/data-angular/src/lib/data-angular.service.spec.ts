import { TestBed } from '@angular/core/testing';

import { DataAngularService } from './data-angular.service';

describe('DataAngularService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DataAngularService = TestBed.get(DataAngularService);
    expect(service).toBeTruthy();
  });
});
