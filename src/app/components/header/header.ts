import { Component, OnInit, Output, EventEmitter, signal, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})

export class HeaderComponent implements OnInit {
  @Output() cartClick = new EventEmitter<void>();
  
  // Using signals
  cartCount: Signal<number>;
  isAuthenticated: Signal<boolean>;
  deliveryAddress = signal<string>('Select Location');
  
  categories = [
    'Pain Relief',
    'Cold and Flu',
    'Diabetes Care',
    'Digestive Health',
    'First Aid',
    'Skin Care',
    'Child and Baby Care',
    'Heart Health',
    'Eye and Ear Care',
    'Respiratory Health'
  ];

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private productService: ProductService
  ) {
    // Initialize signals from services
    this.cartCount = this.cartService.cartCount;
    this.isAuthenticated = this.authService.isAuthenticated;
  }

  ngOnInit(): void {
    this.loadDeliveryAddress();
  }

  loadDeliveryAddress(): void {
    try {
      const addresses = JSON.parse(localStorage.getItem('deliveryAddresses') || '[]');
      this.deliveryAddress.set(addresses[0]?.addressLine1 || 'Select Location');
    } catch {
      this.deliveryAddress.set('Select Location');
    }
  }

  onQuickOrder(): void {
    this.router.navigate(['/mycart']);
  }

  onCartClick(): void {
    this.cartClick.emit();
  }

  onSymptomChecker(): void {
    this.router.navigate(['/symptom-checker']);
  }

  onUserClick(): void {
    // Will be handled by parent component to open sidebar
  }

  onLoginClick(): void {
    this.router.navigate(['/login']);
  }

  onCategoryClick(category: string): void {
    this.router.navigate(['/shopping'], { queryParams: { category } });
  }

  // Image search
  onImageFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.searchByImage(file);
    // Clear input so selecting same file again works
    input.value = '';
  }

  private searchByImage(file: File): void {
    // Simple demo: match by file name keywords; replace with backend API later
    this.productService.searchProductsByImage(file).subscribe((results: Product[]) => {
      // Navigate to shopping with a query param containing a pseudo keyword for now
      const keyword = file.name.split('.')[0];
      this.router.navigate(['/shopping'], { queryParams: { q: keyword, via: 'image' } });
      // Optionally, we could use a shared state to pass results
      console.log('Image search results', results);
    });
  }
}