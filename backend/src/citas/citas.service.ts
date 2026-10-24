import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Cita } from './entities/citas.entity';
import { Mascota } from '../mascotas/entities/mascotas.entity';
import { CreateCitaDto, UpdateCitaDto } from './dto/citas.dto';
import { idDe, rolDe } from '../common/acceso';
import { lanzarErrorDb, siguienteId, sinUndefined } from '../common/db';
import type { JwtPayload } from '../guards/JwtAuthGuard';

@Injectable()
export class CitasService {
  private readonly logger = new Logger(CitasService.name);

  constructor(
    @InjectRepository(Cita)
    private readonly repo: Repository<Cita>,
    @InjectRepository(Mascota)
    private readonly mascotaRepo: Repository<Mascota>,
    private readonly dataSource: DataSource,
  ) {}

  /** CLIENTE: solo sus citas. El resto de roles con acceso ve la agenda completa. */
  listar(user: JwtPayload) {
    return this.repo.find({
      where: rolDe(user) === 'CLIENTE' ? { id_cliente: idDe(user) } : {},
      order: { fecha: 'DESC', hora: 'DESC' },
    });
  }

  async obtener(id: string, user: JwtPayload) {
    const cita = await this.repo.findOne({ where: { id_cita: id } });
    if (
      !cita ||
      (rolDe(user) === 'CLIENTE' && cita.id_cliente !== idDe(user))
    ) {
      throw new NotFoundException('Cita no encontrada.');
    }
    return cita;
  }

  /**
   * Agenda con consulta y tratamiento de cada cita.
   * - ADMIN: todo.
   * - VETERINARIO: todas las citas, pero solo ve consultas/tratamientos propios.
   * - CLIENTE: solo sus citas.
   */
  async agenda(user: JwtPayload) {
    const rol = rolDe(user);
    const id = idDe(user);

    const joinConsulta =
      rol === 'VETERINARIO'
        ? 'LEFT JOIN consultas_medicas cm ON c.id_cita = cm.id_cita AND cm.id_veterinario = $1'
        : 'LEFT JOIN consultas_medicas cm ON c.id_cita = cm.id_cita';
    const filtro = rol === 'CLIENTE' ? 'WHERE c.id_cliente = $1' : '';
    const params = rol === 'ADMIN' ? [] : [id];

    try {
      return await this.dataSource.query(
        `SELECT c.id_cita, c.fecha, c.hora, c.tipo,
                c.descripcion AS cita_descripcion, c.costo,
                c.id_mascota, c.id_cliente, c.id_recepcionista,
                t.id_tratamiento,
                t.descripcion AS tratamiento_descripcion,
                t.fecha_emision
           FROM citas c
           ${joinConsulta}
           LEFT JOIN tratamientos t ON cm.id_cons_medica = t.id_cons_medica
           ${filtro}
          ORDER BY c.fecha DESC, c.hora DESC`,
        params,
      );
    } catch (error) {
      this.logger.error('Error al obtener la agenda', (error as Error)?.stack);
      throw new BadRequestException('No se pudo obtener la agenda.');
    }
  }

  async crear(dto: CreateCitaDto, user: JwtPayload) {
    // Un recepcionista siempre queda registrado como quien creó la cita
    const id_recepcionista =
      rolDe(user) === 'RECEPCIONISTA' ? idDe(user) : dto.id_recepcionista;

    try {
      await this.validarMascotaDeCliente(dto.id_mascota, dto.id_cliente);

      return await this.dataSource.transaction(async (manager) => {
        const id_cita = await siguienteId(manager, 'citas', 'id_cita');
        await manager.insert(Cita, { ...dto, id_cita, id_recepcionista });
        return manager.findOneByOrFail(Cita, { id_cita });
      });
    } catch (error) {
      lanzarErrorDb(error, this.logger, 'crear', 'la cita');
    }
  }

  async actualizar(id: string, dto: UpdateCitaDto) {
    const cambios = sinUndefined({ ...dto });
    if (Object.keys(cambios).length === 0) {
      throw new BadRequestException('No hay campos válidos para actualizar.');
    }

    try {
      const actual = await this.repo.findOne({ where: { id_cita: id } });
      if (!actual) throw new NotFoundException('Cita no encontrada.');

      await this.validarMascotaDeCliente(
        dto.id_mascota ?? actual.id_mascota ?? undefined,
        dto.id_cliente ?? actual.id_cliente ?? undefined,
      );

      await this.repo.update({ id_cita: id }, cambios);
      return await this.repo.findOneByOrFail({ id_cita: id });
    } catch (error) {
      lanzarErrorDb(error, this.logger, 'actualizar', 'la cita');
    }
  }

  async eliminar(id: string) {
    try {
      const res = await this.repo.delete({ id_cita: id });
      if (!res.affected) throw new NotFoundException('Cita no encontrada.');
      return { mensaje: 'Cita eliminada.' };
    } catch (error) {
      lanzarErrorDb(error, this.logger, 'eliminar', 'la cita');
    }
  }

  // La mascota de una cita debe pertenecer al cliente de esa cita
  private async validarMascotaDeCliente(id_mascota?: string, id_cliente?: string) {
    if (!id_mascota || !id_cliente) return;
    const mascota = await this.mascotaRepo.findOne({
      where: { id_mascota, id_cliente },
    });
    if (!mascota) {
      throw new BadRequestException('La mascota no pertenece al cliente indicado.');
    }
  }
}
