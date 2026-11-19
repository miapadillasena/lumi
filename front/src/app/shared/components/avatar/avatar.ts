import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.html',
  styleUrl: './avatar.css',
})
export class Avatar {
  @Input() imagenUrl = '';
  @Input() nombre = '';
  @Input() apellido = '';
  @Input() tamano = 44;

  iniciales() {
    return ((this.nombre[0] ?? '') + (this.apellido[0] ?? '')).toUpperCase();
  }
}