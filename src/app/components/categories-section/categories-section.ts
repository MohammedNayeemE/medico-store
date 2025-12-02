import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Category {
  name: string;
  gradient: string;
  hoverGradient: string;
  iconBg: string;
  icon: string;
  hoverColor: string;
  count: string;
}

@Component({
  selector: 'app-categories-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories-section.html'
})
export class CategoriesSectionComponent {
  categories: Category[] = [
    {
      name: 'Pain Relief',
      gradient: 'from-red-50 to-red-100',
      hoverGradient: 'group-hover:from-red-100 group-hover:to-red-200',
      iconBg: 'bg-red-500',
      icon: 'fa-hand-holding-medical',
      hoverColor: 'group-hover:text-red-600',
      count: '50+ Products'
    },
    {
      name: 'Cold & Flu',
      gradient: 'from-blue-50 to-blue-100',
      hoverGradient: 'group-hover:from-blue-100 group-hover:to-blue-200',
      iconBg: 'bg-blue-500',
      icon: 'fa-thermometer',
      hoverColor: 'group-hover:text-blue-600',
      count: '35+ Products'
    },
    {
      name: 'Diabetes Care',
      gradient: 'from-green-50 to-green-100',
      hoverGradient: 'group-hover:from-green-100 group-hover:to-green-200',
      iconBg: 'bg-green-500',
      icon: 'fa-vial',
      hoverColor: 'group-hover:text-green-600',
      count: '28+ Products'
    },
    {
      name: 'Digestive Health',
      gradient: 'from-yellow-50 to-yellow-100',
      hoverGradient: 'group-hover:from-yellow-100 group-hover:to-yellow-200',
      iconBg: 'bg-yellow-500',
      icon: 'fa-pills',
      hoverColor: 'group-hover:text-yellow-600',
      count: '42+ Products'
    },
    {
      name: 'First Aid',
      gradient: 'from-orange-50 to-orange-100',
      hoverGradient: 'group-hover:from-orange-100 group-hover:to-orange-200',
      iconBg: 'bg-orange-500',
      icon: 'fa-kit-medical',
      hoverColor: 'group-hover:text-orange-600',
      count: '32+ Products'
    },
    {
      name: 'Skin Care',
      gradient: 'from-pink-50 to-pink-100',
      hoverGradient: 'group-hover:from-pink-100 group-hover:to-pink-200',
      iconBg: 'bg-pink-500',
      icon: 'fa-hand-sparkles',
      hoverColor: 'group-hover:text-pink-600',
      count: '65+ Products'
    },
    {
      name: 'Baby Care',
      gradient: 'from-purple-50 to-purple-100',
      hoverGradient: 'group-hover:from-purple-100 group-hover:to-purple-200',
      iconBg: 'bg-purple-500',
      icon: 'fa-baby',
      hoverColor: 'group-hover:text-purple-600',
      count: '25+ Products'
    },
    {
      name: 'Heart Health',
      gradient: 'from-red-50 to-red-100',
      hoverGradient: 'group-hover:from-red-100 group-hover:to-red-200',
      iconBg: 'bg-red-500',
      icon: 'fa-heart-pulse',
      hoverColor: 'group-hover:text-red-600',
      count: '18+ Products'
    },
    {
      name: 'Eye & Ear Care',
      gradient: 'from-teal-50 to-teal-100',
      hoverGradient: 'group-hover:from-teal-100 group-hover:to-teal-200',
      iconBg: 'bg-teal-500',
      icon: 'fa-eye',
      hoverColor: 'group-hover:text-teal-600',
      count: '22+ Products'
    },
    {
      name: 'Respiratory Health',
      gradient: 'from-indigo-50 to-indigo-100',
      hoverGradient: 'group-hover:from-indigo-100 group-hover:to-indigo-200',
      iconBg: 'bg-indigo-500',
      icon: 'fa-lungs',
      hoverColor: 'group-hover:text-indigo-600',
      count: '15+ Products'
    },
    {
      name: 'Medical Devices',
      gradient: 'from-gray-50 to-gray-100',
      hoverGradient: 'group-hover:from-gray-100 group-hover:to-gray-200',
      iconBg: 'bg-gray-500',
      icon: 'fa-stethoscope',
      hoverColor: 'group-hover:text-gray-600',
      count: '38+ Products'
    },
    {
      name: 'Supplements',
      gradient: 'from-emerald-50 to-emerald-100',
      hoverGradient: 'group-hover:from-emerald-100 group-hover:to-emerald-200',
      iconBg: 'bg-emerald-500',
      icon: 'fa-capsules',
      hoverColor: 'group-hover:text-emerald-600',
      count: '72+ Products'
    }
  ];

  constructor(private router: Router) {}

  onCategoryClick(category: string): void {
    this.router.navigate(['/shopping'], { queryParams: { category } });
  }
}