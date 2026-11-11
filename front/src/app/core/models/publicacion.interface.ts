export interface Publicacion {
  id: string;
  titulo: string;
  mensaje: string;
  imagenUrl: string;
  meGusta: string[];
  cantidadMeGusta: number;
  fecha: string;
  usuario: {
    id: string;
    nombreUsuario: string;
    imagenUrl: string;
  };
}

export interface PaginaPublicaciones {
  publicaciones: Publicacion[];
  total: number;
  offset: number;
  limit: number;
}
