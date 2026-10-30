import { SetMetadata } from '@nestjs/common';

export const REQUIERE_2FA_KEY = 'requiere_2fa';

/**
 * Marca una operación de alto riesgo: además del rol, exige un código TOTP vigente
 * en la cabecera `x-codigo-2fa`. Lo comprueba RolesGuard.
 */
export const Requiere2FA = () => SetMetadata(REQUIERE_2FA_KEY, true);
