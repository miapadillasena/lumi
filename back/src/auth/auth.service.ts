import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';import { JwtService } from '@nestjs/jwt';
import { HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { Usuario } from '../usuarios/usuario.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import type { UsuarioJwt } from '../common/decorators/usuario-actual.decorator';
import { RegistroDto } from './registro.dto';
import { LoginDto } from './login.dto';
import { PerfilDto } from './perfil.dto';
// logica del registro y el login
@Injectable()
export class AuthService {
  constructor(
    private readonly usuarios: UsuariosService, // para guardar y buscar usuarios en Mongo
    private readonly cloudinary: CloudinaryService, // para la imagen
    private readonly jwt: JwtService,
  ) {}

  async registro(datos: RegistroDto, archivo?: Express.Multer.File) {
    let imagenUrl = '';
    if (archivo) {
      this.cloudinary.validar(archivo);
      imagenUrl = await this.cloudinary.subir(archivo, 'perfiles');
    }
    // valida que haya llegado y que sea JPEG, PNG o WebP, sino corta con 400 y np guarda nada
    // sube la imagen a cloudinary y se queda con el URL

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
      access_token: await this.generarToken(usuario), // el token
      usuario: this.toResponse(usuario), // devuelve los datos pero sin la contraseña
    };
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
      access_token: await this.generarToken(usuario),
      usuario: this.toResponse(usuario),
    }; // devuelve los datos del usuario, si esta todo bien.
  }

  async autorizar(id: string) {
    const usuario = await this.usuarios.buscarPorId(id);
    if (!usuario) throw new UnauthorizedException('El usuario no existe');
    return this.toResponse(usuario); // para cuando llego aca, el guard ya valido 
                                     // el token, busco el usuario por id
  }

    async editarPerfil(
    id: string,
    datos: PerfilDto,
    archivo?: Express.Multer.File,
  ) {
    const cambios: Partial<Usuario> = {// datos que llegaron
      nombre: datos.nombre, 
      apellido: datos.apellido,
      nombreUsuario: datos.nombreUsuario,
      descripcion: datos.descripcion,
    };
    if (datos.fechaNacimiento) {
      cambios.fechaNacimiento = new Date(datos.fechaNacimiento);// la fecha llega como texto asi que la paso a Date
    }
    if (archivo) {
      this.cloudinary.validar(archivo);
      cambios.imagenUrl = await this.cloudinary.subir(archivo, 'perfiles');
    } // si llego una foto, se valida, se sube y guardo la nueva URL 
    const sinVacios = Object.fromEntries(
      Object.entries(cambios).filter(([, valor]) => valor !== undefined),
    ); // saco los campos que quedaron como undefined

    const usuario = await this.usuarios.actualizar(id, sinVacios);
    if (!usuario) throw new NotFoundException('El usuario no existe');

    return {
      access_token: await this.generarToken(usuario),
      usuario: this.toResponse(usuario),
    }; // devuelve un token nuevo
  } 
  
  async refrescar(usuario: UsuarioJwt) { // recibe los datos del token que ya valido
    const payload: UsuarioJwt = { 
      sub: usuario.sub,
      correo: usuario.correo,
      nombreUsuario: usuario.nombreUsuario,
      perfil: usuario.perfil,
    };
    return { access_token: await this.jwt.signAsync(payload) };
  }

  private generarToken(usuario: HydratedDocument<Usuario>) {
    const payload: UsuarioJwt = {
      sub: usuario.id as string,
      correo: usuario.correo,
      nombreUsuario: usuario.nombreUsuario,
      perfil: usuario.perfil,
    };
    return this.jwt.signAsync(payload);
  }

  private toResponse(usuario: HydratedDocument<Usuario>) {
    return { // arma el objeto con los datos del usuario SIN la contraseña
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