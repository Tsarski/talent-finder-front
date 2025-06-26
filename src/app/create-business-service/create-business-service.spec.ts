import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBusinessService } from './create-business-service';

describe('CreateBusinessService', () => {
  let component: CreateBusinessService;
  let fixture: ComponentFixture<CreateBusinessService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateBusinessService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateBusinessService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
