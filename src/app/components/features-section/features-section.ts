import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-features-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './features-section.html'
})
export class FeaturesSectionComponent {
  features = [
    {
      gradient: 'from-green-50 to-green-100',
      hoverGradient: 'group-hover:from-green-100 group-hover:to-green-200',
      iconBg: 'bg-green-500',
      icon: '🏷️',
      titleColor: 'text-green-700',
      hoverColor: 'group-hover:text-green-600',
      title: 'Best Prices Guaranteed',
      discount: 'Get 25% OFF',
      discountColor: 'text-green-600',
      description: 'on your first order plus ongoing savings on all medicines and health products',
      badges: [
        { bg: 'bg-green-200', text: 'text-green-800', label: 'Generic Available' },
        { bg: 'bg-green-200', text: 'text-green-800', label: 'Price Match' }
      ],
      borderColor: 'border-green-200'
    },
    {
      gradient: 'from-yellow-50 to-yellow-100',
      hoverGradient: 'group-hover:from-yellow-100 group-hover:to-yellow-200',
      iconBg: 'bg-yellow-500',
      icon: '🚚',
      titleColor: 'text-yellow-700',
      hoverColor: 'group-hover:text-yellow-600',
      title: 'Lightning Fast Delivery',
      discount: 'Free Home Delivery',
      discountColor: 'text-yellow-600',
      description: 'Same day delivery available for urgent medicines with real-time tracking',
      badges: [
        { bg: 'bg-yellow-200', text: 'text-yellow-800', label: '2-Hour Express' },
        { bg: 'bg-yellow-200', text: 'text-yellow-800', label: 'GPS Tracking' }
      ],
      borderColor: 'border-yellow-200'
    },
    {
      gradient: 'from-purple-50 to-purple-100',
      hoverGradient: 'group-hover:from-purple-100 group-hover:to-purple-200',
      iconBg: 'bg-purple-500',
      icon: '💊',
      titleColor: 'text-purple-700',
      hoverColor: 'group-hover:text-purple-600',
      title: '100% Authentic Products',
      discount: 'Certified Medicines',
      discountColor: 'text-purple-600',
      description: 'All products verified by licensed pharmacists with quality guarantee',
      badges: [
        { bg: 'bg-purple-200', text: 'text-purple-800', label: 'FDA Approved' },
        { bg: 'bg-purple-200', text: 'text-purple-800', label: 'Lab Tested' }
      ],
      borderColor: 'border-purple-200'
    }
  ];
}