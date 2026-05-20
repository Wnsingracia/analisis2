import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ◄ ACTIVA ESTO para permitir que tu frontend de Vite se conecte
  app.enableCors({
    origin: 'http://localhost:5173', // La URL de tu React en Vite
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
