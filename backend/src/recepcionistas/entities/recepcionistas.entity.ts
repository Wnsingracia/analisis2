import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
@Entity({ name: 'recepcionistas' })
export class Recepcionista {
  @PrimaryColumn({ type: 'bigint', name: 'id_usuario' })
  id_usuario!: string; // int8 PRIMARY FOREIGN KEY NON-NULLABLE[cite: 8]

  @Column({ type: 'text', name: 'departamento', nullable: true })
  departamento?: string | null; // text NULLABLE[cite: 8]

  @OneToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario?: Usuario;
}