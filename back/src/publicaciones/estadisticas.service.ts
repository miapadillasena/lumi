import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publicacion } from './publicacion.schema';
import { Comentario } from './comentario.schema';
import { RangoFechasDto } from './estadistica.dto';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<Publicacion>,
    @InjectModel(Comentario.name)
    private readonly comentarioModel: Model<Comentario>,
    private readonly usuarios: UsuariosService,
  ) {}

  async publicacionesPorUsuario(rango: RangoFechasDto) {
    const { desde, hasta } = this.armarRango(rango);
    const publicaciones = await this.publicacionModel.find({
      eliminada: false,
      createdAt: { $gte: desde, $lte: hasta },
    });

    const cantidades = new Map<string, number>();
    for (const p of publicaciones) {
      cantidades.set(p.usuarioId, (cantidades.get(p.usuarioId) ?? 0) + 1);
    }

    const usuarios = await this.usuarios.buscarPorIds([...cantidades.keys()]);
    const nombres = new Map(usuarios.map((u) => [u.id as string, u.nombreUsuario]));

    return [...cantidades.entries()]
      .map(([id, cantidad]) => ({
        etiqueta: nombres.get(id) ?? 'usuario eliminado',
        cantidad,
      }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }

  async comentariosPorDia(rango: RangoFechasDto) {
    const { desde, hasta } = this.armarRango(rango);
    const comentarios = await this.comentariosDisponibles(desde, hasta);

    const cantidades = new Map<string, number>();
    for (let dia = new Date(desde); dia <= hasta; dia.setUTCDate(dia.getUTCDate() + 1)) {
      cantidades.set(dia.toISOString().slice(0, 10), 0);
    }
    for (const c of comentarios) {
      const dia = (c.get('createdAt') as Date).toISOString().slice(0, 10);
      cantidades.set(dia, (cantidades.get(dia) ?? 0) + 1);
    }

    return {
      total: comentarios.length,
      porDia: [...cantidades.entries()].map(([etiqueta, cantidad]) => ({
        etiqueta,
        cantidad,
      })),
    };
  }

  async comentariosPorPublicacion(rango: RangoFechasDto) {
    const { desde, hasta } = this.armarRango(rango);
    const comentarios = await this.comentariosDisponibles(desde, hasta);

    const cantidades = new Map<string, number>();
    for (const c of comentarios) {
      cantidades.set(c.publicacionId, (cantidades.get(c.publicacionId) ?? 0) + 1);
    }

    const publicaciones = await this.publicacionModel.find({
      _id: { $in: [...cantidades.keys()] },
    });
    const titulos = new Map(publicaciones.map((p) => [p.id as string, p.titulo]));

    return [...cantidades.entries()]
      .map(([id, cantidad]) => ({ etiqueta: titulos.get(id) ?? '', cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }

  private async comentariosDisponibles(desde: Date, hasta: Date) {
    const comentarios = await this.comentarioModel.find({
      createdAt: { $gte: desde, $lte: hasta },
    });
    const ids = [...new Set(comentarios.map((c) => c.publicacionId))];
    const disponibles = await this.publicacionModel.find({
      _id: { $in: ids },
      eliminada: false,
    });
    const idsDisponibles = new Set(disponibles.map((p) => p.id as string));
    return comentarios.filter((c) => idsDisponibles.has(c.publicacionId));
  }

  private armarRango(rango: RangoFechasDto) {
    const hoy = new Date().toISOString().slice(0, 10);
    const hasta = new Date(`${rango.hasta ?? hoy}T23:59:59.999Z`);
    const desde = rango.desde
      ? new Date(`${rango.desde}T00:00:00.000Z`)
      : new Date(hasta.getTime() - 29 * 24 * 60 * 60 * 1000);
    desde.setUTCHours(0, 0, 0, 0);

    if (desde > hasta) {
      throw new BadRequestException('La fecha "desde" no puede ser posterior a "hasta"');
    }
    return { desde, hasta };
  }
}