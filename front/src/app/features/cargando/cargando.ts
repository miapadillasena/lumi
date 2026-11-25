import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
// pantalla de carga
@Component({
  selector: 'app-cargando',
  templateUrl: './cargando.html',
  styleUrl: './cargando.css',
})
export class Cargando implements OnInit { // se ejecuta una sola vez apenas se crea el componente
  private authService = inject(AuthService); 
  private router = inject(Router); // para navegar
  private route = inject(ActivatedRoute);

  ngOnInit() {
    if (!this.authService.accessToken()) { // si no hay un token guardado, va directo al login
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

        const volver = this.route.snapshot.queryParamMap.get('volver') ?? '/publicaciones';

    this.authService.restaurarSesion().subscribe({
      next: () => this.router.navigateByUrl(volver, { replaceUrl: true }),
      error: () => { 
        this.authService.cerrarSesion(); 
        this.router.navigate(['/login'], { replaceUrl: true });
      }, // el token esta vencido y el back dio 401, se cierra la sesion
    });
  } 
}