import { Component, Input } from '@angular/core';
import { InicialesPipe } from '../../pipes/iniciales.pipe';

@Component({
  selector: 'app-avatar',
  imports: [InicialesPipe],
  templateUrl: './avatar.html',
  styleUrl: './avatar.css',
})
export class Avatar {
  @Input() imagenUrl = '';
  @Input() nombre = '';
  @Input() apellido = '';
  @Input() tamano = 44;
}