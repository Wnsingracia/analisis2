import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Registro de auditoría: solo se inserta, nunca se modifica ni se borra. */
@Entity({ name: 'auditoria' })
export class Auditoria {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id_evento' })
  id_evento!: string;

  // La fecha la pone la base de datos (default now()), no la aplicación
  @Column({ type: 'timestamptz', name: 'fecha', insert: false, update: false })
  fecha!: Date;

  // Quién ejecutó la acción (sin FK: el registro sobrevive aunque el usuario cambie)
  @Column({ type: 'bigint', name: 'id_usuario', nullable: true })
  id_usuario?: string | null;

  @Column({ type: 'text', name: 'rol', nullable: true })
  rol?: string | null;

  @Column({ type: 'text', name: 'evento' })
  evento!: string;

  @Column({ type: 'text', name: 'recurso', nullable: true })
  recurso?: string | null;

  @Column({ type: 'text', name: 'resultado' })
  resultado!: string;

  @Column({ type: 'text', name: 'ip', nullable: true })
  ip?: string | null;

  @Column({ type: 'jsonb', name: 'detalle', nullable: true })
  detalle?: Record<string, unknown> | null;
}
