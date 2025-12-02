import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductCarousal } from './product-carousal';

describe('ProductCarousal', () => {
  let component: ProductCarousal;
  let fixture: ComponentFixture<ProductCarousal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCarousal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductCarousal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
