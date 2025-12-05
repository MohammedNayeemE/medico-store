import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, finalize } from 'rxjs/operators';
import { throwError, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

let isRefreshing = false;
const refreshTokenSubject = new Subject<string | null>();

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const isBackend = req.url.startsWith(environment.apiBaseUrl);
  const token = auth.getAccessToken();

  let modifiedReq = req;

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

      if (!isBackend || status !== 401) {
        return throwError(() => error);
      }

      if (req.url.includes('/auth/refresh')) {
        return throwError(() => error);
      }

      if (req.url.includes('/auth/admin/login')) {
        return throwError(() => error);
      }

      if (isRefreshing) {
        // Wait for the token refresh to complete, then retry the request
        return refreshTokenSubject.pipe(
          switchMap((newToken) => {
            let retry = modifiedReq;
            if (newToken) {
              retry = modifiedReq.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` }
              });
            }
            return next(retry);
          }),
          catchError((err) => throwError(() => err))
        );
      }

      isRefreshing = true;
      refreshTokenSubject.next(null);

      return auth.refreshToken().pipe(
        switchMap(() => {
          const newToken = auth.getAccessToken();
          console.log(newToken)
          let retry = modifiedReq;
          if (newToken) {
            retry = modifiedReq.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` }
            });
          }
          
          // Notify all pending requests about the new token
          refreshTokenSubject.next(newToken);
          
          return next(retry);
        }),
        catchError((refreshErr) => {
          isRefreshing = false;
          auth.logout(); // Cleanup on failed refresh
          return throwError(() => refreshErr);
        }),
        finalize(() => {
          isRefreshing = false;
        })
      );
    })
  );
};
