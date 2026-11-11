import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, mongo } from 'mongoose';
import { Usuario } from './usuario.schema';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
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
}