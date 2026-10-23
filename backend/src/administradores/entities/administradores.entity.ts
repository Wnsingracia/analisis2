import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Entity({ name: 'administradores' }) 
export class Administradores {
  @PrimaryColumn({ type: 'bigint', name: 'id_usuario' })
  id_usuario: number = 0;

  @Column({ type: 'text', name: 'nvl_acceso', nullable: true })
  nvl_acceso: string = "";

  @OneToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario?: Usuario;
}