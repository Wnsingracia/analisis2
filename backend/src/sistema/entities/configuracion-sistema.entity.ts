import { Column, Entity, PrimaryColumn } from 'typeorm';

/** Configuración de ejecución del sistema (por ahora, el modo de operación). */
@Entity({ name: 'configuracion_sistema' })
export class ConfiguracionSistema {
  @PrimaryColumn({ type: 'text', name: 'clave' })
  clave!: string;

  @Column({ type: 'text', name: 'valor' })
  valor!: string;

  @Column({ type: 'text', name: 'motivo', nullable: true })
  motivo!: string | null;

  @Column({ type: 'bigint', name: 'actualizado_por', nullable: true })
  actualizado_por!: string | null;

  @Column({ type: 'timestamptz', name: 'fecha', default: () => 'now()' })
  fecha!: Date;
}
