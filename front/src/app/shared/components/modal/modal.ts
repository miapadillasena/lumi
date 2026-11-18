import { Component, EventEmitter, Input, Output } from '@angular/core';
// muestra una ventana emergente
@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal { // todo lo que le manda al padre
  @Input() titulo = '';
  @Input() mensaje = '';
  @Input() tipo: 'exito' | 'error' = 'exito'; // pone una franaj violeta y si es error, roja
  @Input() textoAceptar = 'Aceptar';
  @Input() mostrarCancelar = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>(); // no manda ningun dato, solo avisa que paso algo

  cerrarDesdeFondo() {
    if (this.mostrarCancelar) this.cancelar.emit();
    else this.cerrar.emit();
  }
}
