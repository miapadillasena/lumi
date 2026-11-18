import { Routes } from '@angular/router';
// define las rutas del front
export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
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
    loadComponent: () =>
      import('./features/publicaciones/publicaciones').then((c) => c.Publicaciones),
  },
  {
    path: 'mi-perfil', // incluso sin estar logueada permite entrar
    loadComponent: () => import('./features/mi-perfil/mi-perfil').then((c) => c.MiPerfil),
  },
  { path: '**', redirectTo: '/login' }, // poniendo cualquier cosa, todo manda al login
];
