import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.esAdmin()) {
    return true;
  }

  if (authService.currentUser()) {
    return router.createUrlTree(['/publicaciones']);
  }

  return router.createUrlTree(['/'], { queryParams: { volver: state.url } });
};