import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PublicacionesService } from '../../core/services/publicaciones.service';
import { ComentariosService } from '../../core/services/comentarios.service';
import { apiError } from '../../core/services/api-error';
import { Publicacion } from '../../core/models/publicacion.interface';
import { Comentario } from '../../core/models/comentario.interface';
import { PublicacionCard } from '../../shared/components/publicacion-card/publicacion-card';
import { Avatar } from '../../shared/components/avatar/avatar';
import { Modal } from '../../shared/components/modal/modal';

@Component({
  selector: 'app-mi-perfil',
  imports: [DatePipe, ReactiveFormsModule, RouterLink, PublicacionCard, Avatar, Modal],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil implements OnInit {
  private fb = inject(FormBuilder); // formulario para editar
  authService = inject(AuthService);
  private publicacionesService = inject(PublicacionesService);
  private comentariosService = inject(ComentariosService);

  ultimas = signal<Publicacion[]>([]); // las ultimas 3 publicaciones
  comentarios = signal<Record<string, Comentario[]>>({}); // los comentarios de cada publicacion

  editando = signal(false); // si se muestra los datos o el formulario
  isGuardando = signal(false); // deshabilita el boton mientras guarda
  archivo = signal<File | null>(null); // foto nueva
  errorMessage = signal<string | null>(null);
  exito = signal(false); // modales

  perfilForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    nombreUsuario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    fechaNacimiento: ['', [Validators.required]],
    descripcion: ['', [Validators.required, Validators.maxLength(200)]],
  }); // correo y contraseña no se pueden editar 

  get f() {
    return this.perfilForm.controls;
  }

  ngOnInit() { // al abrir la pantalla carga las publicaciones
    this.cargarPublicaciones();
  }

  private cargarPublicaciones() {
    const usuario = this.authService.currentUser();
    if (!usuario) return;
    this.publicacionesService.listar('fecha', 0, 3, usuario.id).subscribe({ // las ordena por fecha, desde la primeraa, solo las mias
      next: (respuesta) => { // para cada publicacion, sus comentarios
        this.ultimas.set(respuesta.publicaciones);
        for (const publicacion of respuesta.publicaciones) {
          this.cargarComentarios(publicacion.id); 
        }
      },
    });
  }

  private cargarComentarios(publicacionId: string) { // trae los 3 mas nuevos
    this.comentariosService.listar(publicacionId, 0, 3).subscribe({ 
      next: (respuesta) =>
        this.comentarios.update((actual) => ({ ...actual, [publicacionId]: respuesta.comentarios })),
    }); // copia lo que ya habia y agrega la lista de esta publicacion
  }

  empezarEdicion() { // lo llama el boton editar perfil
    const usuario = this.authService.currentUser();
    if (!usuario) return;
    this.perfilForm.setValue({ // carga los datos acutales en el formulario
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      nombreUsuario: usuario.nombreUsuario,
      fechaNacimiento: usuario.fechaNacimiento.slice(0, 10),
      descripcion: usuario.descripcion,
    });
    this.archivo.set(null);
    this.editando.set(true);
  }

  seleccionarArchivo(event: Event) {
    const input = event.target as HTMLInputElement;
    this.archivo.set(input.files && input.files.length > 0 ? input.files[0] : null);
  }

  guardar() {
    this.perfilForm.markAllAsTouched();
    if (this.perfilForm.invalid) return;

    const valores = this.perfilForm.value;
    const datos = new FormData();
    datos.append('nombre', valores.nombre!);
    datos.append('apellido', valores.apellido!);
    datos.append('nombreUsuario', valores.nombreUsuario!);
    datos.append('fechaNacimiento', valores.fechaNacimiento!);
    datos.append('descripcion', valores.descripcion!);
    if (this.archivo()) datos.append('imagen', this.archivo()!);

    this.isGuardando.set(true);
    this.authService.editarPerfil(datos).subscribe({
      next: (sesion) => {
        this.authService.iniciarSesion(sesion);
        this.isGuardando.set(false);
        this.editando.set(false);
        this.exito.set(true);
        this.cargarPublicaciones();
      },
      error: (error) => {
        this.errorMessage.set(apiError(error));
        this.isGuardando.set(false);
      },
    });
  }
}