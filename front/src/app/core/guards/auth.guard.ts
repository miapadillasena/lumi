import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
// decide si podes o no entar a una del front
export const authGuard: CanActivateFn = () => { 
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentUser()) { // si hay un usuario eso significa que esta logueada
    return true; // y te deja entrar 
  }

  return router.createUrlTree(['/']); // si no hay nada, no te deja entrar, sino te redirige para validar el token
}; 