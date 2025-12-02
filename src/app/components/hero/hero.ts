import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="bg-linear-to-r from-green-500 to-teal-500 text-white">
      <div class="space-x-10 max-w-[95%] mx-auto flex flex-col md:flex-row items-center justify-center px-6 pt-6 pb-10">
        
        <div class="">
          <img src="assets/images/femaledoctorsideview-removebg-preview.png" 
            alt="Doctor" class="rounded-md h-96" loading="lazy">
        </div>
        
        <div class="space-x-2 flex flex-col w-1/2">
          <h2 class="text-3xl md:text-4xl font-bold mb-4 leading-snug">
            Your Prescription for <br> Affordable Health Solutions!
          </h2>
          <p class="mb-6 text-base text-gray-200 text-lg">
            Elevate your health journey with exclusive discounts and unparalleled convenience. 
            Your path to well-being starts here, where every purchase is a prescription for savings.
          </p>
          <a (click)="onStartShopping()"
            class="bg-white text-green-700 px-6 py-3 rounded-md text-lg font-semibold shadow hover:bg-gray-100 cursor-pointer inline-block w-fit">
            Start Shopping
          </a>
        </div>
        
        <div class="">
          <img src="assets/images/maleflipImage.png" 
            alt="Doctor" class="rounded-md h-96" loading="lazy">
        </div>
      </div>
    </section>
  `
})
export class HeroComponent {
  constructor(private router: Router) {}

  onStartShopping(): void {
    this.router.navigate(['/shopping']);
  }
}