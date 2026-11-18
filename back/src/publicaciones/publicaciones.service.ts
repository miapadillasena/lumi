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
// Toda la logica de las publicaciones.
type PublicacionDocument = HydratedDocument<Publicacion>;

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<Publicacion>,
    private readonly usuarios: UsuariosService, // para verificar que el usuario exista y traer los datos del autor
    private readonly cloudinary: CloudinaryService, // para la imagen opcional
  ) {}

  async crear(
    datos: CrearPublicacionDto,
    usuarioId: string,
    archivo?: Express.Multer.File,
  ) {
    let imagenUrl = '';
    if (archivo) { // si hay imagen la valida y la sube a la carpeta
      this.cloudinary.validar(archivo);
      imagenUrl = await this.cloudinary.subir(archivo, 'publicaciones');
    }

    const publicacion = await this.publicacionModel.create({
      usuarioId: usuarioId,
      titulo: datos.titulo,
      mensaje: datos.mensaje,
      imagenUrl: imagenUrl,
    });
    return (await this.armarRespuesta([publicacion]))[0];
  } // devuelve la publicaion con los datos del autor.

  async listar(filtros: ListarPublicacionesDto) { // trae las que no estan elliminadas.
    const condicion: { eliminada: boolean; usuarioId?: string } = {
      eliminada: false,
    };
    if (filtros.usuarioId) condicion.usuarioId = filtros.usuarioId;

    const orden: Record<string, 1 | -1> =
      filtros.orden === 'meGusta' // las nuevas van primero, de mayor a menor
        ? { cantidadMeGusta: -1, createdAt: -1 }
        : { createdAt: -1 }; // las que tienen mas me gusta van primero, y si empatan va la mas nueva

    const offset = filtros.offset ?? 0; // valores por defecto
    const limit = filtros.limit ?? 10;

    const publicaciones = await this.publicacionModel
      .find(condicion)
      .sort(orden)
      .skip(offset) // saltea las paginas anteriores
      .limit(limit) // trae solo las pedidas
      .exec();
    const total = await this.publicacionModel.countDocuments(condicion);

    return {
      publicaciones: await this.armarRespuesta(publicaciones),
      total,
      offset,
      limit,
    };
  }

  async obtener(id: string) {
    const publicacion = await this.buscar(id); // devuelve 404 si no existe o esta aliminada
    return (await this.armarRespuesta([publicacion]))[0];
  }

  async eliminar(id: string, usuarioId: string, perfil: string) {
    const publicacion = await this.buscar(id);

    const esAutor = publicacion.usuarioId === usuarioId;
    const esAdmin = perfil === 'administrador'; // solo se puede eliminar si es administrador, o el autor de la publicacion
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

    if (publicacion.meGusta.includes(usuarioId)) { // es un array con los ids de quienes ya dieron su me gusta
      throw new ConflictException('Ya le diste me gusta a esta publicación');
    }

    publicacion.meGusta.push(usuarioId); // si no le dio like, lo actualiza
    publicacion.cantidadMeGusta = publicacion.meGusta.length;
    await publicacion.save();
    return (await this.armarRespuesta([publicacion]))[0];
  }

  async quitarMeGusta(id: string, usuarioId: string) {
    const publicacion = await this.buscar(id); // solo le puede quitar si ya le dio antes.

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

  async buscar(id: string) { // se usa para eliminar y para los me gusta
    if (!isObjectIdOrHexString(id)) { // revisa que el id tenga un fomrato valido
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
          nombre: autor?.nombre ?? '',
          apellido: autor?.apellido ?? '',
          imagenUrl: autor?.imagenUrl ?? '',
        },
      };
    });
  }
}