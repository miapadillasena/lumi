import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'publicaciones', timestamps: true })
export class Publicacion {
  @Prop({ required: true })
  usuarioId: string;

  @Prop({ required: true })
  titulo: string;

  @Prop({ required: true })
  mensaje: string;

  @Prop({ default: '' })
  imagenUrl: string;

  @Prop({ type: [String], default: [] })
  meGusta: string[];

  @Prop({ default: 0 })
  cantidadMeGusta: number;

  @Prop({ default: false })
  eliminada: boolean;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
