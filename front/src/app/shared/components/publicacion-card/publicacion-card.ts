import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Publicacion } from '../../../core/models/publicacion.interface';
// componente de cada publicacion, es un hijo
@Component({
  selector: 'app-publicacion-card',
  imports: [DatePipe], // sirve para mostrar la fecha de la publicacion formateada
  templateUrl: './publicacion-card.html',
  styleUrl: './publicacion-card.css',
})
export class PublicacionCard {
  @Input({ required: true }) publicacion!: Publicacion; // los datos a mostrar
  @Input() usuarioActualId: string | null = null;
  @Output() meGusta = new EventEmitter<Publicacion>();
  @Output() eliminar = new EventEmitter<Publicacion>();

  leDiMeGusta() {
    return !!this.usuarioActualId && this.publicacion.meGusta.includes(this.usuarioActualId);
  }

  esMia() {
    return this.publicacion.usuario.id === this.usuarioActualId;
  }
}
