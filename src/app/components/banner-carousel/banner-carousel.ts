import { Component, OnInit, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';

@Component({
  selector: 'app-banner-carousel',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <section class="max-w-[95%] mx-auto px-6 py-6 cursor-pointer" (click)="onBannerClick()">
      <div #bannerSwiper class="swiper bannerSwiper rounded-xl overflow-hidden">
        <div class="swiper-wrapper">
          <div class="swiper-slide flex justify-center items-center">
            <img src="assets/images/theme-image-1755770487669.png" 
              alt="Mega Health Sale" 
              class="w-full max-w-full h-auto object-contain rounded-md">
          </div>
          <div class="swiper-slide flex justify-center items-center">
            <img src="assets/images/theme-image-1756879859093.jpeg" 
              alt="Free Medicine Consultation" 
              class="w-full max-w-full h-auto object-contain rounded-md">
          </div>
          <div class="swiper-slide flex justify-center items-center">
            <img src="assets/images/theme-image-1758045543657.jpeg" 
              alt="Same Day Delivery" 
              class="w-full max-w-full h-auto object-contain rounded-md">
          </div>
        </div>
        <div class="swiper-pagination"></div>
      </div>
    </section>
  `
})
export class BannerCarouselComponent implements OnInit {
  @ViewChild('bannerSwiper', { static: true }) swiperEl!: ElementRef;

  constructor(private router: Router) {}

  ngOnInit(): void {
    new Swiper(this.swiperEl.nativeElement, {
      modules: [Navigation, Pagination, Autoplay, EffectFade],
      loop: true,
      autoplay: { delay: 4000, disableOnInteraction: false },
      pagination: { el: '.swiper-pagination', clickable: true },
      effect: 'fade',
      fadeEffect: { crossFade: true }
    });
  }

  onBannerClick(): void {
    this.router.navigate(['/shopping']);
  }
}