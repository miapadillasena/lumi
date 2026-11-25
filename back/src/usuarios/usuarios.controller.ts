import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UsuariosService } from './usuarios.service';
import { CrearUsuarioDto } from './crear-usuario.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guards';
import { Roles } from '../common/decorators/roles.decorator';
import { UsuarioActual } from '../common/decorators/usuario-actual.decorator';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('administrador')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  listar() {
    return this.usuariosService.listar();
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: memoryStorage(),
      limits: { fileSize: 4 * 1024 * 1024, files: 1 },
    }),
  )
  alta(
    @Body() datos: CrearUsuarioDto,
    @UploadedFile() archivo?: Express.Multer.File,
  ) {
    return this.usuariosService.alta(datos, archivo);
  }

  @Delete(':id')
  deshabilitar(
    @Param('id') id: string,
    @UsuarioActual('sub') adminId: string,
  ) {
    return this.usuariosService.deshabilitar(id, adminId);
  }

  @Post(':id/habilitar')
  @HttpCode(200)
  habilitar(@Param('id') id: string) {
    return this.usuariosService.habilitar(id);
  }
}