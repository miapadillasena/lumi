import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { Rol } from '../../auth/rol';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { UsuarioJwt } from '../decorators/usuario-actual.decorator';

@Injectable()
export class RolesGuard implements CanActivate { // devuelve true y pasa, puede tirar un error y no pasar 
  constructor(private readonly reflector: Reflector) {} // para leer la metadata

  canActivate(ctx: ExecutionContext): boolean { 
    const permitidos = this.reflector.getAllAndOverride<Rol[] | undefined>( // busca @Roles en el metodo, y si no hay, en el controller
      ROLES_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );
    if (!permitidos || permitidos.length === 0) return true; // si la ruta no tiene @Roles, alcanza con estas logueado

    const { user } = ctx
      .switchToHttp()
      .getRequest<Request & { user?: UsuarioJwt }>(); // el usuario que dejo la estrategia JWT en req.user
    if (!user || !permitidos.includes(user.perfil as Rol)) { // si el perfil esta en la lista, pasa, sino tira error
      throw new ForbiddenException('No tenés permisos para esta acción');
    }
    return true;
  }
}