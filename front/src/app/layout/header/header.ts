import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RolDirective } from '../../shared/directives/rol.directive';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, RolDirective],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  authService = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
