import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
@Entity({ name: 'clientes' })
export class Cliente {
  @PrimaryColumn({ type: 'bigint', name: 'id_usuario' })
  id_usuario!: string; // int8 primary key y foreign key

  @Column({ type: 'text', name: 'nro_cuenta', nullable: true })
  nro_cuenta?: string | null;

  @Column({ type: 'text', name: 'direccion', nullable: true })
  direccion?: string | null;

  @Column({ type: 'bigint', name: 'nit', nullable: true })
  nit?: string | null; // int8

  @OneToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario?: Usuario;
}