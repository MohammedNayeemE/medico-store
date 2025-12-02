import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SymptomCheckerComponent } from '../../components/symptom-checker/symptom-checker';
import { HeaderComponent } from '../../components/header/header';
import { CartSidebarComponent } from '../../components/cart-sidebar/cart-sidebar';

@Component({
  selector: 'app-symptom-checker-page',
  standalone: true,
  imports: [CommonModule, SymptomCheckerComponent , HeaderComponent , CartSidebarComponent],
  template: `
    <app-header (cartClick)="openCartSidebar()"></app-header>
    <app-cart-sidebar [isOpen]="isCartSidebarOpen" (closeSidebar)="closeCartSidebar()"></app-cart-sidebar>
    <app-symptom-checker></app-symptom-checker>
  `
})
export class SymptomCheckerPageComponent {
  isCartSidebarOpen = false;

  openCartSidebar() {
    this.isCartSidebarOpen = true;
  }

  closeCartSidebar() {
    this.isCartSidebarOpen = false;
  }
}
