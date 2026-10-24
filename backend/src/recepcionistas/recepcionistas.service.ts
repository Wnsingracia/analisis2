import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsSelect, Repository } from 'typeorm';
import { Recepcionista } from './entities/recepcionistas.entity';
import { CreateRecepcionistaDto, UpdateRecepcionistaDto } from './dto/recepcionistas.dto';
import { EmpleadosService } from '../empleados/empleados.service';
import { SELECT_PUBLICO } from '../usuarios/usuarios.service';
import { lanzarErrorDb, sinUndefined } from '../common/db';

const SELECT_RECEPCIONISTA: FindOptionsSelect<Recepcionista> = {
  id_usuario: true,
  departamento: true,
  usuario: SELECT_PUBLICO,
};

@Injectable()
export class RecepcionistasService {
  private readonly logger = new Logger(RecepcionistasService.name);

  constructor(
    @InjectRepository(Recepcionista)
    private readonly repo: Repository<Recepcionista>,
    private readonly dataSource: DataSource,
    private readonly empleadosService: EmpleadosService,
  ) {}

  listar() {
    return this.repo.find({
      relations: { usuario: true },
      select: SELECT_RECEPCIONISTA,
      order: { id_usuario: 'ASC' },
    });
  }

  async obtener(id: string) {
    const registro = await this.repo.findOne({
      where: { id_usuario: id },
      relations: { usuario: true },
      select: SELECT_RECEPCIONISTA,
    });
    if (!registro) throw new NotFoundException('Recepcionista no encontrado.');
    return registro;
  }

  /** Crea usuario + empleado + Recepcionista en una sola transacción. */
  async crear(dto: CreateRecepcionistaDto) {
    const { salario, hora_ingreso, hora_salida, departamento, ...datosUsuario } = dto;

    try {
      return await this.dataSource.transaction(async (manager) => {
        const id_usuario = await this.empleadosService.crearBase(
          manager,
          'RECEPCIONISTA',
          datosUsuario,
          { salario, hora_ingreso, hora_salida },
        );
        await manager.insert(Recepcionista, { id_usuario, departamento });
        return { mensaje: 'Recepcionista registrado con éxito.', id_usuario };
      });
    } catch (error) {
      lanzarErrorDb(error, this.logger, 'crear', 'el recepcionista');
    }
  }

  async actualizar(id: string, dto: UpdateRecepcionistaDto) {
    const cambios = sinUndefined({ departamento: dto.departamento });
    if (Object.keys(cambios).length === 0) {
      throw new BadRequestException('No hay campos válidos para actualizar.');
    }

    try {
      const res = await this.repo.update({ id_usuario: id }, cambios);
      if (!res.affected) throw new NotFoundException('Recepcionista no encontrado.');
    } catch (error) {
      lanzarErrorDb(error, this.logger, 'actualizar', 'el recepcionista');
    }
    return this.obtener(id);
  }

  async eliminar(id: string) {
    try {
      await this.dataSource.transaction(async (manager) => {
        // Primero la fila del rol: si no existe, el id no es de un recepcionista
        const res = await manager.delete(Recepcionista, { id_usuario: id });
        if (!res.affected) throw new NotFoundException('Recepcionista no encontrado.');
        await this.empleadosService.eliminarBase(manager, id);
      });
      return { mensaje: 'Recepcionista eliminado.' };
    } catch (error) {
      lanzarErrorDb(error, this.logger, 'eliminar', 'el recepcionista');
    }
  }
}
