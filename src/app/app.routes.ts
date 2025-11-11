import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { SignupComponent } from './components/signup/signup';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard';
import { CustomerProductsComponent } from './components/customer-products/customer-products';
import { CartComponent } from './components/cart/cart';
import { CheckoutComponent } from './components/checkout/checkout';
import { ProfileComponent } from './components/profile/profile';
import { OrderTrackingComponent } from './components/order-tracking/order-tracking';
import { AnalyticsDashboardComponent } from './components/analytics-dashboard/analytics-dashboard';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { 
    path: 'admin-dashboard', 
    component: AdminDashboardComponent,
    canActivate: [authGuard],
    data: { role: 'owner' }
  },
  { 
    path: 'customer-products', 
    component: CustomerProductsComponent,
    canActivate: [authGuard],
    data: { role: 'customer' }
  },
  { 
    path: 'cart', 
    component: CartComponent,
    canActivate: [authGuard],
    data: { role: 'customer' }
  },
  { 
    path: 'checkout', 
    component: CheckoutComponent,
    canActivate: [authGuard],
    data: { role: 'customer' }
  },
  { 
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'order-tracking', 
    component: OrderTrackingComponent,
    canActivate: [authGuard],
    data: { role: 'customer' }
  },
  { 
    path: 'analytics', 
    component: AnalyticsDashboardComponent,
    canActivate: [authGuard],
    data: { role: 'owner' }
  },
  { path: '**', redirectTo: '/login' }
];
