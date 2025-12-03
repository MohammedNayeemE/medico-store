import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import { Product } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-carousel',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './product-carousal.html',
  styleUrls: ['./product-carousal.css']
})
export class ProductCarouselComponent implements OnInit, AfterViewInit {
  @Input() title: string = 'Products';
  @Input() products: Product[] = [];
  @Input() swiperClass: string = 'productSwiper';
  @ViewChild('swiperContainer', { static: false }) swiperContainer!: ElementRef;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.swiperContainer) {
        new Swiper(this.swiperContainer.nativeElement, {
          modules: [Navigation, Pagination],
          slidesPerView: 1,
          spaceBetween: 20,
          loop: true,
          navigation: {
            nextEl: `.${this.swiperClass} .swiper-button-next`,
            prevEl: `.${this.swiperClass} .swiper-button-prev`
          },
          pagination: {
            el: `.${this.swiperClass} .swiper-pagination`,
            clickable: true
          },
          breakpoints: {
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 4 }
          }
        });
      }
    }, 100);
  }

  onAddToCart(product: Product, event: Event): void {
    event.stopPropagation();
    this.cartService.addToCart(product);
    // Toast notification is now handled by CartService
  }

  onViewAll(): void {
    this.router.navigate(['/shopping']);
  }
}