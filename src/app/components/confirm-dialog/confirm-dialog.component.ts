import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50" *ngIf="(confirmDialogService.dialogs() | slice:0:1).length > 0">
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        (click)="onCancel()"
      ></div>

      <!-- Dialog Container -->
      <div class="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
        <div 
          *ngFor="let dialog of confirmDialogService.dialogs()"
          class="relative w-full max-w-sm transition-all duration-200 transform scale-100"
        >
          <!-- Dialog Content -->
          <div class="bg-white rounded-xl shadow-2xl overflow-hidden">
            <!-- Header -->
            <div [ngClass]="dialog.isDangerous ? 'bg-red-50 border-b border-red-200' : 'bg-green-50 border-b border-green-200'">
              <div class="px-6 py-4">
                <h2 class="text-lg font-semibold" [ngClass]="dialog.isDangerous ? 'text-red-900' : 'text-green-900'">
                  <i 
                    [ngClass]="dialog.isDangerous ? 'fas fa-exclamation-triangle text-red-600' : 'fas fa-question-circle text-green-600'"
                    class="mr-2"
                  ></i>
                  {{ dialog.title }}
                </h2>
              </div>
            </div>

            <!-- Body -->
            <div class="px-6 py-4">
              <p class="text-gray-700 text-sm leading-relaxed">
                {{ dialog.message }}
              </p>
            </div>

            <!-- Footer with Actions -->
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button 
                type="button"
                (click)="onCancel()"
                class="px-4 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors font-medium text-sm"
              >
                {{ dialog.cancelText || 'Cancel' }}
              </button>
              <button 
                type="button"
                (click)="onConfirm(dialog.id)"
                [ngClass]="dialog.isDangerous 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'"
                class="px-4 py-2 rounded-lg transition-colors font-medium text-sm flex items-center gap-2"
              >
                <i [ngClass]="dialog.isDangerous ? 'fas fa-trash' : 'fas fa-check'"></i>
                {{ dialog.confirmText || 'Confirm' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ConfirmDialogComponent {
  confirmDialogService = inject(ConfirmDialogService);

  onConfirm(id: number): void {
    this.confirmDialogService.confirm(id);
  }

  onCancel(): void {
    const dialog = this.confirmDialogService.dialogs()[0];
    if (dialog) {
      this.confirmDialogService.cancel(dialog.id);
    }
  }
}
