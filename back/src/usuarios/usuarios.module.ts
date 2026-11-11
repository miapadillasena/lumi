import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Usuario, UsuarioSchema } from './usuario.schema';
import { UsuariosService } from './usuarios.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]), // registra el schema Usuario en este modulo para poder inyectar su modelo en el service con @InjectModel. 
  ],                              // es el nombre con el que se registra 
  providers: [UsuariosService],
  exports: [UsuariosService], 
})
export class UsuariosModule {}