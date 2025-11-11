import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { OrderService } from '../../services/order';
import { ProductService } from '../../services/product';
import { AuthService } from '../../services/auth';
import { Order } from '../../models/order';
import { Product } from '../../models/product';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

interface CategoryData {
  category: string;
  revenue: number;
  orders: number;
}

interface RecentOrder {
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  date: string;
}

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './analytics-dashboard.html',
  styleUrls: ['./analytics-dashboard.css'],
  encapsulation: ViewEncapsulation.None
})
export class AnalyticsDashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    averageOrderValue: 0,
    revenueGrowth: 0,
    ordersGrowth: 0
  };

  categoryData: CategoryData[] = [];
  topProducts: { product: Product; sold: number; revenue: number }[] = [];
  recentOrders: RecentOrder[] = [];
  monthlyRevenue: { month: string; revenue: number }[] = [];

  userName = '';
  Math = Math; // Expose Math to template

  constructor(
    private orderService: OrderService,
    private productService: ProductService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('Analytics Dashboard - ngOnInit called');
    const currentUser = this.authService.getCurrentUser();
    console.log('Current user:', currentUser);
    
    if (!currentUser || currentUser.role !== 'owner') {
      console.log('User not authorized for analytics, redirecting...');
      this.router.navigate(['/login']);
      return;
    }

    this.userName = currentUser.name || currentUser.email;
    console.log('Loading analytics...');
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    console.log('loadAnalytics called');
    // Load orders and products
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        console.log('Orders loaded:', orders.length);
        this.productService.getProducts().subscribe({
          next: (products) => {
            console.log('Products loaded:', products.length);
            if (orders && products) {
              this.calculateStats(orders, products);
              this.calculateCategoryData(orders);
              this.calculateTopProducts(orders, products);
              this.prepareRecentOrders(orders);
              this.calculateMonthlyRevenue(orders);
              console.log('Analytics calculated successfully');
            }
          },
          error: (error) => {
            console.error('Error loading products:', error);
          }
        });
      },
      error: (error) => {
        console.error('Error loading orders:', error);
      }
    });
  }

  calculateStats(orders: Order[], products: Product[]): void {
    const completedOrders = orders.filter(o => o.status === 'Completed' || o.status === 'Delivered');
    
    this.stats.totalOrders = orders.length;
    this.stats.totalProducts = products.length;
    this.stats.totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
    this.stats.averageOrderValue = this.stats.totalOrders > 0 
      ? this.stats.totalRevenue / completedOrders.length 
      : 0;

    // Calculate growth (comparing last 30 days vs previous 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentOrders = orders.filter(o => new Date(o.date) >= thirtyDaysAgo);
    const previousOrders = orders.filter(o => 
      new Date(o.date) >= sixtyDaysAgo && new Date(o.date) < thirtyDaysAgo
    );

    const recentRevenue = recentOrders.reduce((sum, o) => sum + o.total, 0);
    const previousRevenue = previousOrders.reduce((sum, o) => sum + o.total, 0);

    this.stats.revenueGrowth = previousRevenue > 0 
      ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;
    this.stats.ordersGrowth = previousOrders.length > 0 
      ? ((recentOrders.length - previousOrders.length) / previousOrders.length) * 100 
      : 0;
  }

  calculateCategoryData(orders: Order[]): void {
    const categoryMap = new Map<string, { revenue: number; orders: Set<string> }>();

    orders.forEach(order => {
      order.items.forEach(item => {
        const category = item.product.category;
        if (!categoryMap.has(category)) {
          categoryMap.set(category, { revenue: 0, orders: new Set() });
        }
        const data = categoryMap.get(category)!;
        data.revenue += item.product.price * item.quantity;
        data.orders.add(order.id.toString());
      });
    });

    this.categoryData = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        revenue: data.revenue,
        orders: data.orders.size
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  calculateTopProducts(orders: Order[], products: Product[]): void {
    const productSales = new Map<number, { sold: number; revenue: number }>();

    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product.id;
        if (!productSales.has(productId)) {
          productSales.set(productId, { sold: 0, revenue: 0 });
        }
        const sales = productSales.get(productId)!;
        sales.sold += item.quantity;
        sales.revenue += item.product.price * item.quantity;
      });
    });

    this.topProducts = Array.from(productSales.entries())
      .map(([productId, sales]) => {
        const product = products.find(p => p.id === productId);
        return product ? { product, ...sales } : null;
      })
      .filter((item): item is { product: Product; sold: number; revenue: number } => item !== null)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }

  prepareRecentOrders(orders: Order[]): void {
    this.recentOrders = orders
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
      .map(order => ({
        orderNumber: order.orderNumber || `#${order.id}`,
        customerName: order.shippingInfo?.fullName || 'N/A',
        total: order.total,
        status: order.status,
        date: order.date
      }));
  }

  calculateMonthlyRevenue(orders: Order[]): void {
    const monthlyMap = new Map<string, number>();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Get last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
      monthlyMap.set(key, 0);
    }

    orders.forEach(order => {
      const date = new Date(order.date);
      const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
      if (monthlyMap.has(key)) {
        monthlyMap.set(key, (monthlyMap.get(key) || 0) + order.total);
      }
    });

    this.monthlyRevenue = Array.from(monthlyMap.entries()).map(([month, revenue]) => ({
      month,
      revenue
    }));
  }

  getRevenueBarWidth(revenue: number): number {
    if (this.categoryData.length === 0) return 0;
    const maxRevenue = Math.max(...this.categoryData.map(c => c.revenue));
    return (revenue / maxRevenue) * 100;
  }

  getMonthlyBarHeight(revenue: number): number {
    if (this.monthlyRevenue.length === 0) return 0;
    const maxRevenue = Math.max(...this.monthlyRevenue.map(m => m.revenue));
    return (revenue / maxRevenue) * 100;
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Pending': 'status-pending',
      'Processing': 'status-processing',
      'Shipped': 'status-shipped',
      'Delivered': 'status-delivered',
      'Completed': 'status-completed',
      'Cancelled': 'status-cancelled'
    };
    return statusMap[status] || 'status-pending';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goToProductManagement(): void {
    this.router.navigate(['/admin-dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

