import { Component, OnInit, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PublicacionesService } from '../../core/services/publicaciones.service';
import { ComentariosService } from '../../core/services/comentarios.service';
import { apiError } from '../../core/services/api-error';
import { Publicacion } from '../../core/models/publicacion.interface';
import { Comentario } from '../../core/models/comentario.interface';
import { PublicacionCard } from '../../shared/components/publicacion-card/publicacion-card';
import { Modal } from '../../shared/components/modal/modal';
import { Avatar } from '../../shared/components/avatar/avatar';

@Component({
  selector: 'app-publicacion-detalle',
  imports: [DatePipe, ReactiveFormsModule, RouterLink, PublicacionCard, Modal, Avatar],
  templateUrl: './publicacion-detalle.html',
  styleUrl: './publicacion-detalle.css',
})
export class PublicacionDetalle implements OnInit {
  id = input.required<string>();

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private publicacionesService = inject(PublicacionesService);
  private comentariosService = inject(ComentariosService);
  authService = inject(AuthService);

  readonly porCarga = 5;

  publicacion = signal<Publicacion | null>(null);
  comentarios = signal<Comentario[]>([]);
  hayMas = signal(false);
  isLoading = signal(true);
  isCargandoMas = signal(false);
  isEnviando = signal(false);
  editandoId = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  aEliminar = signal(false);

  comentarioForm = this.fb.group({
    mensaje: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(500)]],
  });
  edicionForm = this.fb.group({
    mensaje: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(500)]],
  });

  ngOnInit() {
    this.publicacionesService.obtener(this.id()).subscribe({
      next: (publicacion) => {
        this.publicacion.set(publicacion);
        this.isLoading.set(false);
        this.cargarComentarios();
      },
      error: (error) => {
        this.errorMessage.set(apiError(error));
        this.isLoading.set(false);
      },
    });
  }

  cargarComentarios() {
    this.isCargandoMas.set(true);
    const offset = this.comentarios().length;
    this.comentariosService.listar(this.id(), offset, this.porCarga).subscribe({
      next: (respuesta) => {
        const ids = new Set(this.comentarios().map((c) => c.id));
        const nuevos = respuesta.comentarios.filter((c) => !ids.has(c.id));
        this.comentarios.update((lista) => [...lista, ...nuevos]);
        this.hayMas.set(respuesta.hasNext);
        this.isCargandoMas.set(false);
      },
      error: (error) => {
        this.errorMessage.set(apiError(error));
        this.isCargandoMas.set(false);
      },
    });
  }

  comentar() {
    this.comentarioForm.markAllAsTouched();
    if (this.comentarioForm.invalid) return;

    this.isEnviando.set(true);
    this.comentariosService.crear(this.id(), this.comentarioForm.value.mensaje!).subscribe({
      next: (comentario) => {
        this.comentarios.update((lista) => [comentario, ...lista]);
        this.comentarioForm.reset();
        this.isEnviando.set(false);
      },
      error: (error) => {
        this.errorMessage.set(apiError(error));
        this.isEnviando.set(false);
      },
    });
  }

  empezarEdicion(comentario: Comentario) {
    this.editandoId.set(comentario.id);
    this.edicionForm.setValue({ mensaje: comentario.mensaje });
  }

  guardarEdicion(comentario: Comentario) {
    this.edicionForm.markAllAsTouched();
    if (this.edicionForm.invalid) return;

    this.comentariosService
      .editar(this.id(), comentario.id, this.edicionForm.value.mensaje!)
      .subscribe({
        next: (editado) => {
          this.comentarios.update((lista) => lista.map((c) => (c.id === editado.id ? editado : c)));
          this.editandoId.set(null);
        },
        error: (error) => this.errorMessage.set(apiError(error)),
      });
  }

  toggleMeGusta(publicacion: Publicacion) {
    const usuario = this.authService.currentUser();
    if (!usuario) return;

    const peticion = publicacion.meGusta.includes(usuario.id)
      ? this.publicacionesService.quitarMeGusta(publicacion.id)
      : this.publicacionesService.darMeGusta(publicacion.id);

    peticion.subscribe({
      next: (actualizada) => this.publicacion.set(actualizada),
      error: (error) => this.errorMessage.set(apiError(error)),
    });
  }

  confirmarEliminar() {
    this.aEliminar.set(false);
    this.publicacionesService.eliminar(this.id()).subscribe({
      next: () => this.router.navigate(['/publicaciones']),
      error: (error) => this.errorMessage.set(apiError(error)),
    });
  }
}