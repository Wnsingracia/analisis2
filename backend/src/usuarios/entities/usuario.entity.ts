import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'usuarios' }) // Reemplaza por el nombre real de tu tabla en la base de datos
export class Usuario {
  @PrimaryColumn({ type: 'bigint', name: 'id_usuario' })
  id_usuario: string = ""; // int8 en JS se mapea comúnmente a string para evitar desbordamiento

  @Column({ type: 'text', name: 'nombres', nullable: true })
  nombres: string = "";

  @Column({ type: 'text', name: 'ap_pat', nullable: true })
  ap_pat: string = "";

  @Column({ type: 'text', name: 'ap_mat', nullable: true })
  ap_mat: string = "";

  @Column({ type: 'bigint', name: 'cel', nullable: true })
  cel: number = 0; // int8

  @Column({ type: 'text', name: 'correo', nullable: true })
  correo: string = "";

  @Column({ type: 'text', name: 'genero', nullable: true })
  genero: string = "";

  @Column({ type: 'text', name: 'contrasenia', nullable: true })
  contrasenia: string= "";

  @Column({ type: 'text', name: 'tipo_usuario', nullable: true })
  tipo_usuario: string = "";

  @Column({ type: 'text', name: 'reset_token', nullable: true })
  reset_token: string = "";

  @Column({ type: 'text', name: 'reset_token_expira', nullable: true })
  reset_token_expira: string= "";

  @Column({ type: 'bigint', name: 'intentos_fallidos', nullable: true })
  intentos_fallidos:  number =0; // int8

  @Column({ type: 'text', name: 'bloqueado_hasta', nullable: true })
  bloqueado_hasta: string = "";

  @Column({ type: 'timestamptz', name: 'fecha_creacion', nullable: true })
  fecha_creacion?: Date;
}