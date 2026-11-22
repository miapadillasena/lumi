import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model, isObjectIdOrHexString } from 'mongoose';
import { Comentario } from './comentario.schema';
import { ComentarioDto } from './comentario.dto';
import { PaginacionDto } from './publicacion.dto';
import { PublicacionesService } from './publicaciones.service';
import { UsuariosService } from '../usuarios/usuarios.service';

type ComentarioDocument = HydratedDocument<Comentario>;
// toda la logica de los comentarios
@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Comentario.name)
    private readonly comentarioModel: Model<Comentario>, // para consultar la coleccion comentarios 
    private readonly publicaciones: PublicacionesService, // para revisar que pla publiacion exista
    private readonly usuarios: UsuariosService, // para los datos del autos
  ) {}

  async listar(publicacionId: string, paginacion: PaginacionDto) {
    await this.publicaciones.buscar(publicacionId); // busca la pbliacion, si no exise responde 404 y no sigue

    const offset = paginacion.offset ?? 0;
    const limit = paginacion.limit ?? 5;

    const encontrados = await this.comentarioModel
      .find({ publicacionId }) // solo los comentarios de esta publicacion
      .sort({ createdAt: -1 }) // del mas nuevo al mas viejo
      .skip(offset) // saltamos lo que ya se mostro
      .limit(limit + 1) // trae uno mas, para decir que hay mas
      .exec();

    const hasNext = encontrados.length > limit; // esto es lo que hace que se muestre, "cargar mas"
    const comentarios = encontrados.slice(0, limit); // saca ese que esta de mas para mostrar solo los que pedi

    return {
      comentarios: await this.armarRespuesta(comentarios),
      hasNext,
    };
  }

  async crear(publicacionId: string, datos: ComentarioDto, usuarioId: string) {
    await this.publicaciones.buscar(publicacionId);

    const comentario = await this.comentarioModel.create({
      publicacionId,
      usuarioId,
      mensaje: datos.mensaje,
    }); // revisa que exista y guarda el comentario con el usuario del tiken
    return (await this.armarRespuesta([comentario]))[0];
  }

  async editar(
    publicacionId: string,
    id: string,
    datos: ComentarioDto,
    usuarioId: string,
  ) {
    if (!isObjectIdOrHexString(id)) { // si el comentario no tiene el formato de Mongo, tira 404
      throw new NotFoundException('Comentario no encontrado');
    }
    const comentario = await this.comentarioModel.findOne({
      _id: id,
      publicacionId,
    }); // busca el comentario en esa publiacion, si no existe responde 404
    if (!comentario) throw new NotFoundException('Comentario no encontrado');

    if (comentario.usuarioId !== usuarioId) {
      throw new ForbiddenException('Solo el autor puede editar el comentario');
    }

    comentario.mensaje = datos.mensaje;
    comentario.modificado = true; // lo marca como modificado
    await comentario.save();
    return (await this.armarRespuesta([comentario]))[0];
  }

  private async armarRespuesta(comentarios: ComentarioDocument[]) {
    const ids = comentarios.map((c) => c.usuarioId);
    const usuarios = new Map(
      (await this.usuarios.buscarPorIds(ids)).map((u) => [u.id as string, u]),
    );

    return comentarios.map((c) => {
      const autor = usuarios.get(c.usuarioId);
      return {
        id: c.id as string,
        mensaje: c.mensaje,
        modificado: c.modificado,
        fecha: c.get('createdAt') as Date,
        usuario: {
          id: c.usuarioId,
          nombreUsuario: autor?.nombreUsuario ?? 'usuario eliminado',
          nombre: autor?.nombre ?? '',
          apellido: autor?.apellido ?? '',
          imagenUrl: autor?.imagenUrl ?? '',
        },
      };
    });
  }
} 