import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'comentarios', timestamps: true }) // la coleccion se llama asi en mongo
export class Comentario {              // agrega createdAt y updatedAt
  @Prop({ required: true }) 
  publicacionId: string; // a que publicacion pertenece cada comentario

  @Prop({ required: true })
  usuarioId: string;

  @Prop({ required: true })
  mensaje: string;

  @Prop({ default: false }) // arranca en false pero si se edita pasa a treue
  modificado: boolean;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);