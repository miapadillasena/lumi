import { IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';

// Para editar el perfil. Cada campo se valida solo si vino
// El correo y la contraseña no se pueden cambiar desde acá.
export class PerfilDto {
  @ValidateIf((_obj, valor) => valor !== undefined)
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre admite como máximo 100 caracteres' })
  nombre?: string;

  @ValidateIf((_obj, valor) => valor !== undefined)
  @IsString()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El apellido admite como máximo 100 caracteres' })
  apellido?: string;

  @ValidateIf((_obj, valor) => valor !== undefined)
  @IsString()
  @MinLength(3, {
    message: 'El nombre de usuario debe tener al menos 3 caracteres',
  })
  @MaxLength(30, {
    message: 'El nombre de usuario admite como máximo 30 caracteres',
  })
  nombreUsuario?: string;

  @ValidateIf((_obj, valor) => valor !== undefined)
  @IsString({ message: 'La fecha de nacimiento no es válida' })
  fechaNacimiento?: string;

  @ValidateIf((_obj, valor) => valor !== undefined)
  @IsString()
  @MaxLength(200, {
    message: 'La descripción admite como máximo 200 caracteres',
  })
  descripcion?: string;
}