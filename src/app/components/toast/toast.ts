import { Component, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrls: ['./toast.css']
})
export class ToastComponent {
  toasts: Signal<Toast[]>;

  constructor(private toastService: ToastService) {
    this.toasts = this.toastService.toasts;
  }

  getToastClasses(type: string): string {
    const baseClasses = 'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm border transform transition-all duration-300 ease-out min-w-[300px] max-w-[500px]';
    
    switch(type) {
      case 'success':
        return `${baseClasses} bg-green-500/90 text-white border-green-400`;
      case 'error':
        return `${baseClasses} bg-red-500/90 text-white border-red-400`;
      case 'warning':
        return `${baseClasses} bg-yellow-500/90 text-white border-yellow-400`;
      case 'info':
      default:
        return `${baseClasses} bg-blue-500/90 text-white border-blue-400`;
    }
  }

  getIcon(type: string): string {
    switch(type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  }

  removeToast(id: number): void {
    this.toastService.remove(id);
  }
}