import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estadoUsuario',
})
export class EstadoUsuarioPipe implements PipeTransform {
  transform(habilitado: boolean | undefined): string {
    return habilitado === false ? 'Deshabilitado' : 'Habilitado';
  }
}