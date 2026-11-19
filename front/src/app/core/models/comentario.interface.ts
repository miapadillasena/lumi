export interface Comentario {
  id: string;
  mensaje: string;
  modificado: boolean;
  fecha: string;
  usuario: {
    id: string;
    nombreUsuario: string;
    nombre: string;
    apellido: string;
    imagenUrl: string;
  };
}

export interface PaginaComentarios {
  comentarios: Comentario[];
  hasNext: boolean;
}