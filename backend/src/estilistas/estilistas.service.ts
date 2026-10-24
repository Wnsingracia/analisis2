import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsSelect, Repository } from 'typeorm';
import { Estilista } from './entities/estilistas.entity';
import { CreateEstilistaDto, UpdateEstilistaDto } from './dto/estilistas.dto';
import { EmpleadosService } from '../empleados/empleados.service';
import { SELECT_PUBLICO } from '../usuarios/usuarios.service';
import { lanzarErrorDb, sinUndefined } from '../common/db';

const SELECT_ESTILISTA: FindOptionsSelect<Estilista> = {
  id_usuario: true,
  rol: true,
  usuario: SELECT_PUBLICO,
};

@Injectable()
export class EstilistasService {
  private readonly logger = new Logger(EstilistasService.name);

  constructor(
    @InjectRepository(Estilista)
    private readonly repo: Repository<Estilista>,
    private readonly dataSource: DataSource,
    private readonly empleadosService: EmpleadosService,
  ) {}

  listar() {
    return this.repo.find({
      relations: { usuario: true },
      select: SELECT_ESTILISTA,
      order: { id_usuario: 'ASC' },
    });
  }

  async obtener(id: string) {
    const registro = await this.repo.findOne({
      where: { id_usuario: id },
      relations: { usuario: true },
      select: SELECT_ESTILISTA,
    });
    if (!registro) throw new NotFoundException('Estilista no encontrado.');
    return registro;
  }

  /** Crea usuario + empleado + Estilista en una sola transacción. */
  async crear(dto: CreateEstilistaDto) {
    const { salario, hora_ingreso, hora_salida, rol, ...datosUsuario } = dto;

    try {
      return await this.dataSource.transaction(async (manager) => {
        const id_usuario = await this.empleadosService.crearBase(
          manager,
          'ESTILISTA',
          datosUsuario,
          { salario, hora_ingreso, hora_salida },
        );
        await manager.insert(Estilista, { id_usuario, rol });
        return { mensaje: 'Estilista registrado con éxito.', id_usuario };
      });
    } catch (error) {
      lanzarErrorDb(error, this.logger, 'crear', 'el estilista');
    }
  }

  async actualizar(id: string, dto: UpdateEstilistaDto) {
    const cambios = sinUndefined({ rol: dto.rol });
    if (Object.keys(cambios).length === 0) {
      throw new BadRequestException('No hay campos válidos para actualizar.');
    }

    try {
      const res = await this.repo.update({ id_usuario: id }, cambios);
      if (!res.affected) throw new NotFoundException('Estilista no encontrado.');
    } catch (error) {
      lanzarErrorDb(error, this.logger, 'actualizar', 'el estilista');
    }
    return this.obtener(id);
  }

  async eliminar(id: string) {
    try {
      await this.dataSource.transaction(async (manager) => {
        // Primero la fila del rol: si no existe, el id no es de un estilista
        const res = await manager.delete(Estilista, { id_usuario: id });
        if (!res.affected) throw new NotFoundException('Estilista no encontrado.');
        await this.empleadosService.eliminarBase(manager, id);
      });
      return { mensaje: 'Estilista eliminado.' };
    } catch (error) {
      lanzarErrorDb(error, this.logger, 'eliminar', 'el estilista');
    }
  }
}
