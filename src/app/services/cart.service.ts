import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastService } from './toast.service';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { catchError, of } from 'rxjs';

/**
 * Cart item as stored in local storage (frontend-only)
 */
export interface CartItemLocal {
  medicine_id: number;
  name: string;
  price: number;
  priceStr: string;
  img: string;
  quantity: number;
}

/**
 * Cart item from API response (backend)
 */
export interface CartItemApi {
  cart_item_id: number;
  medicine_id: number;
  quantity: number;
  added_at: string;
  is_deleted: boolean;
  deleted_at?: string | null;
  deleted_by?: number | null;
  // Medicine details (if populated by backend)
  medicine?: {
    medicine_id: number;
    name: string;
    price: number;
    image_url?: string;
  };
}

/**
 * Unified cart item interface combining local and API data
 */
export interface CartItem extends CartItemLocal {
  cart_item_id?: number; // Only present for items from API
}

/**
 * Cart response from API
 */
export interface CartApiResponse {
  cart_id: number;
  customer_id: number;
  created_at: string;
  updated_at?: string;
  is_deleted: boolean;
  deleted_at?: string | null;
  deleted_by?: number | null;
  cart_items: CartItemApi[];
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private toastService: ToastService;

  private readonly API_BASE = `${environment.apiBaseUrl}/cart`;
  
  // Using signals for reactive state management
  private cartSignal = signal<CartItem[]>([]);
  private isLoadingSignal = signal<boolean>(false);
  private isSyncingSignal = signal<boolean>(false);
  
  // Public readonly signals
  public cart = this.cartSignal.asReadonly();
  public isLoading = this.isLoadingSignal.asReadonly();
  public isSyncing = this.isSyncingSignal.asReadonly();
  
  public cartCount = computed(() => 
    this.cartSignal().reduce((acc, item) => acc + item.quantity, 0)
  );
  public cartTotal = computed(() => 
    this.cartSignal().reduce((acc, item) => acc + (item.price * item.quantity), 0)
  );

  constructor(toastService: ToastService) {
    this.toastService = toastService;
    
    // Initialize cart on service construction
    this.initializeCart();
    
    // Watch for authentication changes
    effect(() => {
      const user = this.authService.user();
      if (user?.isAuthenticated) {
        // User just logged in - sync local cart with server
        this.syncLocalCartToServer();
      } else {
        // User logged out - switch to local storage
        this.loadLocalCart();
      }
    });
  }

  /**
   * Initialize cart - load from local storage or API depending on auth state
   */
  private initializeCart(): void {
    const isAuthenticated = this.authService.isAuthenticated();
    
    if (isAuthenticated) {
      this.loadServerCart();
    } else {
      this.loadLocalCart();
    }
  }

  /**
   * Load cart from local storage (guest/unauthenticated users)
   */
  private loadLocalCart(): void {
    const localCart = this.getLocalCart();
    this.cartSignal.set(localCart);
  }

  /**
   * Load cart from API (authenticated users)
   */
  private loadServerCart(): void {
    this.isLoadingSignal.set(true);
    
    this.http.get<CartApiResponse>(`${this.API_BASE}/`)
      .pipe(
        catchError(error => {
          console.error('[Cart Service] Error loading cart from server:', error);
          this.toastService.error('Failed to load cart');
          // Fallback to local cart on error
          this.loadLocalCart();
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          const apiItems = this.normalizeApiCart(response.cart_items);
          this.cartSignal.set(apiItems);
        }
        this.isLoadingSignal.set(false);
      });
  }

  /**
   * Sync local cart items to server when user logs in
   * Merges local items with server items, preferring newer quantities
   */
  private syncLocalCartToServer(): void {
    const localCart = this.getLocalCart();
    
    if (localCart.length === 0) {
      // No local items to sync, just load server cart
      this.loadServerCart();
      return;
    }

    this.isSyncingSignal.set(true);
    
    // First, load the current server cart
    this.http.get<CartApiResponse>(`${this.API_BASE}/`)
      .pipe(
        catchError(error => {
          console.error('[Cart Service] Error syncing cart:', error);
          this.toastService.error('Failed to sync cart with server');
          return of(null);
        })
      )
      .subscribe(async serverResponse => {
        if (!serverResponse) {
          this.isSyncingSignal.set(false);
          return;
        }

        const serverItems = this.normalizeApiCart(serverResponse.cart_items);
        
        // Merge local items with server items
        for (const localItem of localCart) {
          const serverItem = serverItems.find(
            item => item.medicine_id === localItem.medicine_id
          );

          if (serverItem) {
            // Item exists on server - add local quantity to server quantity
            const newQuantity = serverItem.quantity + localItem.quantity;
            await this.updateItemQuantity(serverItem.cart_item_id!, newQuantity);
          } else {
            // Item doesn't exist on server - add it
            await this.addItemToServer(localItem);
          }
        }

        // Clear local storage and reload from server
        this.clearLocalCart();
        this.loadServerCart();
        this.toastService.success('Cart synced successfully');
        this.isSyncingSignal.set(false);
      });
  }

  /**
   * Add an item to server
   */
  private addItemToServer(item: CartItemLocal): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.API_BASE}/items/`, {
        medicine_id: item.medicine_id,
        quantity: item.quantity
      })
      .pipe(
        catchError(error => {
          console.error('[Cart Service] Error adding item to server:', error);
          return of(null);
        })
      )
      .subscribe(() => resolve());
    });
  }

  /**
   * Update item quantity on server
   */
  private updateItemQuantity(cartItemId: number, quantity: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.put(`${this.API_BASE}/items/${cartItemId}`, {
        quantity: quantity
      })
      .pipe(
        catchError(error => {
          console.error('[Cart Service] Error updating item:', error);
          return of(null);
        })
      )
      .subscribe(() => resolve());
    });
  }

  /**
   * Get local cart from localStorage
   */
  private getLocalCart(): CartItemLocal[] {
    try {
      const cartKey = this.getLocalCartKey();
      const stored = localStorage.getItem(cartKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save cart to localStorage
   */
  private saveLocalCart(cart: CartItem[]): void {
    const cartKey = this.getLocalCartKey();
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }

  /**
   * Clear local cart from localStorage
   */
  private clearLocalCart(): void {
    const cartKey = this.getLocalCartKey();
    localStorage.removeItem(cartKey);
  }

  /**
   * Get cart storage key based on user role
   */
  private getLocalCartKey(): string {
    const user = this.authService.user();
    
    // Admin should not have access to cart functionality
    if (user?.roles?.includes('admin')) {
      return 'cart_admin_disabled';
    }
    
    // Customer gets their own local key (before syncing to server)
    if (user?.roles?.includes('customer') && user?.user_id) {
      return `cart_local_customer_${user.user_id}`;
    }
    
    // Guest or unauthenticated users
    return 'cart_guest';
  }

  /**
   * Normalize API cart items to CartItem format
   */
  private normalizeApiCart(apiItems: CartItemApi[]): CartItem[] {
    return apiItems
      .filter(item => !item.is_deleted)
      .map(item => ({
        cart_item_id: item.cart_item_id,
        medicine_id: item.medicine_id,
        quantity: item.quantity,
        name: item.medicine?.name || `Medicine #${item.medicine_id}`,
        price: item.medicine?.price || 0,
        priceStr: `$${(item.medicine?.price || 0).toFixed(2)}`,
        img: item.medicine?.image_url || '/assets/default-medicine.png',
      }));
  }



  /**
   * Check if cart functionality is available for the current user
   * Cart is disabled for admin users
   */
  isCartAvailable(): boolean {
    const user = this.authService.user();
    return !user?.roles?.includes('admin');
  }

  /**
   * Add a product to cart
   * If user is authenticated, syncs with server
   * If user is not authenticated, stores in local storage
   */
  addToCart(product: {
    medicine_id: number;
    name: string;
    price: number;
    priceStr: string;
    img: string;
  }): void {
    // Prevent admins from adding to cart
    if (!this.isCartAvailable()) {
      this.toastService.error('Cart is not available for admin users');
      return;
    }

    const isAuthenticated = this.authService.isAuthenticated();
    const cart = [...this.cartSignal()];
    const existing = cart.find(item => item.medicine_id === product.medicine_id);

    if (existing) {
      existing.quantity += 1;
      this.toastService.success(
        `${product.name} quantity increased to ${existing.quantity}`
      );
    } else {
      cart.push({ ...product, quantity: 1 });
      this.toastService.success(`${product.name} added to cart!`);
    }

    if (isAuthenticated) {
      // Sync with server
      if (existing) {
        this.updateItemQuantity(existing.cart_item_id!, existing.quantity)
          .catch(() => {
            // Revert on error
            existing.quantity -= 1;
            this.cartSignal.set([...cart]);
          });
      } else {
        this.addItemToServer({ ...product, quantity: 1 }).catch(() => {
          // Revert on error
          this.cartSignal.set(cart.filter(i => i.medicine_id !== product.medicine_id));
        });
      }
    } else {
      // Save to local storage only
      this.saveLocalCart(cart);
    }

    this.cartSignal.set(cart);
  }

  /**
   * Increase quantity of an item by medicine_id
   */
  increaseQuantity(medicineId: number): void {
    const isAuthenticated = this.authService.isAuthenticated();
    const cart = [...this.cartSignal()];
    const item = cart.find(i => i.medicine_id === medicineId);

    if (item) {
      item.quantity += 1;

      if (isAuthenticated && item.cart_item_id) {
        this.updateItemQuantity(item.cart_item_id, item.quantity).catch(() => {
          item.quantity -= 1;
          this.cartSignal.set([...cart]);
        });
      } else {
        this.saveLocalCart(cart);
      }

      this.cartSignal.set(cart);
    }
  }

  /**
   * Decrease quantity of an item by medicine_id
   */
  decreaseQuantity(medicineId: number): void {
    const isAuthenticated = this.authService.isAuthenticated();
    let cart = [...this.cartSignal()];
    const item = cart.find(i => i.medicine_id === medicineId);

    if (item) {
      item.quantity -= 1;

      if (item.quantity <= 0) {
        if (isAuthenticated && item.cart_item_id) {
          this.deleteItemFromServer(item.cart_item_id).catch(() => {
            item.quantity += 1;
            this.cartSignal.set([...cart]);
          });
        }
        cart = cart.filter(i => i.medicine_id !== medicineId);
      } else {
        if (isAuthenticated && item.cart_item_id) {
          this.updateItemQuantity(item.cart_item_id, item.quantity).catch(() => {
            item.quantity += 1;
            this.cartSignal.set([...cart]);
          });
        } else {
          this.saveLocalCart(cart);
        }
      }

      this.cartSignal.set(cart);
    }
  }

  /**
   * Remove an item from cart by medicine_id
   */
  removeItem(medicineId: number): void {
    const isAuthenticated = this.authService.isAuthenticated();
    const cart = this.cartSignal();
    const item = cart.find(i => i.medicine_id === medicineId);

    if (!item) return;

    const updatedCart = cart.filter(i => i.medicine_id !== medicineId);

    if (isAuthenticated && item.cart_item_id) {
      this.deleteItemFromServer(item.cart_item_id).catch(() => {
        this.cartSignal.set(cart);
      });
    } else {
      this.saveLocalCart(updatedCart);
    }

    this.cartSignal.set(updatedCart);
    this.toastService.info(`${item.name} removed from cart`);
  }

  /**
   * Clear entire cart
   */
  clearCart(): void {
    const isAuthenticated = this.authService.isAuthenticated();

    if (isAuthenticated) {
      this.clearServerCart()
        .catch(() => {
          // Revert on error
          this.loadServerCart();
        });
    } else {
      this.clearLocalCart();
    }

    this.cartSignal.set([]);
    this.toastService.info('Cart cleared');
  }

  /**
   * Delete item from server
   */
  private deleteItemFromServer(cartItemId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.delete(`${this.API_BASE}/items/${cartItemId}`)
        .pipe(
          catchError(error => {
            console.error('[Cart Service] Error deleting item:', error);
            return of(null);
          })
        )
        .subscribe(() => resolve());
    });
  }

  /**
   * Clear cart on server
   */
  private clearServerCart(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.delete(`${this.API_BASE}/clear`)
        .pipe(
          catchError(error => {
            console.error('[Cart Service] Error clearing cart:', error);
            return of(null);
          })
        )
        .subscribe(() => resolve());
    });
  }
}