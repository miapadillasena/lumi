import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Publicacion, PublicacionSchema } from './publicacion.schema';
import { Comentario, ComentarioSchema } from './comentario.schema';
import { PublicacionesController } from './publicaciones.controller';
import { PublicacionesService } from './publicaciones.service';
import { ComentariosController } from './comentarios.controller';
import { ComentariosService } from './comentarios.service';
import { EstadisticasController } from './estadisticas.controller';
import { EstadisticasService } from './estadisticas.service';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  imports: [
    UsuariosModule, // lo usa para verificar el usuario
    MongooseModule.forFeature([ // registro el schema Comentario
      { name: Publicacion.name, schema: PublicacionSchema }, // el nombre con el que se registra
      { name: Comentario.name, schema: ComentarioSchema },
    ]),
  ],
  controllers: [PublicacionesController, ComentariosController, EstadisticasController],
  providers: [PublicacionesService, ComentariosService, EstadisticasService, CloudinaryService],
})
export class PublicacionesModule {}