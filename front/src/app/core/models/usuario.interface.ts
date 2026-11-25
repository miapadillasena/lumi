
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
  habilitado?: boolean, 
} 

export interface Sesion {
  access_token: string;
  usuario: Usuario;
} 
