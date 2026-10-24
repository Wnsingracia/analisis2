import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Consulta } from './entities/consultas.entity';
import { Mascota } from '../mascotas/entities/mascotas.entity';
import { CreateConsultaDto, UpdateConsultaDto } from './dto/consultas.dto';
import { idDe, rolDe } from '../common/acceso';
import { lanzarErrorDb, siguienteId, sinUndefined } from '../common/db';
import type { JwtPayload } from '../guards/JwtAuthGuard';

@Injectable()
export class ConsultasService {
  private readonly logger = new Logger(ConsultasService.name);

  constructor(
    @InjectRepository(Consulta)
    private readonly repo: Repository<Consulta>,
    @InjectRepository(Mascota)
    private readonly mascotaRepo: Repository<Mascota>,
    private readonly dataSource: DataSource,
  ) {}

  /** ADMIN: todas. VETERINARIO: las suyas. CLIENTE: las de sus mascotas. */
  listar(user: JwtPayload) {
    const rol = rolDe(user);
    const qb = this.repo.createQueryBuilder('c').orderBy('c.fecha', 'DESC');

    if (rol === 'VETERINARIO') {
      qb.where('c.id_veterinario = :id', { id: idDe(user) });
    } else if (rol === 'CLIENTE') {
      qb.innerJoin(Mascota, 'm', 'm.id_mascota = c.idMascota').where(
        'm.id_cliente = :id',
        { id: idDe(user) },
      );
    }
    return qb.getMany();
  }

  /** Reutilizado por TratamientosService: quién puede ver esta consulta (y sus tratamientos). */
  async puedeAcceder(consulta: Consulta, user: JwtPayload): Promise<boolean> {
    const rol = rolDe(user);
    if (rol === 'ADMIN') return true;
    if (rol === 'VETERINARIO') return consulta.id_veterinario === idDe(user);
    if (rol === 'CLIENTE' && consulta.idMascota) {
      const mascota = await this.mascotaRepo.findOne({
        where: { id_mascota: consulta.idMascota, id_cliente: idDe(user) },
      });
      return mascota !== null;
    }
    return false;
  }

  buscar(id: string) {
    return this.repo.findOne({ where: { id_cons_medica: id } });
  }

  async obtener(id: string, user: JwtPayload) {
    const consulta = await this.buscar(id);
    // 404 tanto si no existe como si no tiene acceso
    if (!consulta || !(await this.puedeAcceder(consulta, user))) {
      throw new NotFoundException('Consulta no encontrada.');
    }
    return consulta;
  }

  async crear(dto: CreateConsultaDto, user: JwtPayload) {
    // Un veterinario siempre registra la consulta a su nombre
    const id_veterinario =
      rolDe(user) === 'VETERINARIO' ? idDe(user) : dto.id_veterinario;

    try {
      return await this.dataSource.transaction(async (manager) => {
        const id_cons_medica = await siguienteId(
          manager,
          'consultas_medicas',
          'id_cons_medica',
        );
        await manager.insert(Consulta, { ...dto, id_cons_medica, id_veterinario });
        return manager.findOneByOrFail(Consulta, { id_cons_medica });
      });
    } catch (error) {
      lanzarErrorDb(error, this.logger, 'crear', 'la consulta');
    }
  }

  async actualizar(id: string, dto: UpdateConsultaDto, user: JwtPayload) {
    await this.obtener(id, user);

    const cambios = sinUndefined({ ...dto });
    // Un veterinario no puede reasignar la consulta a otro colega
    if (rolDe(user) === 'VETERINARIO') delete cambios.id_veterinario;

    if (Object.keys(cambios).length === 0) {
      throw new BadRequestException('No hay campos válidos para actualizar.');
    }

    try {
      await this.repo.update({ id_cons_medica: id }, cambios);
    } catch (error) {
      lanzarErrorDb(error, this.logger, 'actualizar', 'la consulta');
    }
    return this.obtener(id, user);
  }

  async eliminar(id: string) {
    try {
      const res = await this.repo.delete({ id_cons_medica: id });
      if (!res.affected) throw new NotFoundException('Consulta no encontrada.');
      return { mensaje: 'Consulta eliminada.' };
    } catch (error) {
      lanzarErrorDb(error, this.logger, 'eliminar', 'la consulta');
    }
  }
}
