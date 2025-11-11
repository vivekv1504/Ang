import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnalyticsDashboardComponent } from './analytics-dashboard';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../services/auth';
import { OrderService } from '../../services/order';
import { ProductService } from '../../services/product';

describe('AnalyticsDashboardComponent', () => {
  let component: AnalyticsDashboardComponent;
  let fixture: ComponentFixture<AnalyticsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsDashboardComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        AuthService,
        OrderService,
        ProductService
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalyticsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

