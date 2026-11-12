import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'dispositivos_autorizados' })
export class Dispositivo {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id_dispositivo',
  })
  id_dispositivo!: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'nombre',
  })
  nombre!: string;

  @Column({
    type: 'text',
    name: 'clave_publica',
    unique: true,
  })
  clave_publica!: string;

  @Column({
    type: 'boolean',
    name: 'activo',
    default: true,
  })
  activo!: boolean;

  @CreateDateColumn({
    type: 'timestamptz',
    name: 'fecha_registro',
    default: () => 'NOW()',
  })
  fecha_registro!: Date;
}