import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
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

  ngOnInit() {
    if (!this.authService.accessToken()) { // si no hay un token guardado, va directo al login
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    this.authService.restaurarSesion().subscribe({ // si hay token llama al servicio, si es valido, devulve los datos del usuario y se guarda en currentUser
      next: () => this.router.navigate(['/publicaciones'], { replaceUrl: true }), // sale todo bien, me manda a publicaciones
      error: () => { 
        this.authService.cerrarSesion(); 
        this.router.navigate(['/login'], { replaceUrl: true });
      }, // el token esta vencido y el back dio 401, se cierra la sesion
    });
  } 
}