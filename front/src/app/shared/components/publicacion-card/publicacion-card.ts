import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Publicacion } from '../../../core/models/publicacion.interface';
import { RouterLink } from '@angular/router';
import { Avatar } from '../avatar/avatar';
// componente de cada publicacion, es un hijo
@Component({
  selector: 'app-publicacion-card',
  imports: [DatePipe, RouterLink, Avatar],// sirve para mostrar la fecha de la publicacion formateada
  templateUrl: './publicacion-card.html',
  styleUrl: './publicacion-card.css',
})
export class PublicacionCard {
  @Input({ required: true }) publicacion!: Publicacion; // los datos a mostrar
  @Input() usuarioActualId: string | null = null;
  @Input() grande = false;
  @Output() meGusta = new EventEmitter<Publicacion>();
  @Output() eliminar = new EventEmitter<Publicacion>();

  leDiMeGusta() {
    return !!this.usuarioActualId && this.publicacion.meGusta.includes(this.usuarioActualId);
  }

  esMia() {
    return this.publicacion.usuario.id === this.usuarioActualId;
  }
}
