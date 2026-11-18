import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
// que datos tiene que mandar al front y como se vvalidan
export class CrearPublicacionDto {
  @IsString()
  @MinLength(1, { message: 'El título es obligatorio' })
  @MaxLength(100, { message: 'El título admite como máximo 100 caracteres' })
  titulo!: string;

  @IsString()
  @MinLength(1, { message: 'El mensaje es obligatorio' })
  @MaxLength(1000, { message: 'El mensaje admite como máximo 1000 caracteres' })
  mensaje!: string;
} // datos para crear una publicacion

export class PaginacionDto {
  @IsOptional()
  @Transform(({ value }: { value: string }) => Number(value))
  @IsInt({ message: 'El offset debe ser un número entero' })
  @Min(0, { message: 'El offset no puede ser negativo' })
  offset?: number; // todo llega como texto, asi que lo transfoorma a numero antes de validarlo

  @IsOptional()
  @Transform(({ value }: { value: string }) => Number(value))
  @IsInt({ message: 'El limit debe ser un número entero' })
  @Min(1, { message: 'El limit debe ser al menos 1' })
  @Max(50, { message: 'El limit admite como máximo 50' })
  limit?: number;
}

export class ListarPublicacionesDto extends PaginacionDto {
  @IsOptional() // opcionales.
  @IsIn(['fecha', 'meGusta'], {
    message: 'El orden debe ser "fecha" o "meGusta"',
  })
  orden?: string;

  @IsOptional()
  @IsMongoId({ message: 'El usuarioId no es válido' })
  usuarioId?: string;
}


// saque UsuarioIdDto porque no hace falta ya