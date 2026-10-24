import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Cliente } from '../../clientes/entities/clientes.entity';
import { Mascota } from '../../mascotas/entities/mascotas.entity';
import { Recepcionista } from '../../recepcionistas/entities/recepcionistas.entity'; // O la entidad correspondiente a recepcionista/empleado

@Entity({ name: 'citas' })
export class Cita {
  @PrimaryColumn({ type: 'bigint', name: 'id_cita' })
  id_cita!: string; // int8 PRIMARY NON-NULLABLE[cite: 9]

  @Column({ type: 'text', name: 'fecha', nullable: true })
  fecha?: string | null; //[cite: 9]

  @Column({ type: 'text', name: 'hora', nullable: true })
  hora?: string | null; //[cite: 9]

  @Column({ type: 'text', name: 'tipo', nullable: true })
  tipo?: string | null; //[cite: 9]

  @Column({ type: 'text', name: 'descripcion', nullable: true })
  descripcion?: string | null; //[cite: 9]

  @Column({ type: 'bigint', name: 'costo', nullable: true })
  costo?: string | number | null; // int8 NULLABLE[cite: 9]

  @Column({ type: 'bigint', name: 'id_mascota', nullable: true })
  id_mascota?: string | null; // int8 NULLABLE[cite: 9]

  @Column({ type: 'bigint', name: 'id_cliente', nullable: true })
  id_cliente?: string | null; // int8 FOREIGN KEY NULLABLE[cite: 9]

  @Column({ type: 'bigint', name: 'id_recepcionista', nullable: true })
  id_recepcionista?: string | null; // int8 FOREIGN KEY NULLABLE[cite: 9]

  // Relaciones explícitas con las otras tablas
  @ManyToOne(() => Mascota, { nullable: true })
  @JoinColumn({ name: 'id_mascota', referencedColumnName: 'id_mascota' })
  mascota?: Mascota;

  @ManyToOne(() => Cliente, { nullable: true })
  @JoinColumn({ name: 'id_cliente' })
  cliente?: Cliente;

  @ManyToOne(() => Recepcionista, { nullable: true })
  @JoinColumn({ name: 'id_recepcionista' })
  recepcionista?: Recepcionista;
}