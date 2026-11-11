import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Usuario } from '../models/usuario.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private url = environment.apiUrl + '/auth';
  currentUser = signal<Usuario | null>(null);

  login(correo: string, password: string) {
    return this.http.post<Usuario>(this.url + '/login', { correo, password });
  }

  registro(datos: FormData) {
    return this.http.post<Usuario>(this.url + '/registro', datos);
  }

  iniciarSesion(usuario: Usuario) {
    this.currentUser.set(usuario);
  }

  cerrarSesion() {
    this.currentUser.set(null);
  }
}
