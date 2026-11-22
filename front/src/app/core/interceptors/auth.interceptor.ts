import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';
// agrega el token, y si tiene 401, manda al login
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = environment.apiUrl;

  if (!req.url.startsWith(`${apiUrl}/`)) {
    return next(req); // si la peticion no va al back, la dejo pasar 
  }

  const publica = ['/auth/login', '/auth/registro'].some((path) => req.url === `${apiUrl}${path}`); // rutas para conseguir el token

  if (publica) {
    return next(req);
  }
 
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.accessToken(); // lee el token de localStorage

  if (token) {
    req = req.clone({  // las peticiones son inmutables
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req).pipe( //manda la peticion ya con el token 
    catchError((error: unknown) => { 
      if (error instanceof HttpErrorResponse && error.status === 401) {
        auth.cerrarSesion();
        void router.navigate(['/login']); // si el token responde con un 401, cierra sesion y manda directo al login 
      }
      return throwError(() => error);
    }),
  );
};