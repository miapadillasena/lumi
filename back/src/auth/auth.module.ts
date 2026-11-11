import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  imports: [UsuariosModule],
  controllers: [AuthController],
  providers: [AuthService, CloudinaryService],
})
export class AuthModule {}