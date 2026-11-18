import { IsString, Matches, MaxLength } from 'class-validator';

export class ComentarioDto {
  @IsString({ message: 'El comentario es obligatorio' }) // tiene que ser texto
  @Matches(/\S/, { message: 'El comentario no puede estar vacío' }) // tiene que tener algo
  @MaxLength(500, { // maximo 500 caracteres
    message: 'El comentario admite como máximo 500 caracteres',
  })
  mensaje!: string;
}