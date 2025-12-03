import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { finalize } from 'rxjs';

// Logs basic request/response info in dev
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const start = performance.now();
  console.debug('[HTTP] →', req.method, req.urlWithParams);
  return next(req).pipe(
    tap({}),
    finalize(() => {
      const ms = Math.round(performance.now() - start);
      console.debug('[HTTP] ←', req.method, req.urlWithParams, `${ms}ms`);
    })
  );
};
