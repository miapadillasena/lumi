// recibe las peticiones HTTP que manda el front y se las pasa a AuthService
import {
  Body,
  Controller,
  HttpCode,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthService } from './auth.service';
import { RegistroDto } from './registro.dto';
import { LoginDto } from './login.dto';
import { PerfilDto } from './perfil.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import {
  UsuarioActual,
  type UsuarioJwt,
} from '../common/decorators/usuario-actual.decorator';

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

  @Post('autorizar')
  @HttpCode(200) 
  @UseGuards(JwtAuthGuard) // antes de todo, el guard vuelve a validarlo, si algo sale mal
                            // tira 401 y no sigue
  autorizar(@UsuarioActual('sub') id: string) {  // saca solo el id del usuario
    return this.auth.autorizar(id);
  }

  @Post('refrescar')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  refrescar(@UsuarioActual() usuario: UsuarioJwt) { // trae el usuario entero del token, para asi armar el token nuevo con los mismos datos
    return this.auth.refrescar(usuario);
  } 
  
  @Patch('perfil')
  @UseGuards(JwtAuthGuard) // hay que estar logueada si o si 
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: memoryStorage(),
      limits: { fileSize: 4 * 1024 * 1024, files: 1 },
    }),
  )
  editarPerfil(
    @UsuarioActual('sub') id: string, // el id sale del token asi cada uno solo puede editarse su propio perfil
    @Body() datos: PerfilDto,
    @UploadedFile() archivo?: Express.Multer.File,
  ) {
    return this.auth.editarPerfil(id, datos, archivo);
  }
}