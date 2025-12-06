import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Product {
  medicine_id: number;
  name: string;
  price: number;
  priceStr: string;
  img: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products: Product[] = [
    { medicine_id: 1, name: "Digital Thermometer", price: 5.90, priceStr: "₹5.90", img: "assets/images/thermometer-removebg-preview.webp" },
    { medicine_id: 2, name: "Stethoscope", price: 25.00, priceStr: "₹25.00", img: "assets/images/stethoscope-removebg-preview.webp" },
    { medicine_id: 3, name: "Paracetamol (10 Strips)", price: 12.90, priceStr: "₹12.90", img: "assets/images/paracetamol-tablet-removebg-preview.webp" },
    { medicine_id: 4, name: "Syringe Pack (10 pcs)", price: 8.50, priceStr: "₹8.50", img: "assets/images/syringes.webp" },
    { medicine_id: 5, name: "BP Monitor", price: 45.00, priceStr: "₹45.00", img: "assets/images/shopping.webp" },
    { medicine_id: 6, name: "Hand Sanitizer", price: 3.50, priceStr: "₹3.50", img: "assets/images/50ml-lifebuoy-hand-sanitizer-1000x1000-removebg-preview.png" },
    { medicine_id: 7, name: "Glucometer", price: 35.00, priceStr: "₹35.00", img: "assets/images/gluemetor.webp" },
    { medicine_id: 8, name: "First Aid Kit", price: 18.00, priceStr: "₹18.00", img: "assets/images/first-aid-kit.webp" }
  ];

  private popularProducts: Product[] = [
    { medicine_id: 5, name: "BP Monitor", price: 45.00, priceStr: "₹45.00", img: "assets/images/shopping.webp" },
    { medicine_id: 7, name: "Glucometer", price: 35.00, priceStr: "₹35.00", img: "assets/images/gluemetor.webp" },
    { medicine_id: 9, name: "Nebulizer", price: 28.00, priceStr: "₹28.00", img: "assets/images/nebulizer.webp" },
    { medicine_id: 10, name: "Surgical Mask (50 pcs)", price: 9.00, priceStr: "₹9.00", img: "assets/images/surgical_mask.webp" },
    { medicine_id: 11, name: "Pulse Oximeter", price: 22.00, priceStr: "₹22.00", img: "assets/images/pulse.webp" }
  ];

  getProducts(): Observable<Product[]> {
    return of(this.products);
  }

  getPopularProducts(): Observable<Product[]> {
    return of(this.popularProducts);
  }

  // Stub image-based search: match products whose name appears in file name
  searchProductsByImage(file: File): Observable<Product[]> {
    const name = file.name.toLowerCase();
    const hits = this.products.filter(p => {
      const tokens = p.name.toLowerCase().split(/\s|\(|\)|\-/);
      return tokens.some(t => t && name.includes(t));
    });
    return of(hits);
  }
}