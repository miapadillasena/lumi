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
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PublicacionesService } from './publicaciones.service';
import {
  CrearPublicacionDto,
  ListarPublicacionesDto,
  UsuarioIdDto,
} from './publicacion.dto';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: memoryStorage(),
      limits: { fileSize: 4 * 1024 * 1024, files: 1 },
    }),
  )
  crear(
    @Body() datos: CrearPublicacionDto,
    @UploadedFile() archivo?: Express.Multer.File,
  ) {
    return this.publicacionesService.crear(datos, archivo);
  }

  @Get()
  listar(@Query() filtros: ListarPublicacionesDto) {
    return this.publicacionesService.listar(filtros);
  }

  @Delete(':id')
  @HttpCode(204)
  eliminar(@Param('id') id: string, @Query() datos: UsuarioIdDto) {
    return this.publicacionesService.eliminar(id, datos.usuarioId);
  }

  @Post(':id/me-gusta')
  darMeGusta(@Param('id') id: string, @Body() datos: UsuarioIdDto) {
    return this.publicacionesService.darMeGusta(id, datos.usuarioId);
  }

  @Delete(':id/me-gusta')
  quitarMeGusta(@Param('id') id: string, @Query() datos: UsuarioIdDto) {
    return this.publicacionesService.quitarMeGusta(id, datos.usuarioId);
  }
}
