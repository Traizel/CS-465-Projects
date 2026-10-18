import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthenticationService } from './authentication.service';
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthenticationService);
  const router = inject(Router);
  // Never leak the token to unrelated origins or authentication endpoints.
  const protectedApi = request.url.startsWith('http://localhost:3000/api/trips');
  const token = auth.getToken();
  if (protectedApi && token) request = request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  return next(request).pipe(catchError(error => {
    if (protectedApi && error.status === 401) {
      auth.logout();
      void router.navigate(['/login']);
    }
    return throwError(() => error);
  }));
};
