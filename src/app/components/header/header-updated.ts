// import { Component, OnInit, Output, EventEmitter } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import { Observable } from 'rxjs';
// import { CartService } from '../../services/cart.service';
// import { AuthService } from '../../services/auth.service';

// @Component({
//   selector: 'app-header',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './header.html',
//   styleUrls: ['./header.css']
// })

// export class HeaderComponent implements OnInit {
//   @Output() cartClick = new EventEmitter<void>();
//   cartCount$!: Observable<number>;
//   isAuthenticated$!: Observable<boolean>;
//   deliveryAddress: string = '';
//   categories = [
//     'Pain Relief',
//     'Cold and Flu',
//     'Diabetes Care',
//     'Digestive Health',
//     'First Aid',
//     'Skin Care',
//     'Child and Baby Care',
//     'Heart Health',
//     'Eye and Ear Care',
//     'Respiratory Health'
//   ];

//   constructor(
//     private cartService: CartService,
//     private authService: AuthService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.cartCount$ = this.cartService.getCartCount();
//     this.isAuthenticated$ = new Observable(observer => {
//       this.authService.user$.subscribe(user => {
//         observer.next(user?.isAuthenticated ?? false);
//       });
//     });

//     this.loadDeliveryAddress();
//   }

//   loadDeliveryAddress(): void {
//     try {
//       const addresses = JSON.parse(localStorage.getItem('deliveryAddresses') || '[]');
//       this.deliveryAddress = addresses[0]?.addressLine1 || 'Select Location';
//     } catch {
//       this.deliveryAddress = 'Select Location';
//     }
//   }

//   onQuickOrder(): void {
//     this.router.navigate(['/mycart']);
//   }

//   onCartClick(): void {
//     this.cartClick.emit();
//   }

//   onSymptomChecker(): void {
//     this.router.navigate(['/symptom-checker']);
//   }

//   onUserClick(): void {
//     // Will be handled by parent component to open sidebar
//   }

//   onLoginClick(): void {
//     this.router.navigate(['/login']);
//   }

//   onCategoryClick(category: string): void {
//     this.router.navigate(['/shopping'], { queryParams: { category } });
//   }
// }
