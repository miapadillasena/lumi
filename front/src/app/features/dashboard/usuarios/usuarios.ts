import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { apiError } from '../../../core/services/api-error';
import { Usuario } from '../../../core/models/usuario.interface';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { Modal } from '../../../shared/components/modal/modal';
import { EstadoUsuarioPipe } from '../../../shared/pipes/estado-usuario.pipe';
import { ResaltarDirective } from '../../../shared/directives/resaltar.directive';
import { CopiarDirective } from '../../../shared/directives/copiar.directive';

@Component({
  selector: 'app-usuarios',
  imports: [ReactiveFormsModule, Avatar, Modal, EstadoUsuarioPipe, ResaltarDirective, CopiarDirective],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios implements OnInit {
  private fb = inject(FormBuilder);
  private usuariosService = inject(UsuariosService);
  authService = inject(AuthService);

  usuarios = signal<Usuario[]>([]);
  isLoading = signal(true);
  isCreando = signal(false);
  archivo = signal<File | null>(null);
  aDeshabilitar = signal<Usuario | null>(null);
  errorMessage = signal<string | null>(null);
  exito = signal<string | null>(null);

  usuarioForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    correo: ['', [Validators.required, Validators.email]],
    nombreUsuario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/)]],
    repetirPassword: ['', [Validators.required]],
    fechaNacimiento: ['', [Validators.required]],
    descripcion: ['', [Validators.required, Validators.maxLength(200)]],
    perfil: ['usuario', [Validators.required]],
  });

  get f() {
    return this.usuarioForm.controls;
  }

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.usuariosService.listar().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(apiError(error));
        this.isLoading.set(false);
      },
    });
  }

  passwordsDistintas() {
    return this.f.repetirPassword.value !== this.f.password.value;
  }

  seleccionarArchivo(event: Event) {
    const input = event.target as HTMLInputElement;
    this.archivo.set(input.files && input.files.length > 0 ? input.files[0] : null);
  }

  crear(input: HTMLInputElement) {
    this.usuarioForm.markAllAsTouched();
    if (this.usuarioForm.invalid || this.passwordsDistintas()) return;

    const valores = this.usuarioForm.value;
    const datos = new FormData();
    datos.append('nombre', valores.nombre!);
    datos.append('apellido', valores.apellido!);
    datos.append('correo', valores.correo!);
    datos.append('nombreUsuario', valores.nombreUsuario!);
    datos.append('password', valores.password!);
    datos.append('fechaNacimiento', valores.fechaNacimiento!);
    datos.append('descripcion', valores.descripcion!);
    datos.append('perfil', valores.perfil!);
    if (this.archivo()) datos.append('imagen', this.archivo()!);

    this.isCreando.set(true);
    this.usuariosService.crear(datos).subscribe({
      next: (usuario) => {
        this.usuarios.update((lista) => [...lista, usuario]);
        this.usuarioForm.reset({ perfil: 'usuario' });
        this.archivo.set(null);
        input.value = '';
        this.isCreando.set(false);
        this.exito.set(`Se creó el usuario @${usuario.nombreUsuario}.`);
      },
      error: (error) => {
        this.errorMessage.set(apiError(error));
        this.isCreando.set(false);
      },
    });
  }

  confirmarDeshabilitar() {
    const usuario = this.aDeshabilitar();
    if (!usuario) return;
    this.aDeshabilitar.set(null);
    this.usuariosService.deshabilitar(usuario.id).subscribe({
      next: (actualizado) => this.reemplazar(actualizado),
      error: (error) => this.errorMessage.set(apiError(error)),
    });
  }

  habilitar(usuario: Usuario) {
    this.usuariosService.habilitar(usuario.id).subscribe({
      next: (actualizado) => this.reemplazar(actualizado),
      error: (error) => this.errorMessage.set(apiError(error)),
    });
  }

  private reemplazar(actualizado: Usuario) {
    this.usuarios.update((lista) => lista.map((u) => (u.id === actualizado.id ? actualizado : u)));
  }
}