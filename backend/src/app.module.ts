import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { UsuariosModule } from './usuarios/usuarios.module';
import { VeterinariosModule } from './veterinarios/veterinarios.module';
import { AdministradoresModule } from './administradores/administradores.module';
import { CitasModule } from './citas/citas.module';
import { ClientesModule } from './clientes/clientes.module';
import { ConsultasModule } from './consultas/consultas.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { EstilistasModule } from './estilistas/estilistas.module';
import { MascotasModule } from './mascotas/mascotas.module';
import { RecepcionistasModule } from './recepcionistas/recepcionistas.module';
import { TratamientosModule } from './tratamientos/tratamientos.module';
import { AuthModule } from './auth/auth.module';

import { AuditoriaModule } from './auditoria/auditoria.module';
import { SegundoFactorModule } from './segundo-factor/segundo-factor.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '8h' },
      }),
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow<string>('DB_HOST'),
        port: Number(config.getOrThrow<string>('DB_PORT')),
        username: config.getOrThrow<string>('DB_USERNAME'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: false,
        ssl: { rejectUnauthorized: false },
      }),
    }),

    AuditoriaModule,
    SegundoFactorModule,
    UsuariosModule,
    VeterinariosModule,
    AdministradoresModule,
    CitasModule,
    ClientesModule,
    ConsultasModule,
    EmpleadosModule,
    EstilistasModule,
    MascotasModule,
    RecepcionistasModule,
    TratamientosModule,
    AuthModule,
  ],
})
export class AppModule {}