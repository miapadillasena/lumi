import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PaginaPublicaciones, Publicacion } from '../models/publicacion.interface';

@Injectable({ providedIn: 'root' })
export class PublicacionesService {
  private http = inject(HttpClient);
  private url = environment.apiUrl + '/publicaciones';

  listar(orden: string, offset: number, limit: number, usuarioId?: string) {
    let params = new HttpParams()
      .set('orden', orden)
      .set('offset', offset)
      .set('limit', limit);
    if (usuarioId) params = params.set('usuarioId', usuarioId);
    return this.http.get<PaginaPublicaciones>(this.url, { params });
  }

  crear(datos: FormData) {
    return this.http.post<Publicacion>(this.url, datos);
  }

  eliminar(id: string, usuarioId: string) {
    const params = new HttpParams().set('usuarioId', usuarioId);
    return this.http.delete<void>(`${this.url}/${id}`, { params });
  }

  darMeGusta(id: string, usuarioId: string) {
    return this.http.post<Publicacion>(`${this.url}/${id}/me-gusta`, { usuarioId });
  }

  quitarMeGusta(id: string, usuarioId: string) {
    const params = new HttpParams().set('usuarioId', usuarioId);
    return this.http.delete<Publicacion>(`${this.url}/${id}/me-gusta`, { params });
  }
}
