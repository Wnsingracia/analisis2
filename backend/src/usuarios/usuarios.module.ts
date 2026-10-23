import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';

import { Usuario } from './entities/usuario.entity';
import { Administradores } from 'src/administradores/entities/administradores.entity';
import { Cliente } from 'src/clientes/entities/clientes.entity';
import { Empleado } from 'src/empleados/entities/empleados.entity';
import { Veterinario } from 'src/veterinarios/entities/veterinarios.entity';
import { Estilista } from 'src/estilistas/entities/estilistas.entity';
import { Recepcionista } from 'src/recepcionistas/entities/recepcionistas.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Administradores,
      Cliente,
      Empleado,
      Veterinario,
      Estilista,
      Recepcionista,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'secretKeyVetCare',
        signOptions: { expiresIn: '8h' },
      }),
    }),
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService], 
})
export class UsuariosModule {}