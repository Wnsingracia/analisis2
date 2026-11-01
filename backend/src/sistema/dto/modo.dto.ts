import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export const MODOS = ['NORMAL', 'EXPEDIENTES_CONGELADOS', 'SOLO_LECTURA'] as const;
export type ModoSistema = (typeof MODOS)[number];

export class CambiarModoDto {
  @IsIn(MODOS, { message: `El modo debe ser uno de: ${MODOS.join(', ')}` })
  modo!: ModoSistema;

  @IsString({ message: 'Debes indicar el motivo del cambio de modo' })
  @MinLength(3, { message: 'El motivo debe tener al menos 3 caracteres' })
  @MaxLength(300)
  motivo!: string;
}
