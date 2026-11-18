import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PaginaPublicaciones, Publicacion } from '../models/publicacion.interface';
// habla con el back
@Injectable({ providedIn: 'root' }) // hay una sola instancia para toda la app, y se puede inyectar en cualquier componente
export class PublicacionesService {
  private http = inject(HttpClient); // trae el cliente HTTP 
  private url = environment.apiUrl + '/publicaciones'; // arma la direccion base con la URL

  listar(orden: string, offset: number, limit: number, usuarioId?: string) {
    let params = new HttpParams() // arma los parametros
      .set('orden', orden)
      .set('offset', offset)
      .set('limit', limit);
    if (usuarioId) params = params.set('usuarioId', usuarioId); // es inmutable
    return this.http.get<PaginaPublicaciones>(this.url, { params });
  }

  crear(datos: FormData) { // crea un FormData que puede llevar imagen. 
    return this.http.post<Publicacion>(this.url, datos);
  }

  eliminar(id: string, usuarioId: string) {
    const params = new HttpParams().set('usuarioId', usuarioId); // el back necesita eñ usuarioID para saber si es autor o un admin
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
