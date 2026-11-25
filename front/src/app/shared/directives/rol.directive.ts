import { Directive, effect, inject, Input, signal, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Directive({
  selector: '[appRol]',
})
export class RolDirective {
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(AuthService);

  private rolRequerido = signal('');

  @Input() set appRol(rol: string) {
    this.rolRequerido.set(rol);
  }

  constructor() {
    effect(() => {
      const usuario = this.authService.currentUser();
      const rol = this.rolRequerido();

      this.viewContainer.clear();

      if (usuario && usuario.perfil === rol) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    });
  }
}