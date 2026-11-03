import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { contextoStorage } from './common/contexto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Render coloca un proxy delante de la API: sin esto req.ip sería la IP del proxy y el
  // límite de intentos y la auditoría verían a todos los usuarios como una sola dirección.
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.use(cookieParser());

  // Contexto de la petición: permite a la auditoría saber quién actúa y desde qué IP
  app.use((req: Request, _res: Response, next: NextFunction) => {
    contextoStorage.run({ ip: req.ip }, next);
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // CORS limitado al dominio del frontend en Vercel (obligatorio en producción)
  const frontendUrl = process.env.FRONTEND_URL;
  if (!frontendUrl && process.env.NODE_ENV === 'production') {
    throw new Error('FRONTEND_URL es obligatoria en producción (origen permitido por CORS).');
  }
  app.enableCors({
    origin: frontendUrl || true,
    credentials: true,
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();