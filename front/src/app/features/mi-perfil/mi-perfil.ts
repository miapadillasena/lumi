import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PublicacionesService } from '../../core/services/publicaciones.service';
import { Publicacion } from '../../core/models/publicacion.interface';
import { PublicacionCard } from '../../shared/components/publicacion-card/publicacion-card';

@Component({
  selector: 'app-mi-perfil',
  imports: [DatePipe, RouterLink, PublicacionCard],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil implements OnInit {
  authService = inject(AuthService);
  private publicacionesService = inject(PublicacionesService);

  ultimas = signal<Publicacion[]>([]);

  ngOnInit() {
    const usuario = this.authService.currentUser();
    if (!usuario) return;
    this.publicacionesService.listar('fecha', 0, 3, usuario.id).subscribe({
      next: (respuesta) => this.ultimas.set(respuesta.publicaciones),
    });
  }
}
