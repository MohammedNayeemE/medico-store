import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.html'
})
export class FooterComponent {
  quickLinks = [
    { label: 'Home', icon: 'fa-home', route: '/' },
    { label: 'About Us', icon: 'fa-info-circle', route: '/about' },
    { label: 'Medicines', icon: 'fa-pills', route: '/shopping' },
    { label: 'Terms And Services', icon: 'fa-user-md', route: '/terms' },
    { label: 'Contact', icon: 'fa-envelope', route: '/contact' }
  ];

  services = [
    { icon: 'fa-prescription-bottle', label: 'Prescription Medicines' },
    { icon: 'fa-heart', label: 'Health Supplements' },
    { icon: 'fa-baby', label: 'Baby Care Products' },
    { icon: 'fa-stethoscope', label: 'Medical Devices' },
    { icon: 'fa-phone-medical', label: 'Teleconsultation' }
  ];

  socialLinks = [
    { icon: 'fa-facebook-f', url: '#' },
    { icon: 'fa-instagram', url: '#' },
    { icon: 'fa-twitter', url: '#' },
    { icon: 'fa-whatsapp', url: '#' }
  ];

  footerLinks = [
    { label: 'Terms & Conditions', route: '/terms' },
    { label: 'Privacy Policy', route: '/privacy' },
    { label: 'Return Policy', route: '/returns' },
    { label: 'Shipping Info', route: '/shipping' }
  ];

  constructor(private router: Router) {}

  navigate(route: string): void {
    this.router.navigate([route]);
  }
}