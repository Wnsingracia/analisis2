import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailerService {
  private readonly resend: Resend;
  private readonly logger = new Logger(MailerService.name);

  constructor() {
    // Acepta los dos nombres habituales de la variable (en Render / .env)
    const apiKey = process.env.RESEND_API_KEY ?? process.env.API_KEY;
    if (!apiKey) {
      // Sin clave el SDK de Resend lanza "Missing API key" al construirse: se avisa con claridad
      throw new Error('Falta la clave de Resend: define API_KEY (o RESEND_API_KEY) en las variables de entorno.');
    }
    this.resend = new Resend(apiKey);
  }

  async enviarCorreoRestablecimiento(destinatario: string, resetUrl: string): Promise<void> {
    // Con onboarding@resend.dev (modo pruebas) Resend SOLO entrega al correo dueño de la cuenta.
    // Para enviar a cualquier usuario hay que verificar un dominio en resend.com/domains y
    // definir RESEND_FROM_EMAIL, p. ej. "VetCare <no-reply@tudominio.com>".
    const remitente = process.env.RESEND_FROM_EMAIL || 'VetCare <onboarding@resend.dev>';

    let respuesta;
    try {
      respuesta = await this.resend.emails.send({
        from: remitente,
        to: [destinatario],
        subject: 'Restablecimiento de contraseña - VetCare',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #1e3a8a;">Recuperación de Contraseña - VetCare</h2>
            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
            <p>Haz clic en el siguiente botón para crear una nueva contraseña (este enlace expirará en <strong>15 minutos</strong>):</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${resetUrl}"
                 style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Restablecer Contraseña
              </a>
            </div>
            <p style="font-size: 13px; color: #6b7280;">
              Si no solicitaste este cambio, puedes ignorar este correo de forma segura. Tu contraseña actual no será modificada.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="font-size: 12px; color: #9ca3af;">
              Si el botón no funciona, copia y pega este enlace en tu navegador:<br/>
              <a href="${resetUrl}" style="color: #2563eb;">${resetUrl}</a>
            </p>
          </div>
        `,
      });
    } catch (err) {
      // Error de red, DNS, tiempo de espera... Se registra el motivo REAL (antes se perdía)
      this.logger.error(`No se pudo contactar con Resend: ${(err as Error)?.message ?? err}`);
      throw new InternalServerErrorException('Error al comunicarse con el servicio de correo.');
    }

    // El SDK NO lanza excepción cuando Resend rechaza el envío: devuelve { data, error }
    if (respuesta.error) {
      this.logger.error(
        `Resend rechazó el envío a ${destinatario} (remitente: ${remitente}): ` +
          `[${respuesta.error.name}] ${respuesta.error.message}`,
      );
      throw new InternalServerErrorException('No se pudo enviar el correo electrónico.');
    }

    this.logger.log(`Correo de recuperación enviado a ${destinatario}`);
  }
}
