import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PublicacionesService } from './publicaciones.service';
import { CrearPublicacionDto, ListarPublicacionesDto } from './publicacion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  UsuarioActual,
  type UsuarioJwt,
} from '../common/decorators/usuario-actual.decorator';
// puerta de entrada de todo lo de publicaciones, define 5 rutas
@Controller('publicaciones')
@UseGuards(JwtAuthGuard) // protege todas las rutas del controller, sin un token valido cualquier ruta responde 401
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {} // recibe los datos y se los pasa al PublicacionesSrervice

  @Post()
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: memoryStorage(),
      limits: { fileSize: 4 * 1024 * 1024, files: 1 },
    }),
  )
  crear( // 
    @Body() datos: CrearPublicacionDto,
    @UsuarioActual('sub') usuarioId: string, // el id del token
    @UploadedFile() archivo?: Express.Multer.File,
  ) {
    return this.publicacionesService.crear(datos, usuarioId, archivo);
  }

  @Get()
  listar(@Query() filtros: ListarPublicacionesDto) {
    return this.publicacionesService.listar(filtros);
  }

  @Get(':id') // trae una sola publicacion
  obtener(@Param('id') id: string) {
    return this.publicacionesService.obtener(id);
  }

  @Delete(':id')
  @HttpCode(204)
  eliminar(@Param('id') id: string, @UsuarioActual() usuario: UsuarioJwt) { // trae todo el usuario del token
    return this.publicacionesService.eliminar(id, usuario.sub, usuario.perfil);
  }

  @Post(':id/me-gusta')
  darMeGusta(@Param('id') id: string, @UsuarioActual('sub') usuarioId: string) {
    return this.publicacionesService.darMeGusta(id, usuarioId);
  }

  @Delete(':id/me-gusta')
  quitarMeGusta(
    @Param('id') id: string,
    @UsuarioActual('sub') usuarioId: string,
  ) {
    return this.publicacionesService.quitarMeGusta(id, usuarioId);
  } // el id sale del token en vez del body o la query
} 