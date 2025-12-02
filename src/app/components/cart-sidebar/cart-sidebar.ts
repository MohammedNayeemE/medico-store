import { Component, Input, Output, EventEmitter, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-sidebar.html',
  styleUrls: ['./cart-sidebar.css']
})
export class CartSidebarComponent {
  @Input() isOpen: boolean = false;
  @Output() closeSidebar = new EventEmitter<void>();
  
  // Expose service signals directly
  cartItems: Signal<CartItem[]>;
  totalPrice: Signal<number>;

  constructor(private cartService: CartService) {
    this.cartItems = this.cartService.cart;
    this.totalPrice = this.cartService.cartTotal;
  }

  closeSidebarClicked() {
    this.closeSidebar.emit();
  }

  increaseQuantity(name: string) {
    this.cartService.increaseQuantity(name);
  }

  decreaseQuantity(name: string) {
    this.cartService.decreaseQuantity(name);
  }

  removeItem(name: string) {
    this.cartService.removeItem(name);
  }
}
