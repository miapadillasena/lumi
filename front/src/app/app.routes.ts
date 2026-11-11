import { Routes } from '@angular/router';

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
    path: 'mi-perfil',
    loadComponent: () => import('./features/mi-perfil/mi-perfil').then((c) => c.MiPerfil),
  },
  { path: '**', redirectTo: '/login' },
];
