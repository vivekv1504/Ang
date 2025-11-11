import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Product } from '../models/product';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/api/products`;
  private productsUrl = 'assets/products.json';
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();
  private readonly STORAGE_KEY = 'sipstop_products';
  private useBackend = true; // Set to false to use localStorage only

  constructor(private http: HttpClient) {
    this.loadProducts();
  }

  private loadProducts(): void {
    // Try to load from backend API first
    this.http.get<Product[]>(this.apiUrl).pipe(
      catchError(() => {
        console.log('⚠️ Backend not available, using localStorage fallback');
        this.useBackend = false;
        // Fallback to localStorage
        const localProducts = this.getFromLocalStorage();
        if (localProducts && localProducts.length > 0) {
          return of(localProducts);
        }
        // Final fallback to JSON file
        return this.http.get<Product[]>(this.productsUrl).pipe(
          catchError(() => of([]))
        );
      })
    ).subscribe(products => {
      console.log('✅ Loading products:', products.length);
      this.saveToLocalStorage(products);
      this.productsSubject.next(products);
    });
  }

  private getFromLocalStorage(): Product[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveToLocalStorage(products: Product[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(products));
  }

  getProducts(): Observable<Product[]> {
    return this.products$;
  }

  getProductById(id: number): Observable<Product | undefined> {
    return this.products$.pipe(
      map(products => products.find(p => p.id === id))
    );
  }

  addProduct(product: Product): Observable<boolean> {
    if (this.useBackend) {
      // Use backend API
      return this.http.post<any>(this.apiUrl, product).pipe(
        map(response => {
          console.log('✅ Product added to JSON file:', response.product);
          // Reload products from backend
          this.loadProducts();
          return true;
        }),
        catchError(error => {
          console.error('❌ Failed to add product to backend:', error);
          // Fallback to localStorage
          return this.addProductLocally(product);
        })
      );
    } else {
      return this.addProductLocally(product);
    }
  }

  private addProductLocally(product: Product): Observable<boolean> {
    const currentProducts = this.productsSubject.value;
    const newId = currentProducts.length > 0 
      ? Math.max(...currentProducts.map(p => p.id)) + 1 
      : 1;
    
    const newProduct = { ...product, id: newId };
    const updatedProducts = [...currentProducts, newProduct];
    
    this.saveToLocalStorage(updatedProducts);
    this.productsSubject.next(updatedProducts);
    
    console.log('✅ Product added to localStorage:', newProduct);
    return of(true);
  }

  updateProduct(product: Product): Observable<boolean> {
    if (this.useBackend) {
      // Use backend API
      return this.http.put<any>(`${this.apiUrl}/${product.id}`, product).pipe(
        map(response => {
          console.log('✅ Product updated in JSON file:', response.product);
          // Reload products from backend
          this.loadProducts();
          return true;
        }),
        catchError(error => {
          console.error('❌ Failed to update product in backend:', error);
          // Fallback to localStorage
          return this.updateProductLocally(product);
        })
      );
    } else {
      return this.updateProductLocally(product);
    }
  }

  private updateProductLocally(product: Product): Observable<boolean> {
    const currentProducts = this.productsSubject.value;
    const index = currentProducts.findIndex(p => p.id === product.id);
    
    if (index !== -1) {
      currentProducts[index] = product;
      const updatedProducts = [...currentProducts];
      
      this.saveToLocalStorage(updatedProducts);
      this.productsSubject.next(updatedProducts);
      
      console.log('✅ Product updated in localStorage:', product);
      return of(true);
    }
    
    return of(false);
  }

  deleteProduct(id: number): Observable<boolean> {
    if (this.useBackend) {
      // Use backend API
      return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
        map(response => {
          console.log('✅ Product deleted from JSON file:', id);
          // Reload products from backend
          this.loadProducts();
          return true;
        }),
        catchError(error => {
          console.error('❌ Failed to delete product from backend:', error);
          // Fallback to localStorage
          return this.deleteProductLocally(id);
        })
      );
    } else {
      return this.deleteProductLocally(id);
    }
  }

  private deleteProductLocally(id: number): Observable<boolean> {
    const currentProducts = this.productsSubject.value;
    const updatedProducts = currentProducts.filter(p => p.id !== id);
    
    this.saveToLocalStorage(updatedProducts);
    this.productsSubject.next(updatedProducts);
    
    console.log('✅ Product deleted from localStorage:', id);
    return of(true);
  }

  // Update stock for a product
  updateStock(productId: number, quantityChange: number): Observable<boolean> {
    console.log(`📦 Updating stock for product ${productId}, change: ${quantityChange}`);
    
    const currentProducts = this.productsSubject.value;
    const product = currentProducts.find(p => p.id === productId);
    
    if (!product) {
      console.error('❌ Product not found:', productId);
      return of(false);
    }
    
    // Calculate new stock
    const newStock = product.stock + quantityChange;
    
    if (newStock < 0) {
      console.error('❌ Insufficient stock for product:', product.name);
      return of(false);
    }
    
    // Update product with new stock
    const updatedProduct = { ...product, stock: newStock };
    return this.updateProduct(updatedProduct);
  }

  // Reduce stock for multiple products (used when placing order)
  reduceStockForOrder(items: Array<{ productId: number, quantity: number }>): Observable<boolean> {
    console.log('📦 Reducing stock for order items:', items);
    
    const currentProducts = this.productsSubject.value;
    let updatedProducts = [...currentProducts];
    let allUpdatesSuccessful = true;
    
    // Update stock for each item
    for (const item of items) {
      const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
      
      if (productIndex !== -1) {
        const newStock = updatedProducts[productIndex].stock - item.quantity;
        
        if (newStock < 0) {
          console.error(`❌ Insufficient stock for product: ${updatedProducts[productIndex].name}`);
          allUpdatesSuccessful = false;
          continue;
        }
        
        updatedProducts[productIndex] = {
          ...updatedProducts[productIndex],
          stock: newStock
        };
        
        console.log(`✅ Reduced stock for ${updatedProducts[productIndex].name}: ${updatedProducts[productIndex].stock + item.quantity} → ${newStock}`);
      }
    }
    
    if (!allUpdatesSuccessful) {
      return of(false);
    }
    
    // Save updated products
    if (this.useBackend) {
      // Update each product via backend
      const updatePromises = items.map(item => {
        const product = updatedProducts.find(p => p.id === item.productId);
        if (product) {
          return this.updateProduct(product).toPromise();
        }
        return Promise.resolve(false);
      });
      
      return new Observable(observer => {
        Promise.all(updatePromises).then(() => {
          console.log('✅ All stock updates saved to backend');
          this.loadProducts(); // Reload to sync
          observer.next(true);
          observer.complete();
        }).catch(error => {
          console.error('❌ Error updating stock:', error);
          // Fallback to local update
          this.saveToLocalStorage(updatedProducts);
          this.productsSubject.next(updatedProducts);
          observer.next(true);
          observer.complete();
        });
      });
    } else {
      // Update locally
      this.saveToLocalStorage(updatedProducts);
      this.productsSubject.next(updatedProducts);
      console.log('✅ Stock updated in localStorage');
      return of(true);
    }
  }

  // Reset to original products from JSON file
  resetProducts(): Observable<boolean> {
    return this.http.get<Product[]>(this.productsUrl).pipe(
      map(products => {
        this.saveToLocalStorage(products);
        this.productsSubject.next(products);
        console.log('✅ Products reset to default');
        return true;
      }),
      catchError(() => of(false))
    );
  }
}
