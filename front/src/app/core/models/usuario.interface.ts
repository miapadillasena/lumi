// Forma de los datos que devuelve la API en /auth/registro y /auth/login.
export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: string;
  descripcion: string;
  imagenUrl: string;
  perfil: 'usuario' | 'administrador';
}
