import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tiempoRelativo',
})
export class TiempoRelativoPipe implements PipeTransform {
  transform(fecha: string): string {
    const segundos = Math.floor((Date.now() - new Date(fecha).getTime()) / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (segundos < 60) return 'Hace un momento';
    if (minutos < 60) return minutos === 1 ? 'Hace 1 minuto' : `Hace ${minutos} minutos`;
    if (horas < 24) return horas === 1 ? 'Hace 1 hora' : `Hace ${horas} horas`;
    if (dias < 7) return dias === 1 ? 'Ayer' : `Hace ${dias} días`;
    return new Date(fecha).toLocaleDateString('es-AR');
  }
}