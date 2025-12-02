import { Component, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-6 right-6 z-100 space-y-2">
      <div *ngFor="let toast of toasts()"
        class="bg-black/80 text-white px-4 py-2 rounded shadow-lg toast-enter">
        {{ toast.message }}
      </div>
    </div>
  `
})
export class ToastComponent {
  toasts: Signal<Toast[]>;

  constructor(private toastService: ToastService) {
    this.toasts = this.toastService.toasts;
  }
}