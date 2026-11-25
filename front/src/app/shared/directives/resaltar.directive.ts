import { Directive, ElementRef, HostListener, inject, input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appResaltar]',
})
export class ResaltarDirective {
  appResaltar = input<string>('#f3f0ff');

  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  @HostListener('mouseenter') onMouseEnter() {
    this.resaltar(this.appResaltar());
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.resaltar('');
  }

  private resaltar(color: string) {
    this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', color);
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'background-color 0.2s ease');
  }
}