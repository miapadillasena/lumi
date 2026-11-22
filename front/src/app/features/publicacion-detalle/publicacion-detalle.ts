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
// pagina de una publicacion
@Component({
  selector: 'app-publicacion-detalle',
  imports: [DatePipe, ReactiveFormsModule, RouterLink, PublicacionCard, Modal, Avatar],
  templateUrl: './publicacion-detalle.html',
  styleUrl: './publicacion-detalle.css',
})
export class PublicacionDetalle implements OnInit {
  id = input.required<string>(); // se lee con this.id()

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private publicacionesService = inject(PublicacionesService);
  private comentariosService = inject(ComentariosService);
  authService = inject(AuthService); // HTML lo usa para saber cuales comentarios son mios

  readonly porCarga = 5; // cuantos comentarios traigo
 
  publicacion = signal<Publicacion | null>(null); // lo que se muestra
  comentarios = signal<Comentario[]>([]);
  hayMas = signal(false); // si se muestra el boton de cargar mas
  isLoading = signal(true);
  isCargandoMas = signal(false);
  isEnviando = signal(false); // para mostrar el cargando, y desactiva los botones mientras
  editandoId = signal<string | null>(null); // el id del comentario que estoy editando, o null si ninguno
  errorMessage = signal<string | null>(null);
  aEliminar = signal(false); // 

  comentarioForm = this.fb.group({
    mensaje: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(500)]],
  }); // formulario para comentar
  edicionForm = this.fb.group({
    mensaje: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(500)]],
  }); // y este para editar

  ngOnInit() {
    this.publicacionesService.obtener(this.id()).subscribe({ // pide la publicacion
      next: (publicacion) => {
        this.publicacion.set(publicacion);
        this.isLoading.set(false);
        this.cargarComentarios();
      }, // la guarda y despues carga los comentarios
      error: (error) => {
        this.errorMessage.set(apiError(error));
        this.isLoading.set(false); // muestra el modal
      },
    });
  }

  cargarComentarios() {
    this.isCargandoMas.set(true);
    const offset = this.comentarios().length; // pido a partid d elos que ya tengo
    this.comentariosService.listar(this.id(), offset, this.porCarga).subscribe({
      next: (respuesta) => {
        const ids = new Set(this.comentarios().map((c) => c.id));
        const nuevos = respuesta.comentarios.filter((c) => !ids.has(c.id));
        this.comentarios.update((lista) => [...lista, ...nuevos]); // agrega los nuevos al final
        this.hayMas.set(respuesta.hasNext); // si el back dice que no hay mas, el boton desaparece
        this.isCargandoMas.set(false);
      },
      error: (error) => {
        this.errorMessage.set(apiError(error));
        this.isCargandoMas.set(false);
      },
    });
  }

  comentar() {
    this.comentarioForm.markAllAsTouched(); // si esta vacion muestra error
    if (this.comentarioForm.invalid) return;

    this.isEnviando.set(true);
    this.comentariosService.crear(this.id(), this.comentarioForm.value.mensaje!).subscribe({
      next: (comentario) => {
        this.comentarios.update((lista) => [comentario, ...lista]); // el nuevo va al principio, por ser mas reciente
        this.comentarioForm.reset();
        this.isEnviando.set(false);
      },
      error: (error) => {
        this.errorMessage.set(apiError(error));
        this.isEnviando.set(false);
      },
    });
  }

  empezarEdicion(comentario: Comentario) { // marca que comentaro edito y carga su exto en el formulario con setValue
    this.editandoId.set(comentario.id);
    this.edicionForm.setValue({ mensaje: comentario.mensaje });
  }

  guardarEdicion(comentario: Comentario) { // manda el texto nuevo como PUT
    this.edicionForm.markAllAsTouched();
    if (this.edicionForm.invalid) return;

    this.comentariosService
      .editar(this.id(), comentario.id, this.edicionForm.value.mensaje!)
      .subscribe({
        next: (editado) => {
          this.comentarios.update((lista) => lista.map((c) => (c.id === editado.id ? editado : c))); // recorre la lista y reemplaza el comentario con el mismo id
          this.editandoId.set(null); // cierra la edicion
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