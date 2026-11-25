import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { apiError } from '../../../core/services/api-error';
import { Modal } from '../../../shared/components/modal/modal';
// pantalla de login
@Component({
  selector: 'app-login', 
  imports: [ReactiveFormsModule, RouterLink, Modal],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService); // llamar al back
  private router = inject(Router); // navegar a otra pantalla

  loginForm = this.fb.group({
    correo: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/)],
    ],
  });

  isLoading = signal(false); // esperando la respuesta del back
  errorMessage = signal<string | null>(null); //guarda el texto del error 

  get f() {
    return this.loginForm.controls;
  }
  
  accesoRapido(perfil: 'administrador' | 'usuario') {
    const cuentas = {
      administrador: { correo: 'admin@lumi.com', password: 'Admin1234' },
      usuario: { correo: 'usuario@lumi.com', password: 'Usuario1234' },
    };
    this.loginForm.setValue(cuentas[perfil]);
    this.onSubmit();
  }

  onSubmit() { // se ejecuta al poner ingresar
    this.loginForm.markAllAsTouched(); // marca todos los campos como tocados asi aparecen todos los mensajes de error
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    const { correo, password } = this.loginForm.value;

    this.authService.login(correo!, password!).subscribe({
       next: (sesion) => {
        this.authService.iniciarSesion(sesion);
        this.isLoading.set(false);
        this.router.navigate(['/publicaciones']);
      },
      error: (error) => {
        this.errorMessage.set(apiError(error));
        this.isLoading.set(false);
      },
    });
  }
}
