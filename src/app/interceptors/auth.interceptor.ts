import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../environments/environment';

let isRefreshing = false; // 🚫 prevents infinite refresh loops

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const isBackend = req.url.startsWith(environment.apiBaseUrl);
  const token = auth.getAccessToken();

  let modifiedReq = req;

  // Attach cookies + token only for backend URLs
  if (isBackend) {
    modifiedReq = modifiedReq.clone({ withCredentials: true });
    if (token) {
      modifiedReq = modifiedReq.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
  }

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {

      const status = error?.status;

      // ❌ Do NOT refresh for:
      if (!isBackend || status !== 401) {
        return throwError(() => error);
      }

      if (!token) {
        return throwError(() => error);
      }

      if (req.url.includes('/auth/refresh')) {
        return throwError(() => error);
      }

      if (req.url.includes('/auth/admin-login')) {
        return throwError(() => error);
      }

      if (isRefreshing) {
        return throwError(() => error);
      }

      isRefreshing = true;

      return auth.refreshToken().pipe(
        switchMap(() => {
          isRefreshing = false;

          const newToken = auth.getAccessToken();
          let retry = modifiedReq;
          if (newToken) {
            retry = modifiedReq.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` }
            });
          }

          return next(retry);
        }),
        catchError((refreshErr) => {
          isRefreshing = false;
          auth.logout(); // Cleanup on failed refresh
          return throwError(() => error);
        })
      );
    })
  );
};
