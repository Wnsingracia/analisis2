import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsSelect, Repository } from 'typeorm';
import { Empleado } from './entities/empleados.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { SELECT_PUBLICO, UsuariosService } from '../usuarios/usuarios.service';
import { DatosEmpleadoDto, UpdateEmpleadoDto } from './dto/empleado.dto';
import { DatosPersonalesDto } from '../usuarios/dto/usuarios.dto';
import { lanzarErrorDb, sinUndefined } from '../common/db';
import { InternalServerErrorException } from '@nestjs/common';

export type TipoPersonal = 'VETERINARIO' | 'ESTILISTA' | 'RECEPCIONISTA';

const SELECT_EMPLEADO: FindOptionsSelect<Empleado> = {
  id_usuario: true,
  salario: true,
  hora_ingreso: true,
  hora_salida: true,
  usuario: SELECT_PUBLICO,
};

@Injectable()
export class EmpleadosService {
  private readonly logger = new Logger(EmpleadosService.name);

  constructor(
    @InjectRepository(Empleado)
    private readonly repo: Repository<Empleado>,
    private readonly usuariosService: UsuariosService,
  ) {}

  // ---------- Usados por veterinarios, estilistas y recepcionistas ----------

  /** Crea la fila de usuarios y la de empleados dentro de la transacción recibida. */
  async crearBase(
    manager: EntityManager,
    tipo_usuario: TipoPersonal,
    datosUsuario: DatosPersonalesDto,
    datosEmpleado: DatosEmpleadoDto,
  ): Promise<string> {
    const { id_usuario } = await this.usuariosService.inserta(
      { ...datosUsuario, tipo_usuario },
      manager,
    );
    await manager.insert(Empleado, {
      id_usuario,
      salario: datosEmpleado.salario,
      hora_ingreso: datosEmpleado.hora_ingreso,
      hora_salida: datosEmpleado.hora_salida,
    });
    return id_usuario;
  }

  /** Borra empleados y usuarios. La fila del rol se borra antes, en su propio servicio. */
  async eliminarBase(manager: EntityManager, id: string): Promise<void> {
    await manager.delete(Empleado, { id_usuario: id });
    await manager.delete(Usuario, { id_usuario: id });
  }

  // ---------- Endpoints de /empleados ----------

  listar() {
    return this.repo.find({
      relations: { usuario: true },
      select: SELECT_EMPLEADO,
      order: { id_usuario: 'ASC' },
    });
  }

  async listarConUsuarios() {
    try {
      return await this.repo
        .createQueryBuilder('e')
        .innerJoin(Usuario, 'u', 'u.id_usuario = e.id_usuario')
        .select([
          'e.id_usuario AS id_usuario',
          'u.nombres AS nombres',
          'u.ap_pat AS ap_pat',
          'u.ap_mat AS ap_mat',
          'u.correo AS correo',
          'u.tipo_usuario AS tipo_usuario',
        ])
        .orderBy('e.id_usuario', 'ASC')
        .getRawMany();
    } catch (error: any) {
      this.logger.error('Error al listar empleados con usuarios', error?.stack ?? error);
      throw new InternalServerErrorException('Error al obtener la lista de empleados.');
    }
  }

  async obtener(id: string) {
    const empleado = await this.repo.findOne({
      where: { id_usuario: id },
      relations: { usuario: true },
      select: SELECT_EMPLEADO,
    });
    if (!empleado) throw new NotFoundException('Empleado no encontrado.');
    return empleado;
  }

  async actualizar(id: string, dto: UpdateEmpleadoDto) {
    const cambios = sinUndefined({
      salario: dto.salario,
      hora_ingreso: dto.hora_ingreso,
      hora_salida: dto.hora_salida,
    });
    if (Object.keys(cambios).length === 0) {
      throw new BadRequestException('No hay campos válidos para actualizar.');
    }

    try {
      const res = await this.repo.update({ id_usuario: id }, cambios);
      if (!res.affected) throw new NotFoundException('Empleado no encontrado.');
    } catch (error) {
      lanzarErrorDb(error, this.logger, 'actualizar', 'el empleado');
    }
    return this.obtener(id);
  }
}
