import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { UsuarioJwt } from '../common/decorators/usuario-actual.decorator';
// le dice a Passport COMO validad
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) { // toma la Strategy y la conecta con Nest
  constructor(config: ConfigService) {
    super({ // le pasa la confiuracion a la estrategia
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // el token viene del header
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'), // la misma clave con la que se firman los tokens
      ignoreExpiration: false, // no ignora el vencimiento, si pasa los 15 min, no lo reconoce
      algorithms: ['HS256'], 
    });
  } 

  validate(payload: UsuarioJwt): UsuarioJwt { // se la llama solo si el token es valido
    return {
      sub: payload.sub,
      correo: payload.correo,
      nombreUsuario: payload.nombreUsuario,
      perfil: payload.perfil,
    };
  } // devuelve los 4 campos
}