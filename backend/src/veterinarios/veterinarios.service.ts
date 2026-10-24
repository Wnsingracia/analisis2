import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsSelect, Repository } from 'typeorm';
import { Veterinario } from './entities/veterinarios.entity';
import { CreateVeterinarioDto, UpdateVeterinarioDto } from './dto/veterinarios.dto';
import { EmpleadosService } from '../empleados/empleados.service';
import { SELECT_PUBLICO } from '../usuarios/usuarios.service';
import { lanzarErrorDb, sinUndefined } from '../common/db';

const SELECT_VETERINARIO: FindOptionsSelect<Veterinario> = {
  id_usuario: true,
  especializacion: true,
  titulo: true,
  usuario: SELECT_PUBLICO,
};

@Injectable()
export class VeterinariosService {
  private readonly logger = new Logger(VeterinariosService.name);

  constructor(
    @InjectRepository(Veterinario)
    private readonly repo: Repository<Veterinario>,
    private readonly dataSource: DataSource,
    private readonly empleadosService: EmpleadosService,
  ) {}

  listar() {
    return this.repo.find({
      relations: { usuario: true },
      select: SELECT_VETERINARIO,
      order: { id_usuario: 'ASC' },
    });
  }

  async obtener(id: string) {
    const registro = await this.repo.findOne({
      where: { id_usuario: id },
      relations: { usuario: true },
      select: SELECT_VETERINARIO,
    });
    if (!registro) throw new NotFoundException('Veterinario no encontrado.');
    return registro;
  }

  /** Crea usuario + empleado + Veterinario en una sola transacción. */
  async crear(dto: CreateVeterinarioDto) {
    const { salario, hora_ingreso, hora_salida, especializacion, titulo, ...datosUsuario } = dto;

    try {
      return await this.dataSource.transaction(async (manager) => {
        const id_usuario = await this.empleadosService.crearBase(
          manager,
          'VETERINARIO',
          datosUsuario,
          { salario, hora_ingreso, hora_salida },
        );
        await manager.insert(Veterinario, { id_usuario, especializacion, titulo });
        return { mensaje: 'Veterinario registrado con éxito.', id_usuario };
      });
    } catch (error) {
      lanzarErrorDb(error, this.logger, 'crear', 'el veterinario');
    }
  }

  async actualizar(id: string, dto: UpdateVeterinarioDto) {
    const cambios = sinUndefined({ especializacion: dto.especializacion, titulo: dto.titulo });
    if (Object.keys(cambios).length === 0) {
      throw new BadRequestException('No hay campos válidos para actualizar.');
    }

    try {
      const res = await this.repo.update({ id_usuario: id }, cambios);
      if (!res.affected) throw new NotFoundException('Veterinario no encontrado.');
    } catch (error) {
      lanzarErrorDb(error, this.logger, 'actualizar', 'el veterinario');
    }
    return this.obtener(id);
  }

  async eliminar(id: string) {
    try {
      await this.dataSource.transaction(async (manager) => {
        // Primero la fila del rol: si no existe, el id no es de un veterinario
        const res = await manager.delete(Veterinario, { id_usuario: id });
        if (!res.affected) throw new NotFoundException('Veterinario no encontrado.');
        await this.empleadosService.eliminarBase(manager, id);
      });
      return { mensaje: 'Veterinario eliminado.' };
    } catch (error) {
      lanzarErrorDb(error, this.logger, 'eliminar', 'el veterinario');
    }
  }

  /** Mascotas que este veterinario ha atendido, con el nombre del dueño y la última consulta. */
  async pacientes(idVeterinario: string) {
    try {
      return await this.dataSource.query(
        `SELECT m.id_mascota, m.nombre, m.tipo, m.raza, m.edad, m.genero,
                (u.nombres || ' ' || u.ap_pat) AS dueno_nombre,
                MAX(cm.fecha) AS ultima_consulta
           FROM mascotas m
           JOIN usuarios u ON u.id_usuario = m.id_cliente
           JOIN consultas cm
             ON cm."idMascota" = m.id_mascota AND cm.id_veterinario = $1
          GROUP BY m.id_mascota, m.nombre, m.tipo, m.raza, m.edad, m.genero,
                   u.nombres, u.ap_pat
          ORDER BY ultima_consulta DESC NULLS LAST`,
        [idVeterinario],
      );
    } catch (error) {
      this.logger.error('Error al obtener pacientes', (error as Error)?.stack);
      throw new InternalServerErrorException('Error al obtener los pacientes del veterinario.');
    }
  }
}
