import type { Repository } from 'typeorm';
import type { Usuario } from '../usuarios/entities/usuario.entity';
import type { AuditoriaService } from '../auditoria/auditoria.service';

// Cuenta de emergencia ("break-glass"): una cuenta ADMIN que permanece SUSPENDIDA
// y solo se activa, con motivo y auditoría, ante un incidente.
export const HORAS_ACTIVA_EMERGENCIA = 2; // pasado este tiempo vuelve a suspenderse sola
export const MINUTOS_SESION_EMERGENCIA = 30; // sus sesiones son cortas

export function emergenciaVencida(u: {
  es_emergencia?: boolean;
  estado?: string;
  fecha_estado?: Date | string | null;
}): boolean {
  if (!u.es_emergencia || u.estado !== 'ACTIVA') return false;
  if (!u.fecha_estado) return true; // activa sin haber pasado por el procedimiento
  return Date.now() - new Date(u.fecha_estado).getTime() > HORAS_ACTIVA_EMERGENCIA * 3600_000;
}

/** Vuelve a suspender una cuenta de emergencia cuya ventana terminó y cierra sus sesiones. */
export async function expirarEmergencia(
  repo: Repository<Usuario>,
  auditoria: AuditoriaService,
  idUsuario: string,
): Promise<void> {
  await repo.update(idUsuario, {
    estado: 'SUSPENDIDA',
    motivo_estado: 'Ventana de emergencia vencida (suspensión automática)',
    fecha_estado: new Date(),
    token_version: () => 'token_version + 1',
  } as any);
  await auditoria.registrar({
    evento: 'EMERGENCIA_EXPIRADA',
    recurso: `usuarios/${idUsuario}`,
    id_usuario: null,
    rol: 'sistema',
    detalle: { horas_ventana: HORAS_ACTIVA_EMERGENCIA },
  });
}
