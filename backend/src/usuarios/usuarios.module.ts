import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'CLAVE_SUPER_SECRETA_VETCARE_2026',
      signOptions: {
        expiresIn: '24h',
      },
    }),
  ],
  controllers: [UsuariosController],
 providers: [
  UsuariosService,
  {
    provide: 'veterinaria_db',
    useFactory: () => {
      return new Pool({
        host: 'aws-0-us-east-1.pooler.supabase.com', // Región exacta de tu proyecto
        user: 'postgres.vhxgowopivfjhojlukce',
        password: 'ManadaC0rp1',
        database: 'postgres',
        port: 6543, // Puerto obligatorio para el Pooler IPv4
        ssl: {
          rejectUnauthorized: false,
        },
      });
    },
  },
],
  exports: [JwtModule, PassportModule],
})
export class UsuariosModule {}