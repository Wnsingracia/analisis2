
import {
  Injectable,
  BadRequestException,
  InternalServerErrorException
} from '@nestjs/common';

@Injectable()
export class TurnstileService {

  async verificarCaptcha(token: string): Promise<void> {

    if (!token) {
      throw new BadRequestException(
        'La verificación CAPTCHA es obligatoria.'
      );
    }

    const secret = process.env.TURNSTILE_SECRET_KEY;

    if (!secret) {
      throw new InternalServerErrorException(
        'La configuración CAPTCHA no está disponible.'
      );
    }

    try {
      const parametros = new URLSearchParams();

      parametros.append('secret', secret);
      parametros.append('response', token);

      const respuesta = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: parametros
        }
      );

      if (!respuesta.ok) {
        throw new Error('Error de comunicación con Cloudflare');
      }

      const resultado = await respuesta.json();

      if (!resultado.success) {
        throw new BadRequestException(
          'Verificación CAPTCHA inválida o expirada.'
        );
      }

    } catch (error) {

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        'No fue posible verificar el CAPTCHA.'
      );
    }
  }
}
