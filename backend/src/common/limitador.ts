/** Contador en memoria de eventos por clave dentro de una ventana de tiempo. */
export class LimitadorVentana {
  private readonly eventos = new Map<string, number[]>();

  constructor(
    private readonly max: number,
    private readonly ventanaMs: number,
  ) {}

  private vigentes(clave: string): number[] {
    const ahora = Date.now();
    const lista = (this.eventos.get(clave) ?? []).filter((t) => ahora - t < this.ventanaMs);
    if (lista.length) this.eventos.set(clave, lista);
    else this.eventos.delete(clave);
    return lista;
  }

  excedido(clave: string): boolean {
    return this.vigentes(clave).length >= this.max;
  }

  registrar(clave: string): void {
    const lista = this.vigentes(clave);
    lista.push(Date.now());
    this.eventos.set(clave, lista);
    if (this.eventos.size > 10000) this.limpiar();
  }

  reiniciar(clave: string): void {
    this.eventos.delete(clave);
  }

  private limpiar() {
    for (const clave of [...this.eventos.keys()]) this.vigentes(clave);
  }
}
