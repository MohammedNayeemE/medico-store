import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

export interface ConfirmDialog {
  id: number;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean; // true for delete/remove actions
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  private dialogsSignal = signal<ConfirmDialog[]>([]);
  public dialogs = this.dialogsSignal.asReadonly();
  
  private confirmSubject = new Subject<{ id: number; confirmed: boolean }>();
  public confirm$ = this.confirmSubject.asObservable();
  
  private nextId = 0;

  /**
   * Show a confirmation dialog
   * @param title - Dialog title
   * @param message - Dialog message
   * @param confirmText - Text for confirm button (default: 'Confirm')
   * @param cancelText - Text for cancel button (default: 'Cancel')
   * @param isDangerous - Whether this is a dangerous action like delete (default: false)
   * @returns Observable that emits true if confirmed, false if cancelled
   */
  show(
    title: string,
    message: string,
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel',
    isDangerous: boolean = false
  ): Subject<boolean> {
    const id = this.nextId++;
    const dialog: ConfirmDialog = {
      id,
      title,
      message,
      confirmText,
      cancelText,
      isDangerous
    };

    const resultSubject = new Subject<boolean>();

    this.dialogsSignal.update(dialogs => [...dialogs, dialog]);

    const subscription = this.confirm$.subscribe(result => {
      if (result.id === id) {
        resultSubject.next(result.confirmed);
        resultSubject.complete();
        subscription.unsubscribe();
      }
    });

    return resultSubject;
  }

  /**
   * Confirm the dialog
   */
  confirm(id: number): void {
    this.confirmSubject.next({ id, confirmed: true });
    this.remove(id);
  }

  /**
   * Cancel the dialog
   */
  cancel(id: number): void {
    this.confirmSubject.next({ id, confirmed: false });
    this.remove(id);
  }

  /**
   * Remove dialog from the list
   */
  remove(id: number): void {
    this.dialogsSignal.update(dialogs => dialogs.filter(d => d.id !== id));
  }
}
