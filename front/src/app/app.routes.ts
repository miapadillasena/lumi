import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
// define las rutas del front
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/cargando/cargando').then((c) => c.Cargando),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((c) => c.Login),
  },
  {
    path: 'registro',
    loadComponent: () => import('./features/auth/registro/registro').then((c) => c.Registro),
  },
  {
    path: 'publicaciones',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/publicaciones/publicaciones').then((c) => c.Publicaciones),
  },
  {
    path: 'publicacion/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/publicacion-detalle/publicacion-detalle').then(
        (c) => c.PublicacionDetalle,
      ),
  },
  {
    path: 'mi-perfil',
    canActivate: [authGuard], // ahora hay que estar logueada para entrar
    loadComponent: () => import('./features/mi-perfil/mi-perfil').then((c) => c.MiPerfil),
  },
  { path: '**', redirectTo: '' }, // poniendo cualquier cosa, manda a la pantalla de carga
];