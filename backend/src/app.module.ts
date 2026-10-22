import { Module } from '@nestjs/common';
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
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [ConfigModule.forRoot({isGlobal:true}),
    TypeOrmModule.forRootAsync({
      imports:[ConfigModule],
      useFactory: async (ConfigService: ConfigService) =>({
        type: 'postgres',
        host: ConfigService.get('DB_HOST'),
        port: ConfigService.get<number>('DB_PORT'),
        username: ConfigService.get('DB_USERNAME'),
        password: ConfigService.get('DB_PASSWORD'),
        database: ConfigService.get('DB_DATABASE'),
        autoLoadEntities:true,
        synchronize:true
      }),
      inject: [ConfigService]
    }),
    UsuariosModule, VeterinariosModule, AdministradoresModule, CitasModule, ClientesModule, ConsultasModule, EmpleadosModule, EstilistasModule, MascotasModule, RecepcionistasModule, TratamientosModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
