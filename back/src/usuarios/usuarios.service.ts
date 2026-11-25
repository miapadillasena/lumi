import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model, isObjectIdOrHexString, mongo } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Usuario } from './usuario.schema';
import { CrearUsuarioDto } from './crear-usuario.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async crear(datos: Usuario) {
    try {
      return await this.usuarioModel.create(datos);
    } catch (error) {
      if (error instanceof mongo.MongoServerError && error.code === 11000) {
        throw new ConflictException('El correo ya está registrado');
      }
      throw error;
    }
  }

  async buscarPorCorreo(correo: string) {
    return await this.usuarioModel.findOne({ correo });
  }

    async actualizar(id: string, cambios: Partial<Usuario>) { // tiene algunos campos de Usuario, no necesariamente toods
    return await this.usuarioModel.findByIdAndUpdate( // busca el usuario por id y le cambia solo los campos que vienen en cambios
      id,
      { $set: cambios }, // operador de mongo 
      { new: true, runValidators: true }, // devulve el usuario ya actualizado
    );
  }
  
  async buscarPorId(id: string) {
    if (!isObjectIdOrHexString(id)) return null;
    return await this.usuarioModel.findById(id);
  }

  async buscarPorIds(ids: string[]) {
    return await this.usuarioModel.find({ _id: { $in: ids } });
  }
  
  async listar() {
    const usuarios = await this.usuarioModel.find().sort({ nombreUsuario: 1 });
    return usuarios.map((u) => this.toResponse(u));
  }

  async alta(datos: CrearUsuarioDto, archivo?: Express.Multer.File) {
    let imagenUrl = '';
    if (archivo) {
      this.cloudinary.validar(archivo);
      imagenUrl = await this.cloudinary.subir(archivo, 'perfiles');
    }

    const usuario = await this.crear({
      nombre: datos.nombre,
      apellido: datos.apellido,
      correo: datos.correo,
      nombreUsuario: datos.nombreUsuario,
      password: await bcrypt.hash(datos.password, 10),
      fechaNacimiento: new Date(datos.fechaNacimiento),
      descripcion: datos.descripcion,
      imagenUrl: imagenUrl,
      perfil: datos.perfil,
      habilitado: true,
    });
    return this.toResponse(usuario);
  }

  async deshabilitar(id: string, adminId: string) {
    if (id === adminId) {
      throw new BadRequestException('No podés deshabilitar tu propio usuario');
    }
    return this.cambiarHabilitado(id, false);
  }

  async habilitar(id: string) {
    return this.cambiarHabilitado(id, true);
  }

  private async cambiarHabilitado(id: string, habilitado: boolean) {
    if (!isObjectIdOrHexString(id)) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const usuario = await this.actualizar(id, { habilitado });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return this.toResponse(usuario);
  }

  private toResponse(usuario: HydratedDocument<Usuario>) {
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
      habilitado: usuario.habilitado,
    };
  }
}
