import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ComentariosPorDia, Dato } from '../models/estadistica.interface';

@Injectable({ providedIn: 'root' })
export class EstadisticasService {
  private http = inject(HttpClient);
  private url = environment.apiUrl + '/estadisticas';

  private params(desde: string, hasta: string) {
    return new HttpParams().set('desde', desde).set('hasta', hasta);
  }

  publicacionesPorUsuario(desde: string, hasta: string) {
    return this.http.get<Dato[]>(`${this.url}/publicaciones-por-usuario`, {
      params: this.params(desde, hasta),
    });
  }

  comentariosPorDia(desde: string, hasta: string) {
    return this.http.get<ComentariosPorDia>(`${this.url}/comentarios-por-dia`, {
      params: this.params(desde, hasta),
    });
  }

  comentariosPorPublicacion(desde: string, hasta: string) {
    return this.http.get<Dato[]>(`${this.url}/comentarios-por-publicacion`, {
      params: this.params(desde, hasta),
    });
  }
}