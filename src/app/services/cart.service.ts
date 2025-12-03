import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { ToastService } from './toast.service';
import { AuthService } from './auth.service';

export interface CartItem {
  name: string;
  price: number;
  priceStr: string;
  img: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private authService = inject(AuthService);
  
  // Using signals for reactive state management
  private cartSignal = signal<CartItem[]>(this.loadCart());
  
  // Public readonly signals
  public cart = this.cartSignal.asReadonly();
  public cartCount = computed(() => 
    this.cartSignal().reduce((acc, item) => acc + item.quantity, 0)
  );
  public cartTotal = computed(() => 
    this.cartSignal().reduce((acc, item) => acc + (item.price * item.quantity), 0)
  );

  constructor(private toastService: ToastService) {
    // Watch for authentication changes and reload cart when user changes
    // This ensures cart is updated when logging in/out or switching between admin/customer
    effect(() => {
      // Access the user signal to track changes
      const user = this.authService.user();
      // Reload cart when user changes
      this.cartSignal.set(this.loadCart());
    });
  }

  /**
   * Get the appropriate cart key based on user role
   * Admin users should not have a cart (or have a separate one if needed)
   * Customer users get their own cart
   * Guest users get a guest cart
   */
  private getCartKey(): string {
    const user = this.authService.getUser();
    
    // Admin should not have access to cart functionality
    if (user?.roles?.includes('admin')) {
      return 'cart_admin_disabled'; // Using a disabled key for admin
    }
    
    // Customer gets their own cart (could be extended to user-specific: cart_customer_${user_id})
    if (user?.roles?.includes('customer') && user.user_id) {
      return `cart_customer_${user.user_id}`;
    }
    
    // Guest or unauthenticated users
    return 'cart_guest';
  }

  private loadCart(): CartItem[] {
    // Admins should not have a cart
    const user = this.authService.getUser();
    if (user?.roles?.includes('admin')) {
      return [];
    }

    try {
      const cartKey = this.getCartKey();
      const stored = localStorage.getItem(cartKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveCart(cart: CartItem[]): void {
    // Prevent admins from saving to cart
    const user = this.authService.getUser();
    if (user?.roles?.includes('admin')) {
      this.toastService.error('Cart is not available for admin users');
      return;
    }

    const cartKey = this.getCartKey();
    localStorage.setItem(cartKey, JSON.stringify(cart));
    this.cartSignal.set(cart);
  }

  getCart(): CartItem[] {
    return this.cartSignal();
  }

  /**
   * Check if cart functionality is available for the current user
   * Cart is disabled for admin users
   */
  isCartAvailable(): boolean {
    const user = this.authService.getUser();
    return !user?.roles?.includes('admin');
  }

  addToCart(product: { name: string; price: number; priceStr: string; img: string }): void {
    // Prevent admins from adding to cart
    if (!this.isCartAvailable()) {
      this.toastService.error('Cart is not available for admin users');
      return;
    }

    const cart = [...this.cartSignal()];
    const existing = cart.find(item => item.name === product.name);
    
    if (existing) {
      existing.quantity += 1;
      this.toastService.success(`${product.name} quantity increased to ${existing.quantity}`);
    } else {
      cart.push({ ...product, quantity: 1 });
      this.toastService.success(`${product.name} added to cart!`);
    }
    
    this.saveCart(cart);
  }

  increaseQuantity(name: string): void {
    const cart = [...this.cartSignal()];
    const item = cart.find(i => i.name === name);
    if (item) {
      item.quantity += 1;
      this.saveCart(cart);
    }
  }

  decreaseQuantity(name: string): void {
    let cart = [...this.cartSignal()];
    const item = cart.find(i => i.name === name);
    
    if (item) {
      item.quantity -= 1;
      if (item.quantity <= 0) {
        cart = cart.filter(i => i.name !== name);
      }
      this.saveCart(cart);
    }
  }

  removeItem(name: string): void {
    const cart = this.cartSignal().filter(i => i.name !== name);
    this.saveCart(cart);
    this.toastService.info(`${name} removed from cart`);
  }

  clearCart(): void {
    this.saveCart([]);
    this.toastService.info('Cart cleared');
  }
}