import { Entity, PrimaryGeneratedColumn, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Cliente } from '../../clientes/entities/clientes.entity';

@Entity({ name: 'mascotas' })
export class Mascota {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id_mascota' })
  id_mascota!: string; // int8 PRIMARY IDENTITY NON-NULLABLE[cite: 7]

  @PrimaryColumn({ type: 'bigint', name: 'id_cliente' })
  id_cliente!: string; // int8 PRIMARY FOREIGN KEY NON-NULLABLE[cite: 7]

  @Column({ type: 'text', name: 'nombre', nullable: true })
  nombre?: string | null; // text nullable[cite: 7]

  @Column({ type: 'text', name: 'tipo', nullable: true })
  tipo?: string | null; // text nullable[cite: 7]

  @Column({ type: 'text', name: 'raza', nullable: true })
  raza?: string | null; // text nullable[cite: 7]

  @Column({ type: 'bigint', name: 'edad', nullable: true })
  edad?: string | number | null; // int8 nullable[cite: 7]

  @Column({ type: 'float8', name: 'peso', nullable: true })
  peso?: number | null; // float8 nullable[cite: 7]

  @Column({ type: 'float8', name: 'altura', nullable: true })
  altura?: number | null; // float8 nullable[cite: 7]

  @Column({ type: 'text', name: 'alergias', nullable: true })
  alergias?: string | null; // text nullable[cite: 7]

  @Column({ type: 'text', name: 'genero', nullable: true })
  genero?: string | null; // text nullable[cite: 7]

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'id_cliente' })
  cliente?: Cliente;
}