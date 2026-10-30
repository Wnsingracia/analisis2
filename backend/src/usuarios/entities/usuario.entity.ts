import { Entity, PrimaryColumn, Column } from 'typeorm';

// pg devuelve int8 como string; esto lo convierte a number
const bigintANumber = {
  to: (valor: number | null) => valor,
  from: (valor: string | null) => (valor === null ? null : Number(valor)),
};

@Entity({ name: 'usuarios' })
export class Usuario {
  @PrimaryColumn({ type: 'bigint', name: 'id_usuario' })
  id_usuario: string = '';

  @Column({ type: 'text', name: 'nombres', nullable: true })
  nombres: string = '';

  @Column({ type: 'text', name: 'ap_pat', nullable: true })
  ap_pat: string = '';

  @Column({ type: 'text', name: 'ap_mat', nullable: true })
  ap_mat: string = '';

  @Column({
    type: 'bigint',
    name: 'cel',
    nullable: true,
    transformer: bigintANumber,
  })
  cel: number | null = null;

  @Column({ type: 'text', name: 'correo', nullable: true })
  correo: string = '';

  @Column({ type: 'text', name: 'genero', nullable: true })
  genero: string = '';

  @Column({ type: 'text', name: 'contrasenia', nullable: true })
  contrasenia: string = '';

  @Column({ type: 'text', name: 'tipo_usuario', nullable: true })
  tipo_usuario: string = '';

  @Column({ type: 'text', name: 'reset_token', nullable: true })
  reset_token: string | null = null;

  @Column({ type: 'text', name: 'reset_token_expira', nullable: true })
  reset_token_expira: string | null = null;

  @Column({
    type: 'bigint',
    name: 'intentos_fallidos',
    nullable: true,
    transformer: bigintANumber,
  })
  intentos_fallidos: number | null = 0;

  @Column({ type: 'text', name: 'bloqueado_hasta', nullable: true })
  bloqueado_hasta: string | null = null;

  @Column({ type: 'timestamptz', name: 'fecha_creacion', nullable: true })
  fecha_creacion?: Date;

  // Ciclo de vida de la identidad: ACTIVA, SUSPENDIDA o REVOCADA
  @Column({ type: 'text', name: 'estado', default: 'ACTIVA' })
  estado: string = 'ACTIVA';

  @Column({ type: 'text', name: 'motivo_estado', nullable: true })
  motivo_estado: string | null = null;

  @Column({ type: 'timestamptz', name: 'fecha_estado', nullable: true })
  fecha_estado: Date | null = null;

  // Revocación de sesiones: el JWT lleva esta versión; al subirla, los tokens viejos dejan de valer
  @Column({ type: 'int', name: 'token_version', default: 0 })
  token_version: number = 0;

  // Segundo factor (TOTP). El secreto se guarda cifrado (AES-256-GCM)
  @Column({ type: 'text', name: 'totp_secreto', nullable: true })
  totp_secreto: string | null = null;

  @Column({ type: 'boolean', name: 'totp_activo', default: false })
  totp_activo: boolean = false;

  // Último paso de tiempo aceptado (evita reutilizar un mismo código)
  @Column({ type: 'bigint', name: 'totp_ultimo_paso', nullable: true, transformer: bigintANumber })
  totp_ultimo_paso: number | null = null;

  // Cuenta de emergencia (break-glass): ADMIN en reposo (SUSPENDIDA) que solo se activa ante un incidente
  @Column({ type: 'boolean', name: 'es_emergencia', default: false })
  es_emergencia: boolean = false;
}
