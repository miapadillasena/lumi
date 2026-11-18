// recibe las peticiones HTTP que manda el front y se las pasa a AuthService
import {
  Body,
  Controller,
  HttpCode,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthService } from './auth.service';
import { RegistroDto } from './registro.dto';
import { LoginDto } from './login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {} 

  @Post('registro') // Crea la ruta post 
  @UseInterceptors(
    FileInterceptor('imagen', { // saca la imagen que hay en el formulario y la deja en la memoria, tiene un mx de 4MB
      storage: memoryStorage(),
      limits: { fileSize: 4 * 1024 * 1024, files: 1 },
    }),
  )
  registro(
    @Body() datos: RegistroDto, // recibe los datos del texto
    @UploadedFile() archivo?: Express.Multer.File, // recibe la imagen
  ) {
    return this.auth.registro(datos, archivo); // le pasa todo a auth.registro y devuelve lo que conteste el service
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() datos: LoginDto) {
    return this.auth.login(datos); // recibe el correo y las contraseñas validados
  }
}