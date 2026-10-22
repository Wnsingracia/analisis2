import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Veterinario } from 'src/veterinarios/entities/veterinarios.entity';
import { Cita } from 'src/citas/entities/citas.entity';
import { Mascota } from 'src/mascotas/entities/mascotas.entity';

@Entity({ name: 'consultas' })
export class Consulta {
  @PrimaryColumn({ type: 'bigint', name: 'id_cons_medica' })
  id_cons_medica!: string; // int8 PRIMARY NON-NULLABLE[cite: 10]

  @Column({ type: 'text', name: 'fecha', nullable: true })
  fecha?: string | null; // text NULLABLE[cite: 10]

  @Column({ type: 'text', name: 'hora', nullable: true })
  hora?: string | null; // text NULLABLE[cite: 10]

  @Column({ type: 'bigint', name: 'costo', nullable: true })
  costo?: string | number | null; // int8 NULLABLE[cite: 10]

  @Column({ type: 'text', name: 'especialidad', nullable: true })
  especialidad?: string | null; // text NULLABLE[cite: 10]

  @Column({ type: 'text', name: 'ambiente', nullable: true })
  ambiente?: string | null; // text NULLABLE[cite: 10]

  @Column({ type: 'bigint', name: 'id_veterinario', nullable: true })
  id_veterinario?: string | null; // int8 FOREIGN KEY NULLABLE[cite: 10]

  @Column({ type: 'bigint', name: 'id_cita', nullable: true })
  id_cita?: string | null; // int8 FOREIGN KEY NULLABLE[cite: 10]

  @Column({ type: 'bigint', name: 'idMascota', nullable: true })
  idMascota?: string | null; // int8 NULLABLE[cite: 10]

  // Relaciones
  @ManyToOne(() => Veterinario, { nullable: true })
  @JoinColumn({ name: 'id_veterinario' })
  veterinario?: Veterinario;

  @ManyToOne(() => Cita, { nullable: true })
  @JoinColumn({ name: 'id_cita' })
  cita?: Cita;

  @ManyToOne(() => Mascota, { nullable: true })
  @JoinColumn({ name: 'idMascota' })
  mascota?: Mascota;
}