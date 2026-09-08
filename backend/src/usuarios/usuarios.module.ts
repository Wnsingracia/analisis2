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
    PassportModule.register({defaultStrategy: 'jwt'}),
    JwtModule.register({
      secret: 'CLAVE_SUPER_SECRETA_VETCARE_2026', // ◄ Cambia esto en producción
      signOptions: { 
        expiresIn: '24h' // ◄ El token expirará automáticamente en un día
      },
    }),
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService,
    {
      provide: 'veterinaria_db',
    useFactory: () =>{
      return new Pool({
        host: '100.76.48.82',
        user: 'postgres',
        password: '123456',
        database: 'veterinaria_db',
        port: 5432,
        ssl: {
          rejectUnauthorized: true, // Validación estricta con CA propia
          ca: fs.readFileSync(path.resolve('./certs/rootCA.crt')).toString(),
          cert: fs.readFileSync(path.resolve('./certs/client.crt')).toString(),
          key: fs.readFileSync(path.resolve('./certs/client.key')).toString(),
          checkServerIdentity: () => undefined,
        }
      })
    }
    }
  ],
  exports: [JwtModule, PassportModule]
})
export class UsuariosModule {}
