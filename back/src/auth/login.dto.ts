import { Transform } from 'class-transformer'; // para modificar un dato antes de validarlo
import { IsEmail, IsString } from 'class-validator';
// que datos se mandan al front
export class LoginDto {
  @Transform(({ value }: { value: unknown }) => 
    typeof value === 'string' ? value.trim().toLowerCase() : value, // aplica una tranformacion solo si es texto, si es numero u otra cosa la deja igual y despues la rechaza
  )
  @IsEmail({}, { message: 'El correo no es válido' })
  correo!: string;

  @IsString({ message: 'La contraseña es obligatoria' })
  password!: string;
}