import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { PublicacionesModule } from './publicaciones/publicaciones.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // lee el .env
    MongooseModule.forRootAsync({ // se conecta a mongo
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({ // arma las opciones de conexion
        uri: config.getOrThrow<string>('MONGODB_URI'), // toma el URI de Atlas, si la variable no exite la app no arranca
      }),
    }), // los tres modulos
    UsuariosModule,
    AuthModule,
    PublicacionesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}