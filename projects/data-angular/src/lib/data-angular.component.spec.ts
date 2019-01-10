import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataAngularComponent } from './data-angular.component';

describe('DataAngularComponent', () => {
  let component: DataAngularComponent;
  let fixture: ComponentFixture<DataAngularComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataAngularComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataAngularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
