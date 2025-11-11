import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { OrderService } from '../../services/order';
import { AuthService } from '../../services/auth';
import { Order } from '../../models/order';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './order-tracking.html',
  styleUrls: ['./order-tracking.css'],
  encapsulation: ViewEncapsulation.None
})
export class OrderTrackingComponent implements OnInit {
  userOrders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedOrder: Order | null = null;
  userName = '';
  searchTerm = '';
  filterStatus = 'all';

  statusOptions = ['all', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Completed', 'Cancelled'];

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.userName = currentUser.name || currentUser.email;
    this.loadOrders();
  }

  loadOrders(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.orderService.getOrders().subscribe(orders => {
      // Filter orders for current user and sort by date (newest first)
      this.userOrders = orders
        .filter(order => order.userId === currentUser.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      this.applyFilters();
    });
  }

  applyFilters(): void {
    this.filteredOrders = this.userOrders.filter(order => {
      const matchesSearch = !this.searchTerm || 
        order.orderNumber?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.items.some(item => item.product.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesStatus = this.filterStatus === 'all' || order.status === this.filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
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

  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'Pending': '⏳',
      'Processing': '📦',
      'Shipped': '🚚',
      'Delivered': '✅',
      'Completed': '✅',
      'Cancelled': '❌'
    };
    return iconMap[status] || '⏳';
  }

  getTrackingProgress(status: string): number {
    const progressMap: { [key: string]: number } = {
      'Pending': 25,
      'Processing': 50,
      'Shipped': 75,
      'Delivered': 100,
      'Completed': 100,
      'Cancelled': 0
    };
    return progressMap[status] || 0;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goBack(): void {
    this.router.navigate(['/customer-products']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

