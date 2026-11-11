import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model, isObjectIdOrHexString } from 'mongoose';
import { Publicacion } from './publicacion.schema';
import { CrearPublicacionDto, ListarPublicacionesDto } from './publicacion.dto';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

type PublicacionDocument = HydratedDocument<Publicacion>;

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<Publicacion>,
    private readonly usuarios: UsuariosService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async crear(datos: CrearPublicacionDto, archivo?: Express.Multer.File) {
    const usuario = await this.usuarios.buscarPorId(datos.usuarioId);
    if (!usuario) throw new NotFoundException('El usuario no existe');

    let imagenUrl = '';
    if (archivo) {
      this.cloudinary.validar(archivo);
      imagenUrl = await this.cloudinary.subir(archivo, 'publicaciones');
    }

    const publicacion = await this.publicacionModel.create({
      usuarioId: datos.usuarioId,
      titulo: datos.titulo,
      mensaje: datos.mensaje,
      imagenUrl: imagenUrl,
    });
    return (await this.armarRespuesta([publicacion]))[0];
  }

  async listar(filtros: ListarPublicacionesDto) {
    const condicion: { eliminada: boolean; usuarioId?: string } = {
      eliminada: false,
    };
    if (filtros.usuarioId) condicion.usuarioId = filtros.usuarioId;

    const orden: Record<string, 1 | -1> =
      filtros.orden === 'meGusta'
        ? { cantidadMeGusta: -1, createdAt: -1 }
        : { createdAt: -1 };

    const offset = filtros.offset ?? 0;
    const limit = filtros.limit ?? 10;

    const publicaciones = await this.publicacionModel
      .find(condicion)
      .sort(orden)
      .skip(offset)
      .limit(limit)
      .exec();
    const total = await this.publicacionModel.countDocuments(condicion);

    return {
      publicaciones: await this.armarRespuesta(publicaciones),
      total,
      offset,
      limit,
    };
  }

  async eliminar(id: string, usuarioId: string) {
    const publicacion = await this.buscar(id);
    const usuario = await this.usuarios.buscarPorId(usuarioId);
    if (!usuario) throw new NotFoundException('El usuario no existe');

    const esAutor = publicacion.usuarioId === usuarioId;
    const esAdmin = usuario.perfil === 'administrador';
    if (!esAutor && !esAdmin) {
      throw new ForbiddenException(
        'Solo el autor o un administrador puede eliminar esta publicación',
      );
    }

    publicacion.eliminada = true;
    await publicacion.save();
  }

  async darMeGusta(id: string, usuarioId: string) {
    const publicacion = await this.buscar(id);
    const usuario = await this.usuarios.buscarPorId(usuarioId);
    if (!usuario) throw new NotFoundException('El usuario no existe');

    if (publicacion.meGusta.includes(usuarioId)) {
      throw new ConflictException('Ya le diste me gusta a esta publicación');
    }

    publicacion.meGusta.push(usuarioId);
    publicacion.cantidadMeGusta = publicacion.meGusta.length;
    await publicacion.save();
    return (await this.armarRespuesta([publicacion]))[0];
  }

  async quitarMeGusta(id: string, usuarioId: string) {
    const publicacion = await this.buscar(id);

    if (!publicacion.meGusta.includes(usuarioId)) {
      throw new NotFoundException(
        'No le habías dado me gusta a esta publicación',
      );
    }

    publicacion.meGusta = publicacion.meGusta.filter((u) => u !== usuarioId);
    publicacion.cantidadMeGusta = publicacion.meGusta.length;
    await publicacion.save();
    return (await this.armarRespuesta([publicacion]))[0];
  }

  private async buscar(id: string) {
    if (!isObjectIdOrHexString(id)) {
      throw new NotFoundException('Publicación no encontrada');
    }
    const publicacion = await this.publicacionModel.findById(id);
    if (!publicacion || publicacion.eliminada) {
      throw new NotFoundException('Publicación no encontrada');
    }
    return publicacion;
  }

  private async armarRespuesta(publicaciones: PublicacionDocument[]) {
    const ids = publicaciones.map((p) => p.usuarioId);
    const usuarios = new Map(
      (await this.usuarios.buscarPorIds(ids)).map((u) => [u.id, u]),
    );

    return publicaciones.map((p) => {
      const autor = usuarios.get(p.usuarioId);
      return {
        id: p.id,
        titulo: p.titulo,
        mensaje: p.mensaje,
        imagenUrl: p.imagenUrl,
        meGusta: p.meGusta,
        cantidadMeGusta: p.cantidadMeGusta,
        fecha: p.get('createdAt') as Date,
        usuario: {
          id: p.usuarioId,
          nombreUsuario: autor?.nombreUsuario ?? 'usuario eliminado',
          imagenUrl: autor?.imagenUrl ?? '',
        },
      };
    });
  }
}
