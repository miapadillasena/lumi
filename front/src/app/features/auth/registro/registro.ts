import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { apiError } from '../../../core/services/api-error';
import { Modal } from '../../../shared/components/modal/modal';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, Modal],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registroForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    correo: ['', [Validators.required, Validators.email]],
    nombreUsuario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    password: [
      '',
      [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/)],
    ],
    repetirPassword: ['', [Validators.required]],
    fechaNacimiento: ['', [Validators.required]],
    descripcion: ['', [Validators.required, Validators.maxLength(200)]],
  });

  archivo = signal<File | null>(null);
  archivoTocado = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  exito = signal(false);

  get f() {
    return this.registroForm.controls;
  }

  passwordsDistintas() {
    return this.f.repetirPassword.value !== this.f.password.value;
  }

  seleccionarArchivo(event: Event) {
    const input = event.target as HTMLInputElement;
    this.archivoTocado.set(true);
    if (!input.files || input.files.length === 0) {
      this.archivo.set(null);
      return;
    }
    this.archivo.set(input.files[0]);
  }

  onSubmit() {
    this.registroForm.markAllAsTouched();
    this.archivoTocado.set(true);
    if (this.registroForm.invalid || this.passwordsDistintas() || !this.archivo()) return;

    this.isLoading.set(true);
    const valores = this.registroForm.value;

    const datos = new FormData();
    datos.append('nombre', valores.nombre!);
    datos.append('apellido', valores.apellido!);
    datos.append('correo', valores.correo!);
    datos.append('nombreUsuario', valores.nombreUsuario!);
    datos.append('password', valores.password!);
    datos.append('fechaNacimiento', valores.fechaNacimiento!);
    datos.append('descripcion', valores.descripcion!);
    datos.append('imagen', this.archivo()!);

    this.authService.registro(datos).subscribe({
      next: (usuario) => {
        this.authService.iniciarSesion(usuario);
        this.isLoading.set(false);
        this.exito.set(true);
      },
      error: (error) => {
        this.errorMessage.set(apiError(error));
        this.isLoading.set(false);
      },
    });
  }

  irAPublicaciones() {
    this.exito.set(false);
    this.router.navigate(['/publicaciones']);
  }
}
