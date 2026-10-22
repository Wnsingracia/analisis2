import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Entity({ name: 'veterinarios' })
export class Veterinario {
  @PrimaryColumn({ type: 'bigint', name: 'id_usuario' })
  id_usuario!: string; // int8 primary key y foreign key

  @Column({ type: 'text', name: 'especializacion', nullable: true })
  especializacion?: string | null;

  @Column({ type: 'text', name: 'titulo', nullable: true })
  titulo?: string | null;

  @OneToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario?: Usuario;
}