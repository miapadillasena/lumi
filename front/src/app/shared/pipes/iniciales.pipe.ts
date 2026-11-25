import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'iniciales',
})
export class InicialesPipe implements PipeTransform {
  transform(nombre: string, apellido: string): string {
    return ((nombre[0] ?? '') + (apellido[0] ?? '')).toUpperCase();
  }
}