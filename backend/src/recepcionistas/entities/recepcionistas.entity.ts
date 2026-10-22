import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
@Entity({ name: 'nombre_de_tu_tabla' }) // Reemplaza por el nombre real de esta tabla
export class Recepcionista {
  @PrimaryColumn({ type: 'bigint', name: 'id_usuario' })
  id_usuario!: string; // int8 PRIMARY FOREIGN KEY NON-NULLABLE[cite: 8]

  @Column({ type: 'text', name: 'departamento', nullable: true })
  departamento?: string | null; // text NULLABLE[cite: 8]

  @OneToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario?: Usuario;
}