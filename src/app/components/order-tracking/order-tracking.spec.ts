import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderTrackingComponent } from './order-tracking';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../services/auth';
import { OrderService } from '../../services/order';

describe('OrderTrackingComponent', () => {
  let component: OrderTrackingComponent;
  let fixture: ComponentFixture<OrderTrackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderTrackingComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        AuthService,
        OrderService
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

