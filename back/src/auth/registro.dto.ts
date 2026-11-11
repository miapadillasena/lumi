import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegistroDto {
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre admite como máximo 100 caracteres' })
  nombre!: string;

  @IsString()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El apellido admite como máximo 100 caracteres' })
  apellido!: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'El correo no es válido' })
  @MaxLength(254, { message: 'El correo es demasiado largo' })
  correo!: string;

  @IsString()
  @MinLength(3, {
    message: 'El nombre de usuario debe tener al menos 3 caracteres',
  })
  @MaxLength(30, {
    message: 'El nombre de usuario admite como máximo 30 caracteres',
  })
  nombreUsuario!: string;

  @IsString()
  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message:
      'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número',
  })
  password!: string;

  @IsString({ message: 'La fecha de nacimiento es obligatoria' })
  fechaNacimiento!: string;

  @IsString()
  @MaxLength(200, {
    message: 'La descripción admite como máximo 200 caracteres',
  })
  descripcion!: string;
}