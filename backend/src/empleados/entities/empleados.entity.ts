import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Entity({ name: 'empleados' })
export class Empleado {
  @PrimaryColumn({ type: 'bigint', name: 'id_usuario' })
  id_usuario!: string; // int8 primary key y foreign key[cite: 5]

  @Column({ type: 'bigint', name: 'salario', nullable: true })
  salario?: string | number | null; // int8[cite: 5]

  @Column({ type: 'text', name: 'hora_ingreso', nullable: true })
  hora_ingreso?: string | null; // text nullable[cite: 5]

  @Column({ type: 'text', name: 'hora_salida', nullable: true })
  hora_salida?: string | null; // text nullable[cite: 5]

  @OneToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario?: Usuario;
}