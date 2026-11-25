import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { RangoFechasDto } from './estadistica.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guards';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('estadisticas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('administrador')
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get('publicaciones-por-usuario')
  publicacionesPorUsuario(@Query() rango: RangoFechasDto) {
    return this.estadisticasService.publicacionesPorUsuario(rango);
  }

  @Get('comentarios-por-dia')
  comentariosPorDia(@Query() rango: RangoFechasDto) {
    return this.estadisticasService.comentariosPorDia(rango);
  }

  @Get('comentarios-por-publicacion')
  comentariosPorPublicacion(@Query() rango: RangoFechasDto) {
    return this.estadisticasService.comentariosPorPublicacion(rango);
  }
}