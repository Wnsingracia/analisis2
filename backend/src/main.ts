import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // CORS abierto al dominio definitivo de tu frontend en Vercel
  app.enableCors({
    origin: process.env.FRONTEND_URL || true,
    credentials: true,
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();