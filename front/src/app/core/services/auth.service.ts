import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Sesion, Usuario } from '../models/usuario.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private url = environment.apiUrl + '/auth';
  private key = 'lumi-token';
  private readonly minutosAviso = 10;
  private contador: ReturnType<typeof setTimeout> | null = null;

  currentUser = signal<Usuario | null>(null);
  avisoSesion = signal(false);

  accessToken() {
    return localStorage.getItem(this.key);
  }

  login(correo: string, password: string) {
    return this.http.post<Sesion>(this.url + '/login', { correo, password });
  }

  registro(datos: FormData) {
    return this.http.post<Sesion>(this.url + '/registro', datos);
  }

  editarPerfil(datos: FormData) {
    return this.http.patch<Sesion>(this.url + '/perfil', datos);
  }

  autorizar() {
    return this.http.post<Usuario>(this.url + '/autorizar', {});
  }

  refrescar() {
    return this.http.post<{ access_token: string }>(this.url + '/refrescar', {}).pipe(
      tap((respuesta) => this.guardarToken(respuesta.access_token)),
    );
  }

  iniciarSesion(sesion: Sesion) {
    this.currentUser.set(sesion.usuario);
    this.guardarToken(sesion.access_token);
  }

  restaurarSesion() {
    return this.autorizar().pipe(
      tap((usuario) => this.currentUser.set(usuario)),
      switchMap(() => this.refrescar()),
    );
  }

  extenderSesion() {
    this.avisoSesion.set(false);
    return this.refrescar();
  }

  cerrarSesion() {
    localStorage.removeItem(this.key);
    this.currentUser.set(null);
    this.avisoSesion.set(false);
    this.detenerContador();
  }

  private guardarToken(token: string) {
    localStorage.setItem(this.key, token);
    this.iniciarContador();
  }

  private iniciarContador() {
    this.detenerContador();
    this.contador = setTimeout(() => this.avisoSesion.set(true), this.minutosAviso * 60 * 1000);
  }

  private detenerContador() {
    if (this.contador) clearTimeout(this.contador);
    this.contador = null;
  }
}