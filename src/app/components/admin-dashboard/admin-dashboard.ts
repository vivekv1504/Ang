import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product';
import { AuthService } from '../../services/auth';
import { Product } from '../../models/product';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
  encapsulation: ViewEncapsulation.None
})
export class AdminDashboardComponent implements OnInit {
  products: Product[] = [];
  showModal: boolean = false;
  isEditMode: boolean = false;
  currentProduct: Product = this.getEmptyProduct();
  searchTerm: string = '';
  userName: string = '';

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userName = user?.name || 'Admin';
    
    this.productService.getProducts().subscribe(products => {
      this.products = products;
    });
  }

  get filteredProducts(): Product[] {
    if (!this.searchTerm) {
      return this.products;
    }
    const term = this.searchTerm.toLowerCase();
    return this.products.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    );
  }

  getEmptyProduct(): Product {
    return {
      id: 0,
      name: '',
      category: '',
      price: 0,
      description: '',
      stock: 0,
      image: ''
    };
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.currentProduct = this.getEmptyProduct();
    this.showModal = true;
  }

  openEditModal(product: Product): void {
    this.isEditMode = true;
    this.currentProduct = { ...product };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentProduct = this.getEmptyProduct();
  }

  saveProduct(): void {
    if (this.isEditMode) {
      this.productService.updateProduct(this.currentProduct).subscribe(() => {
        this.closeModal();
      });
    } else {
      this.productService.addProduct(this.currentProduct).subscribe(() => {
        this.closeModal();
      });
    }
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onImageError(event: any): void {
    // Fallback image if the original fails to load
    event.target.src = 'https://via.placeholder.com/60x60/667eea/ffffff?text=No+Image';
  }
}
