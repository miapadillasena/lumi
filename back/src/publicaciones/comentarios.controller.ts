import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ComentariosService } from './comentarios.service';
import { ComentarioDto } from './comentario.dto';
import { PaginacionDto } from './publicacion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioActual } from '../common/decorators/usuario-actual.decorator';

@Controller('publicaciones/:publicacionId/comentarios')
@UseGuards(JwtAuthGuard) // todas las rutas piden token
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  @Get()
  listar(
    @Param('publicacionId') publicacionId: string, // saca el id de la URL 
    @Query() paginacion: PaginacionDto, // lee el offset
  ) {
    return this.comentariosService.listar(publicacionId, paginacion);
  }

  @Post()
  crear( 
    @Param('publicacionId') publicacionId: string,
    @Body() datos: ComentarioDto,
    @UsuarioActual('sub') usuarioId: string,
  ) { // el mensaje viene en el body y el usuario sale del token
    return this.comentariosService.crear(publicacionId, datos, usuarioId);
  }

  @Put(':id')
  editar(
    @Param('publicacionId') publicacionId: string,
    @Param('id') id: string,
    @Body() datos: ComentarioDto,
    @UsuarioActual('sub') usuarioId: string,
  ) {
    return this.comentariosService.editar(publicacionId, id, datos, usuarioId);
  }
}