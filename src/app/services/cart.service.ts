import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
  name: string;
  price: number;
  priceStr: string;
  img: string;
  quantity: number;
}

const CART_KEY = 'cart_v1';

@Injectable({
  providedIn: 'root'
})
export class CartService {
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

  constructor() {}

  private loadCart(): CartItem[] {
    try {
      const stored = localStorage.getItem(CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveCart(cart: CartItem[]): void {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    this.cartSignal.set(cart);
  }

  getCart(): CartItem[] {
    return this.cartSignal();
  }

  addToCart(product: { name: string; price: number; priceStr: string; img: string }): void {
    const cart = [...this.cartSignal()];
    const existing = cart.find(item => item.name === product.name);
    
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
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
  }

  clearCart(): void {
    this.saveCart([]);
  }
}