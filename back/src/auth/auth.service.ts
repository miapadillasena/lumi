import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { RegistroDto } from './registro.dto';
import { LoginDto } from './login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarios: UsuariosService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async registro(datos: RegistroDto, archivo?: Express.Multer.File) {
    this.cloudinary.validar(archivo);
    const imagenUrl = await this.cloudinary.subir(archivo!);

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
    });

    return {
      id: usuario.id as string,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      nombreUsuario: usuario.nombreUsuario,
      fechaNacimiento: usuario.fechaNacimiento,
      descripcion: usuario.descripcion,
      imagenUrl: usuario.imagenUrl,
      perfil: usuario.perfil,
    };
  }

  async login(datos: LoginDto) {
    const usuario = await this.usuarios.buscarPorCorreo(datos.correo);
    if (!usuario) throw new UnauthorizedException('Credenciales inválidas');

    const passwordValida = await bcrypt.compare(
      datos.password,
      usuario.password,
    );
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return {
      id: usuario.id as string,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      nombreUsuario: usuario.nombreUsuario,
      fechaNacimiento: usuario.fechaNacimiento,
      descripcion: usuario.descripcion,
      imagenUrl: usuario.imagenUrl,
      perfil: usuario.perfil,
    };
  }
}