import { Component, ElementRef, OnDestroy, OnInit, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Chart } from 'chart.js/auto';
import { EstadisticasService } from '../../../core/services/estadisticas.service';
import { apiError } from '../../../core/services/api-error';
import { Dato } from '../../../core/models/estadistica.interface';
import { Modal } from '../../../shared/components/modal/modal';

@Component({
  selector: 'app-estadisticas',
  imports: [ReactiveFormsModule, Modal],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.css',
})
export class Estadisticas implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private estadisticasService = inject(EstadisticasService);

  private canvasUsuarios = viewChild.required<ElementRef<HTMLCanvasElement>>('graficoUsuarios');
  private canvasDias = viewChild.required<ElementRef<HTMLCanvasElement>>('graficoDias');
  private canvasPublicaciones = viewChild.required<ElementRef<HTMLCanvasElement>>('graficoPublicaciones');

  private graficos: Chart[] = [];

  fechasForm = this.fb.group({
    desde: [new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), Validators.required],
    hasta: [new Date().toISOString().slice(0, 10), Validators.required],
  });

  totalComentarios = signal(0);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.cargar();
  }

  ngOnDestroy() {
    this.graficos.forEach((g) => g.destroy());
  }

  cargar() {
    if (this.fechasForm.invalid) return;
    const desde = this.fechasForm.value.desde!;
    const hasta = this.fechasForm.value.hasta!;

    this.graficos.forEach((g) => g.destroy());
    this.graficos = [];

    this.estadisticasService.publicacionesPorUsuario(desde, hasta).subscribe({
      next: (datos) => this.dibujar(this.canvasUsuarios(), 'bar', datos, 'Publicaciones'),
      error: (error) => this.errorMessage.set(apiError(error)),
    });
    this.estadisticasService.comentariosPorDia(desde, hasta).subscribe({
      next: (datos) => {
        this.totalComentarios.set(datos.total);
        this.dibujar(this.canvasDias(), 'line', datos.porDia, 'Comentarios');
      },
      error: (error) => this.errorMessage.set(apiError(error)),
    });
    this.estadisticasService.comentariosPorPublicacion(desde, hasta).subscribe({
      next: (datos) => this.dibujar(this.canvasPublicaciones(), 'pie', datos, 'Comentarios'),
      error: (error) => this.errorMessage.set(apiError(error)),
    });
  }

  private dibujar(canvas: ElementRef<HTMLCanvasElement>, tipo: 'bar' | 'line' | 'pie', datos: Dato[], titulo: string) {
    const colores = ['#6c4df6', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6'];
    const grafico = new Chart(canvas.nativeElement, {
      type: tipo,
      data: {
        labels: datos.map((d) => d.etiqueta),
        datasets: [
          {
            label: titulo,
            data: datos.map((d) => d.cantidad),
            backgroundColor: tipo === 'pie' ? colores : '#6c4df6',
            borderColor: '#6c4df6',
          },
        ],
      },
      options: {
        plugins: { legend: { display: tipo === 'pie' } },
        scales: tipo === 'pie' ? {} : { y: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    });
    this.graficos.push(grafico);
  }
}