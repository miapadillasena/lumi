import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { RegistroDto } from './registro.dto';
import { LoginDto } from './login.dto';
// logica del registro y el login
@Injectable()
export class AuthService {
  constructor(
    private readonly usuarios: UsuariosService, // para guardar y buscar usuarios en Mongo
    private readonly cloudinary: CloudinaryService, // para la imagen
  ) {}

  async registro(datos: RegistroDto, archivo?: Express.Multer.File) {
    this.cloudinary.validar(archivo); // valida que haya llegado y que sea JPEG, PNG o WebP, sino corta con 400 y np guarda nada
    const imagenUrl = await this.cloudinary.subir(archivo!, 'perfiles'); // sube la imagen a cloudinary y se queda con el URL

    const usuario = await this.usuarios.crear({
      nombre: datos.nombre,
      apellido: datos.apellido,
      correo: datos.correo,
      nombreUsuario: datos.nombreUsuario,
      password: await bcrypt.hash(datos.password, 10),
      fechaNacimiento: new Date(datos.fechaNacimiento),
      descripcion: datos.descripcion,
      imagenUrl: imagenUrl,
      perfil: 'usuario',
    }); // guarda el usuario. 
 
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      nombreUsuario: usuario.nombreUsuario,
      fechaNacimiento: usuario.fechaNacimiento,
      descripcion: usuario.descripcion,
      imagenUrl: usuario.imagenUrl,
      perfil: usuario.perfil,
    }; // devuelve los datos pero sin la contraseña
  }

  async login(datos: LoginDto) {
    const usuario = await this.usuarios.buscarPorCorreo(datos.correo);
    if (!usuario) throw new UnauthorizedException('Credenciales inválidas');
    // busca el usuario por correo, si no existe responde con 401
    const passwordValida = await bcrypt.compare( // encripta la contraseña que llego y compara con la guardada
      datos.password,
      usuario.password,
    );
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    } // si no coincide responde 401

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      nombreUsuario: usuario.nombreUsuario,
      fechaNacimiento: usuario.fechaNacimiento,
      descripcion: usuario.descripcion,
      imagenUrl: usuario.imagenUrl,
      perfil: usuario.perfil,
    };
  } // devuelve los datos del usuario, si esta todo bien. 
}
