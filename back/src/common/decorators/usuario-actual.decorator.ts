import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
// cuando alguien manda una peticion con token, se valida y guarda los datos del usuario
export interface UsuarioJwt { // forma en la que van adentro del toker
  sub: string; // subject
  correo: string;
  nombreUsuario: string;
  perfil: string;
}

export const UsuarioActual = createParamDecorator( // lo que se ejecuta cada vez que uso el decorador 
  (campo: keyof UsuarioJwt | undefined, ctx: ExecutionContext) => { // permite que solo se pueda poner nombres que existen
    const req = ctx.switchToHttp().getRequest<Request & { user: UsuarioJwt }>(); // le dice a TS que tiene un user con la fomra de UsuarioJwt
    return campo ? req.user[campo] : req.user;
  },
);