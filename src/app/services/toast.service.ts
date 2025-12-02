import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  // Using signals for reactive state management
  private toastsSignal = signal<Toast[]>([]);
  public toasts = this.toastsSignal.asReadonly();
  private nextId = 0;

  show(message: string, duration: number = 1500): void {
    const id = this.nextId++;
    const toast: Toast = { id, message, duration };
    
    this.toastsSignal.update(toasts => [...toasts, toast]);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  private remove(id: number): void {
    this.toastsSignal.update(toasts => toasts.filter(t => t.id !== id));
  }
}