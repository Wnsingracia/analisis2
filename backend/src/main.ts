import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { contextoStorage } from './common/contexto';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const rutaCert = path.join(process.cwd(), 'certs', 'localhost+2.pem');
  const rutaKey = path.join(process.cwd(), 'certs', 'localhost+2-key.pem');

  const httpsOptions = {
    key: fs.readFileSync(rutaKey),
    cert: fs.readFileSync(rutaCert),
  };

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  // Contexto por petición (IP y usuario) para la auditoría
  app.use((req: any, _res: any, next: () => void) =>
    contextoStorage.run({ ip: req.ip }, next),
  );

  app.use(cookieParser());

  // ◄ Debe ser useGlobalPipes, NO app.use
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'https://localhost:5173',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();