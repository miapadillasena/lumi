import { Directive, ElementRef, HostListener, inject, input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appCopiar]',
  host: {
    '[style.cursor]': '"pointer"',
    '[title]': '"Clic para copiar"',
  },
})
export class CopiarDirective {
  texto = input.required<string>({ alias: 'appCopiar' });

  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  @HostListener('click') async onClick() {
    try {
      await navigator.clipboard.writeText(this.texto());
      this.avisar('¡Copiado!');
    } catch {
      this.avisar('No se pudo copiar');
    }
  }

  private avisar(mensaje: string) {
    const original = this.el.nativeElement.textContent;
    this.renderer.setProperty(this.el.nativeElement, 'textContent', mensaje);
    setTimeout(() => {
      this.renderer.setProperty(this.el.nativeElement, 'textContent', original);
    }, 1000);
  }
}