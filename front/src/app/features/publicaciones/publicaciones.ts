import { Component } from '@angular/core';

@Component({
  selector: 'app-publicaciones',
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones {
  publicaciones = [
    {
      usuario: 'juanperez',
      titulo: '¡Mi primera publicación!',
      mensaje: 'Hola a todos, recién me sumo a Lumi.',
      meGusta: 12,
      comentarios: 3,
    },
    {
      usuario: 'lauragomez',
      titulo: 'Atardecer en la costa',
      mensaje: 'Les comparto una foto del fin de semana.',
      meGusta: 27,
      comentarios: 8,
    },
  ];
}
