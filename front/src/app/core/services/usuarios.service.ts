import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Usuario } from '../models/usuario.interface';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private http = inject(HttpClient);
  private url = environment.apiUrl + '/usuarios';

  listar() {
    return this.http.get<Usuario[]>(this.url);
  }

  crear(datos: FormData) {
    return this.http.post<Usuario>(this.url, datos);
  }

  deshabilitar(id: string) {
    return this.http.delete<Usuario>(`${this.url}/${id}`);
  }

  habilitar(id: string) {
    return this.http.post<Usuario>(`${this.url}/${id}/habilitar`, {});
  }
}