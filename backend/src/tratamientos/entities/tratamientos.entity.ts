import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Consulta } from 'src/consultas/entities/consultas.entity';

@Entity({ name: 'tratamientos' })
export class Tratamiento {
  @PrimaryColumn({ type: 'bigint', name: 'id_tratamiento' })
  id_tratamiento!: string; // int8 PRIMARY NON-NULLABLE[cite: 11]

  @Column({ type: 'text', name: 'descripcion', nullable: true })
  descripcion?: string | null; // text NULLABLE[cite: 11]

  @Column({ type: 'text', name: 'fecha_emision', nullable: true })
  fecha_emision?: string | null; // text NULLABLE[cite: 11]

  @Column({ type: 'bigint', name: 'id_cons_medica', nullable: true })
  id_cons_medica?: string | null; // int8 FOREIGN KEY NULLABLE[cite: 11]

  @ManyToOne(() => Consulta, { nullable: true })
  @JoinColumn({ name: 'id_cons_medica' })
  consulta?: Consulta;
}