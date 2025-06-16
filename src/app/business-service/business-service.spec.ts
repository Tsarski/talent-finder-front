import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessService } from './business-service';

describe('BusinessService', () => {
  let component: BusinessService;
  let fixture: ComponentFixture<BusinessService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
