import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { apiError } from '../../../core/services/api-error';
import { Modal } from '../../../shared/components/modal/modal';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, Modal],
  templateUrl: './login.html',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    correo: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/)],
    ],
  });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    const { correo, password } = this.loginForm.value;

    this.authService.login(correo!, password!).subscribe({
      next: (usuario) => {
        this.authService.iniciarSesion(usuario);
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
