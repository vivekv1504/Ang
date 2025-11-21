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

interface TopProduct {
  product: Product;
  sold: number;
  revenue: number;
  orders: number;
}

interface TimePeriodStats {
  period: string;
  revenue: number;
  orders: number;
  topProduct: string;
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

  // Time-based analysis
  selectedTimePeriod: 'week' | 'month' | 'year' = 'month';
  topProductsThisWeek: TopProduct[] = [];
  topProductsThisMonth: TopProduct[] = [];
  topProductsThisYear: TopProduct[] = [];
  
  weeklyStats: TimePeriodStats[] = [];
  monthlyStats: TimePeriodStats[] = [];
  yearlyStats: TimePeriodStats[] = [];

  currentWeekRevenue = 0;
  currentMonthRevenue = 0;
  currentYearRevenue = 0;

  userName = '';
  Math = Math; // Expose Math to template
  allOrders: Order[] = [];
  allProducts: Product[] = [];

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
        this.allOrders = orders;
        this.productService.getProducts().subscribe({
          next: (products) => {
            console.log('Products loaded:', products.length);
            this.allProducts = products;
            if (orders && products) {
              this.calculateStats(orders, products);
              this.calculateCategoryData(orders);
              this.calculateTopProducts(orders, products);
              this.prepareRecentOrders(orders);
              this.calculateMonthlyRevenue(orders);
              
              // Calculate time-based analytics
              this.calculateTimePeriodAnalytics(orders, products);
              
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

  // ============ TIME-BASED ANALYTICS ============

  calculateTimePeriodAnalytics(orders: Order[], products: Product[]): void {
    this.calculateTopProductsByWeek(orders, products);
    this.calculateTopProductsByMonth(orders, products);
    this.calculateTopProductsByYear(orders, products);
    this.calculateWeeklyComparison(orders);
    this.calculateMonthlyComparison(orders);
    this.calculateYearlyComparison(orders);
  }

  calculateTopProductsByWeek(orders: Order[], products: Product[]): void {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);

    const weekOrders = orders.filter(o => new Date(o.date) >= startOfWeek);
    this.currentWeekRevenue = weekOrders.reduce((sum, o) => sum + o.total, 0);

    this.topProductsThisWeek = this.calculateTopProductsForPeriod(weekOrders, products);
  }

  calculateTopProductsByMonth(orders: Order[], products: Product[]): void {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthOrders = orders.filter(o => new Date(o.date) >= startOfMonth);
    this.currentMonthRevenue = monthOrders.reduce((sum, o) => sum + o.total, 0);

    this.topProductsThisMonth = this.calculateTopProductsForPeriod(monthOrders, products);
  }

  calculateTopProductsByYear(orders: Order[], products: Product[]): void {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const yearOrders = orders.filter(o => new Date(o.date) >= startOfYear);
    this.currentYearRevenue = yearOrders.reduce((sum, o) => sum + o.total, 0);

    this.topProductsThisYear = this.calculateTopProductsForPeriod(yearOrders, products);
  }

  private calculateTopProductsForPeriod(orders: Order[], products: Product[]): TopProduct[] {
    const productSales = new Map<number, { sold: number; revenue: number; orders: Set<number> }>();

    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product.id;
        if (!productSales.has(productId)) {
          productSales.set(productId, { sold: 0, revenue: 0, orders: new Set() });
        }
        const sales = productSales.get(productId)!;
        sales.sold += item.quantity;
        sales.revenue += item.product.price * item.quantity;
        sales.orders.add(order.id);
      });
    });

    return Array.from(productSales.entries())
      .map(([productId, sales]) => {
        const product = products.find(p => p.id === productId);
        return product ? {
          product,
          sold: sales.sold,
          revenue: sales.revenue,
          orders: sales.orders.size
        } : null;
      })
      .filter((item): item is TopProduct => item !== null)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  calculateWeeklyComparison(orders: Order[]): void {
    const now = new Date();
    this.weeklyStats = [];

    // Get last 8 weeks for comparison
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekOrders = orders.filter(o => {
        const orderDate = new Date(o.date);
        return orderDate >= weekStart && orderDate <= weekEnd;
      });

      const revenue = weekOrders.reduce((sum, o) => sum + o.total, 0);
      const topProduct = this.getTopProductForOrders(weekOrders);

      this.weeklyStats.push({
        period: `Week ${this.getWeekNumber(weekStart)}`,
        revenue,
        orders: weekOrders.length,
        topProduct: topProduct?.name || 'N/A'
      });
    }
  }

  calculateMonthlyComparison(orders: Order[]): void {
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    this.monthlyStats = [];

    // Get last 12 months
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

      const monthOrders = orders.filter(o => {
        const orderDate = new Date(o.date);
        return orderDate >= monthStart && orderDate <= monthEnd;
      });

      const revenue = monthOrders.reduce((sum, o) => sum + o.total, 0);
      const topProduct = this.getTopProductForOrders(monthOrders);

      this.monthlyStats.push({
        period: `${months[monthDate.getMonth()]} ${monthDate.getFullYear()}`,
        revenue,
        orders: monthOrders.length,
        topProduct: topProduct?.name || 'N/A'
      });
    }
  }

  calculateYearlyComparison(orders: Order[]): void {
    const now = new Date();
    this.yearlyStats = [];

    // Get last 5 years
    for (let i = 4; i >= 0; i--) {
      const year = now.getFullYear() - i;
      const yearStart = new Date(year, 0, 1);
      const yearEnd = new Date(year, 11, 31);

      const yearOrders = orders.filter(o => {
        const orderDate = new Date(o.date);
        return orderDate >= yearStart && orderDate <= yearEnd;
      });

      const revenue = yearOrders.reduce((sum, o) => sum + o.total, 0);
      const topProduct = this.getTopProductForOrders(yearOrders);

      this.yearlyStats.push({
        period: year.toString(),
        revenue,
        orders: yearOrders.length,
        topProduct: topProduct?.name || 'N/A'
      });
    }
  }

  private getTopProductForOrders(orders: Order[]): Product | null {
    if (orders.length === 0) return null;

    const productSales = new Map<number, number>();
    orders.forEach(order => {
      order.items.forEach(item => {
        const currentSales = productSales.get(item.product.id) || 0;
        productSales.set(item.product.id, currentSales + item.quantity);
      });
    });

    if (productSales.size === 0) return null;

    const topProductId = Array.from(productSales.entries())
      .sort((a, b) => b[1] - a[1])[0][0];

    return this.allProducts.find(p => p.id === topProductId) || null;
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  // UI Methods
  selectTimePeriod(period: 'week' | 'month' | 'year'): void {
    this.selectedTimePeriod = period;
  }

  getCurrentTopProducts(): TopProduct[] {
    switch (this.selectedTimePeriod) {
      case 'week':
        return this.topProductsThisWeek;
      case 'month':
        return this.topProductsThisMonth;
      case 'year':
        return this.topProductsThisYear;
      default:
        return this.topProductsThisMonth;
    }
  }

  getCurrentRevenue(): number {
    switch (this.selectedTimePeriod) {
      case 'week':
        return this.currentWeekRevenue;
      case 'month':
        return this.currentMonthRevenue;
      case 'year':
        return this.currentYearRevenue;
      default:
        return this.currentMonthRevenue;
    }
  }

  getCurrentPeriodStats(): TimePeriodStats[] {
    switch (this.selectedTimePeriod) {
      case 'week':
        return this.weeklyStats;
      case 'month':
        return this.monthlyStats;
      case 'year':
        return this.yearlyStats;
      default:
        return this.monthlyStats;
    }
  }

  getPeriodLabel(): string {
    switch (this.selectedTimePeriod) {
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'year':
        return 'This Year';
      default:
        return 'This Month';
    }
  }

  getRevenueBarWidthForProduct(revenue: number): number {
    const currentProducts = this.getCurrentTopProducts();
    if (currentProducts.length === 0) return 0;
    const maxRevenue = Math.max(...currentProducts.map(p => p.revenue));
    return maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
  }

  getComparisonBarHeight(revenue: number): number {
    const stats = this.getCurrentPeriodStats();
    if (stats.length === 0) return 0;
    const maxRevenue = Math.max(...stats.map(s => s.revenue));
    return maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
  }
}

