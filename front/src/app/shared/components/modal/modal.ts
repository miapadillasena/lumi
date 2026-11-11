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
  @Output() cerrar = new EventEmitter<void>();
}
