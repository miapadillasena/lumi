import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  imports: [
    UsuariosModule,
    PassportModule, // activa Passport
    JwtModule.registerAsync({ // para configurar el JWT 
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({ // arma la configuracion
        secret: config.getOrThrow<string>('JWT_SECRET'), // la clave para firmar, si falta no arranca
        signOptions: { expiresIn: '15m' }, // para que se firme que van a vencer a los 15m 
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, CloudinaryService, JwtStrategy],
})
export class AuthModule {}