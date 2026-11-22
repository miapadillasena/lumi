import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Sesion, Usuario } from '../models/usuario.interface';
// maneja toda la sesion
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient); // peticiones
  private url = environment.apiUrl + '/auth';
  private key = 'lumi-token';
  private readonly minutosAviso = 1; // tiempo para que de el aviso de vencimiento
  private contador: ReturnType<typeof setTimeout> | null = null; // guarda el setTimeout para poder cancelarlo

  currentUser = signal<Usuario | null>(null); // usuario logueado
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

  iniciarSesion(sesion: Sesion) { // la llama el login, registro y editar perfil
    this.currentUser.set(sesion.usuario);
    this.guardarToken(sesion.access_token); 
  }

  restaurarSesion() { // la usa la pantalla de carga
    return this.autorizar().pipe( // valida el token guardado
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

  private guardarToken(token: string) { // guarda el token y reinicia el contador
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