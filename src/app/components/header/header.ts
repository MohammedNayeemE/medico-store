import { Component, OnInit, Output, EventEmitter, signal, computed, Signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ProductService, Product } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';
import { CustomerProfileService } from '../../services/customer-profile.service';

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
  
  // Profile sidebar state
  isProfileSidebarOpen = signal<boolean>(false);
  isLoggingOut = signal<boolean>(false);
  
  private toastService = inject(ToastService);
  private profileService = inject(CustomerProfileService);
  
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

  /**
   * Check if cart functionality should be visible
   * Cart is hidden for admin users
   */
  isCartAvailable(): boolean {
    return this.cartService.isCartAvailable();
  }

  /**
   * Load delivery address from API
   * Fetches the first address from the customer's saved addresses
   */
  loadDeliveryAddress(): void {
    // Only load if user is authenticated and is a customer
    if (!this.isAuthenticated() || !this.isCustomer()) {
      this.deliveryAddress.set('Select Location');
      return;
    }

    this.profileService.getCustomerAddresses().subscribe({
      next: (addresses) => {
        if (addresses && addresses.length > 0) {
          const firstAddress = addresses[0];
          // Format: "City - Pincode" (e.g., "Mumbai - 400001")
          const formattedAddress = firstAddress.city && firstAddress.pincode
            ? `${firstAddress.city} - ${firstAddress.pincode}`
            : firstAddress.city || firstAddress.pincode || 'Select Location';
          this.deliveryAddress.set(formattedAddress);
        } else {
          this.deliveryAddress.set('Select Location');
        }
      },
      error: (error) => {
        console.error('Error loading delivery address:', error);
        this.deliveryAddress.set('Select Location');
      }
    });
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

  /**
   * Check if the current user is a customer
   * Returns true only if user is authenticated and has customer role
   */
  isCustomer(): boolean {
    return this.authService.hasRole('customer');
  }

  /**
   * Toggle profile sidebar open/close
   */
  toggleProfileSidebar(): void {
    this.isProfileSidebarOpen.set(!this.isProfileSidebarOpen());
  }

  /**
   * Close profile sidebar
   */
  closeProfileSidebar(): void {
    this.isProfileSidebarOpen.set(false);
  }

  /**
   * Navigate to customer profile management page
   */
  navigateToProfile(): void {
    this.closeProfileSidebar();
    this.router.navigate(['/profile']);
  }

  /**
   * Navigate to customer orders page
   */
  navigateToOrders(): void {
    this.closeProfileSidebar();
    this.router.navigate(['/orders']);
  }

  /**
   * Navigate to customer dashboard
   */
  navigateToDashboard(): void {
    this.closeProfileSidebar();
    this.router.navigate(['/me/dashboard']);
  }

  /**
   * Navigate to help page
   */
  navigateToHelp(): void {
    this.closeProfileSidebar();
    this.router.navigate(['/help']);
  }

  /**
   * Logout the current user
   * Calls the backend logout endpoint to revoke tokens and terminate session
   * Falls back to local logout if API fails to ensure user is logged out locally
   */
  onLogout(): void {
    this.closeProfileSidebar();
    this.isLoggingOut.set(true);

    this.authService.logout().subscribe({
      next: (response) => {
        this.toastService.show('Logged out successfully');
        this.isLoggingOut.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Logout error:', err);
        // Even if API call fails, clear local auth state for security
        this.authService.logoutLocally();
        this.toastService.show('Logged out successfully');
        this.isLoggingOut.set(false);
        this.router.navigate(['/']);
      }
    });
  }

}