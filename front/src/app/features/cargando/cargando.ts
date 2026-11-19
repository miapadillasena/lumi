import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-cargando',
  templateUrl: './cargando.html',
  styleUrl: './cargando.css',
})
export class Cargando implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    if (!this.authService.accessToken()) {
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    this.authService.restaurarSesion().subscribe({
      next: () => this.router.navigate(['/publicaciones'], { replaceUrl: true }),
      error: () => {
        this.authService.cerrarSesion();
        this.router.navigate(['/login'], { replaceUrl: true });
      },
    });
  }
}