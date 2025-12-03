import { Component, OnInit, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroComponent } from '../../components/hero/hero';
import { HeaderComponent } from '../../components/header/header';
import { CartSidebarComponent } from '../../components/cart-sidebar/cart-sidebar';
import { BannerCarouselComponent } from '../../components/banner-carousel/banner-carousel';
import { FeaturesSectionComponent } from '../../components/features-section/features-section';
import { CategoriesSectionComponent } from '../../components/categories-section/categories-section';
import { ProductCarouselComponent } from '../../components/product-carousal/product-carousal';
import { FooterComponent } from '../../components/footer/footer';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    CartSidebarComponent,
    HeroComponent,
    BannerCarouselComponent,
    FeaturesSectionComponent,
    CategoriesSectionComponent,
    ProductCarouselComponent,
    FooterComponent
  ],
  templateUrl: './home.html'
})
export class HomeComponent implements OnInit {
  // Using signals for reactive state management
  products = signal<Product[]>([]);
  popularProducts = signal<Product[]>([]);
  showBackToTop = signal(false);

  constructor(private productService: ProductService) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showBackToTop.set(window.scrollY > 300);
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  brands = [
    { name: 'GSK', tagline: 'Global Healthcare Leader', img: 'assets/images/Gsk-logo-.webp' },
    { name: 'Cipla', tagline: 'Pharmaceutical Excellence', img: 'assets/images/cipla-removebg-preview.webp' },
    { name: 'Abbott', tagline: 'Life-Changing Technologies', img: 'assets/images/Abbott-removebg-preview.webp' },
    { name: 'Pfizer', tagline: 'Breakthrough Innovation', img: 'assets/images/Pfizer_logo.webp' }
  ];

  ngOnInit(): void {
    this.productService.getProducts().subscribe(products => {
      this.products.set(products);
    });

    this.productService.getPopularProducts().subscribe(products => {
      this.popularProducts.set(products);
    });
  }

  // Using signals for reactive state management
  isCartSidebarOpen = signal(false);

  openCartSidebar() {
    this.isCartSidebarOpen.set(true);
  }

  closeCartSidebar() {
    this.isCartSidebarOpen.set(false);
  }
}