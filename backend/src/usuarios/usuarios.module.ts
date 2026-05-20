import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { Usuarios } from './usuarios';
import { Pool } from 'pg';

@Module({
  controllers: [UsuariosController],
  providers: [UsuariosService,
    {
      provide: 'veterinaria_db',
    useFactory: () =>{
      return new Pool({
        host: 'localhost',
        user: 'postgres',
        password: '123456',
        database: 'veterinaria_db',
        port: 5432
      })
    }
    }
  ]
})
export class UsuariosModule {}
