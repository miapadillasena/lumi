import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PublicacionesService } from '../../core/services/publicaciones.service';
import { apiError } from '../../core/services/api-error';
import { Publicacion } from '../../core/models/publicacion.interface';
import { PublicacionCard } from '../../shared/components/publicacion-card/publicacion-card';
import { Modal } from '../../shared/components/modal/modal';

@Component({
  selector: 'app-publicaciones',
  imports: [ReactiveFormsModule, RouterLink, PublicacionCard, Modal],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones implements OnInit {
  private fb = inject(FormBuilder);
  private publicacionesService = inject(PublicacionesService);
  authService = inject(AuthService);

  readonly porPagina = 5;

  publicaciones = signal<Publicacion[]>([]);
  total = signal(0);
  pagina = signal(1);
  orden = signal('fecha');
  isLoading = signal(false);
  isPublicando = signal(false);
  errorMessage = signal<string | null>(null);
  aEliminar = signal<Publicacion | null>(null);
  archivo = signal<File | null>(null);

  publicacionForm = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(100)]],
    mensaje: ['', [Validators.required, Validators.maxLength(1000)]],
  });

  get f() {
    return this.publicacionForm.controls;
  }

  ngOnInit() {
    this.cargar();
  }

  totalPaginas() {
    return Math.max(1, Math.ceil(this.total() / this.porPagina));
  }

  cargar() {
    this.isLoading.set(true);
    const offset = (this.pagina() - 1) * this.porPagina;
    this.publicacionesService.listar(this.orden(), offset, this.porPagina).subscribe({
      next: (respuesta) => {
        this.publicaciones.set(respuesta.publicaciones);
        this.total.set(respuesta.total);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(apiError(error));
        this.isLoading.set(false);
      },
    });
  }

  cambiarOrden(event: Event) {
    this.orden.set((event.target as HTMLSelectElement).value);
    this.pagina.set(1);
    this.cargar();
  }

  irAPagina(numero: number) {
    this.pagina.set(numero);
    this.cargar();
  }

  seleccionarArchivo(event: Event) {
    const input = event.target as HTMLInputElement;
    this.archivo.set(input.files && input.files.length > 0 ? input.files[0] : null);
  }

  publicar(input: HTMLInputElement) {
    const usuario = this.authService.currentUser();
    if (!usuario) return;
    this.publicacionForm.markAllAsTouched();
    if (this.publicacionForm.invalid) return;

    const datos = new FormData();
    datos.append('usuarioId', usuario.id);
    datos.append('titulo', this.publicacionForm.value.titulo!);
    datos.append('mensaje', this.publicacionForm.value.mensaje!);
    if (this.archivo()) datos.append('imagen', this.archivo()!);

    this.isPublicando.set(true);
    this.publicacionesService.crear(datos).subscribe({
      next: () => {
        this.publicacionForm.reset();
        this.archivo.set(null);
        input.value = '';
        this.isPublicando.set(false);
        this.orden.set('fecha');
        this.pagina.set(1);
        this.cargar();
      },
      error: (error) => {
        this.errorMessage.set(apiError(error));
        this.isPublicando.set(false);
      },
    });
  }

  toggleMeGusta(publicacion: Publicacion) {
    const usuario = this.authService.currentUser();
    if (!usuario) return;

    const peticion = publicacion.meGusta.includes(usuario.id)
      ? this.publicacionesService.quitarMeGusta(publicacion.id, usuario.id)
      : this.publicacionesService.darMeGusta(publicacion.id, usuario.id);

    peticion.subscribe({
      next: (actualizada) => {
        this.publicaciones.update((lista) =>
          lista.map((p) => (p.id === actualizada.id ? actualizada : p)),
        );
      },
      error: (error) => this.errorMessage.set(apiError(error)),
    });
  }

  confirmarEliminar() {
    const publicacion = this.aEliminar();
    const usuario = this.authService.currentUser();
    if (!publicacion || !usuario) return;

    this.publicacionesService.eliminar(publicacion.id, usuario.id).subscribe({
      next: () => {
        this.aEliminar.set(null);
        if (this.publicaciones().length === 1 && this.pagina() > 1) {
          this.pagina.update((p) => p - 1);
        }
        this.cargar();
      },
      error: (error) => {
        this.aEliminar.set(null);
        this.errorMessage.set(apiError(error));
      },
    });
  }
}
