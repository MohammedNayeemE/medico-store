import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

/**
 * Test component to demonstrate all toast types
 * Add this to any page to test the toast functionality
 * 
 * Usage in HTML:
 * <app-toast-tester></app-toast-tester>
 */
@Component({
  selector: 'app-toast-tester',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 left-4 z-50 bg-white p-4 rounded-lg shadow-lg border-2 border-gray-200">
      <h3 class="font-bold mb-3 text-gray-800">Toast Tester</h3>
      <div class="flex flex-col gap-2">
        <button 
          (click)="testSuccess()"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">
          Test Success
        </button>
        <button 
          (click)="testError()"
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">
          Test Error
        </button>
        <button 
          (click)="testInfo()"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
          Test Info
        </button>
        <button 
          (click)="testWarning()"
          class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition">
          Test Warning
        </button>
        <button 
          (click)="testAll()"
          class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition">
          Test All Types
        </button>
        <button 
          (click)="clearAll()"
          class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition">
          Clear All
        </button>
      </div>
    </div>
  `
})
export class ToastTesterComponent {
  constructor(private toastService: ToastService) {}

  testSuccess(): void {
    this.toastService.success('✨ This is a success message! Everything worked perfectly.');
  }

  testError(): void {
    this.toastService.error('❌ This is an error message! Something went wrong.');
  }

  testInfo(): void {
    this.toastService.info('💡 This is an informational message! Just FYI.');
  }

  testWarning(): void {
    this.toastService.warning('⚠️ This is a warning message! Please be careful.');
  }

  testAll(): void {
    setTimeout(() => this.testSuccess(), 0);
    setTimeout(() => this.testError(), 300);
    setTimeout(() => this.testInfo(), 600);
    setTimeout(() => this.testWarning(), 900);
  }

  clearAll(): void {
    this.toastService.clear();
  }
}
