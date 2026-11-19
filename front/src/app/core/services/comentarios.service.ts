import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Comentario, PaginaComentarios } from '../models/comentario.interface';

@Injectable({ providedIn: 'root' })
export class ComentariosService {
  private http = inject(HttpClient);

  private url(publicacionId: string) {
    return `${environment.apiUrl}/publicaciones/${publicacionId}/comentarios`;
  }

  listar(publicacionId: string, offset: number, limit: number) {
    const params = new HttpParams().set('offset', offset).set('limit', limit);
    return this.http.get<PaginaComentarios>(this.url(publicacionId), { params });
  }

  crear(publicacionId: string, mensaje: string) {
    return this.http.post<Comentario>(this.url(publicacionId), { mensaje });
  }

  editar(publicacionId: string, id: string, mensaje: string) {
    return this.http.put<Comentario>(`${this.url(publicacionId)}/${id}`, { mensaje });
  }
}