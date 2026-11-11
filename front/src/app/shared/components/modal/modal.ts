import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  @Input() titulo = '';
  @Input() mensaje = '';
  @Input() tipo: 'exito' | 'error' = 'exito';
  @Input() textoAceptar = 'Aceptar';
  @Input() mostrarCancelar = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  cerrarDesdeFondo() {
    if (this.mostrarCancelar) this.cancelar.emit();
    else this.cerrar.emit();
  }
}
