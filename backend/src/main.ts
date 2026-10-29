import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser'
import { contextoStorage } from './common/contexto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Contexto por petición (IP y usuario) para la auditoría
  app.use((req: any, _res: any, next: () => void) =>
    contextoStorage.run({ ip: req.ip }, next),
  );

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, 
      transform: true,
    }),
  );

  app.enableCors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' , credentials: true});

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();