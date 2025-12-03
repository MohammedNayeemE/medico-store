import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastService } from '../services/toast.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

// Catches HTTP errors and shows a toast
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  return next(req).pipe(
    catchError((err: any) => {
      const status = err?.status;
      const message = err?.error?.detail || err?.error?.message || err?.message || 'Unexpected error';
      // If unauthorized, suggest re-login for admin
      if (status === 401) {
        try { toast.show('Your session has expired. Please log in again.'); } catch {}
      } else {
        try { toast.show(`Request failed (${status ?? 'unknown'}): ${message}`); } catch {}
      }
      try {
        // no-op secondary
      } catch {}
      return throwError(() => err);
    })
  );
};
