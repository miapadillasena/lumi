import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'; // decoradores de @nestjs para definir el schema

@Schema() // marca la clase como schema de Mongo, que va a guardar estos documentos en la coleccion de usuarios
export class Usuario {
  @Prop({ required: true }) // define un campo obligatorio, si falta mongo no lo guarda
  nombre: string;

  @Prop({ required: true })
  apellido: string;// campos para el registro

  @Prop({ required: true, unique: true }) // no permite que haya dos usuarios con el mismo correo
  correo: string;

  @Prop({ required: true })
  nombreUsuario: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  fechaNacimiento: Date;

  @Prop({ required: true })
  descripcion: string;

   @Prop({ default: '' })
  imagenUrl: string;

  @Prop({ default: 'usuario', enum: ['usuario', 'administrador'] }) // ...tu comentario...
  perfil: string;

  @Prop({ default: true }) // si no se manda nada, el usuario arranca habilitado
  habilitado: boolean;
}
export const UsuarioSchema = SchemaFactory.createForClass(Usuario); // convierte la clase en el schema real que usa Mongoose