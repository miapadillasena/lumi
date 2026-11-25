export interface Dato {
  etiqueta: string;
  cantidad: number;
}

export interface ComentariosPorDia {
  total: number;
  porDia: Dato[];
}