import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Publicacion, PublicacionSchema } from './publicacion.schema';
import { PublicacionesController } from './publicaciones.controller';
import { PublicacionesService } from './publicaciones.service';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  imports: [
    UsuariosModule,
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
    ]),
  ],
  controllers: [PublicacionesController],
  providers: [PublicacionesService, CloudinaryService],
})
export class PublicacionesModule {}
