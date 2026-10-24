import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Tratamiento } from './entities/tratamientos.entity';
import { Consulta } from '../consultas/entities/consultas.entity';
import { Mascota } from '../mascotas/entities/mascotas.entity';
import { ConsultasService } from '../consultas/consultas.service';
import {
  CreateTratamientoDto,
  UpdateTratamientoDto,
} from './dto/tratamientos.dto';
import { idDe, rolDe } from '../common/acceso';
import { lanzarErrorDb, siguienteId, sinUndefined } from '../common/db';
import type { JwtPayload } from '../guards/JwtAuthGuard';

@Injectable()
export class TratamientosService {
  private readonly logger = new Logger(TratamientosService.name);

  constructor(
    @InjectRepository(Tratamiento)
    private readonly repo: Repository<Tratamiento>,
    private readonly consultasService: ConsultasService,
    private readonly dataSource: DataSource,
  ) {}

  /** ADMIN: todos. VETERINARIO: los de sus consultas. CLIENTE: los de sus mascotas. */
  listar(user: JwtPayload) {
    const rol = rolDe(user);
    const qb = this.repo.createQueryBuilder('t').orderBy('t.id_tratamiento', 'DESC');

    if (rol === 'VETERINARIO') {
      qb.innerJoin(Consulta, 'c', 'c.id_cons_medica = t.id_cons_medica').where(
        'c.id_veterinario = :id',
        { id: idDe(user) },
      );
    } else if (rol === 'CLIENTE') {
      qb.innerJoin(Consulta, 'c', 'c.id_cons_medica = t.id_cons_medica')
        .innerJoin(Mascota, 'm', 'm.id_mascota = c.idMascota')
        .where('m.id_cliente = :id', { id: idDe(user) });
    }
    return qb.getMany();
  }

  async obtener(id: string, user: JwtPayload) {
    const tratamiento = await this.repo.findOne({ where: { id_tratamiento: id } });
    if (!tratamiento || !(await this.puedeAcceder(tratamiento, user))) {
      throw new NotFoundException('Tratamiento no encontrado.');
    }
    return tratamiento;
  }

  async crear(dto: CreateTratamientoDto, user: JwtPayload) {
    try {
      const consulta = await this.consultasService.buscar(dto.id_cons_medica);
      if (!consulta) {
        throw new BadRequestException('La consulta indicada no existe.');
      }
      if (rolDe(user) === 'VETERINARIO' && consulta.id_veterinario !== idDe(user)) {
        throw new ForbiddenException(
          'Solo puedes registrar tratamientos en tus propias consultas.',
        );
      }

      return await this.dataSource.transaction(async (manager) => {
        const id_tratamiento = await siguienteId(manager, 'tratamientos', 'id_tratamiento');
        await manager.insert(Tratamiento, { ...dto, id_tratamiento });
        return manager.findOneByOrFail(Tratamiento, { id_tratamiento });
      });
    } catch (error) {
      lanzarErrorDb(error, this.logger, 'crear', 'el tratamiento');
    }
  }

  async actualizar(id: string, dto: UpdateTratamientoDto, user: JwtPayload) {
    await this.obtener(id, user);

    const cambios = sinUndefined({ ...dto });
    // Solo ADMIN puede mover un tratamiento a otra consulta
    if (rolDe(user) !== 'ADMIN') delete cambios.id_cons_medica;

    if (Object.keys(cambios).length === 0) {
      throw new BadRequestException('No hay campos válidos para actualizar.');
    }

    try {
      await this.repo.update({ id_tratamiento: id }, cambios);
    } catch (error) {
      lanzarErrorDb(error, this.logger, 'actualizar', 'el tratamiento');
    }
    return this.obtener(id, user);
  }

  async eliminar(id: string) {
    try {
      const res = await this.repo.delete({ id_tratamiento: id });
      if (!res.affected) throw new NotFoundException('Tratamiento no encontrado.');
      return { mensaje: 'Tratamiento eliminado.' };
    } catch (error) {
      lanzarErrorDb(error, this.logger, 'eliminar', 'el tratamiento');
    }
  }

  // Acceso a un tratamiento = acceso a la consulta a la que pertenece
  private async puedeAcceder(t: Tratamiento, user: JwtPayload): Promise<boolean> {
    if (rolDe(user) === 'ADMIN') return true;
    if (!t.id_cons_medica) return false;
    const consulta = await this.consultasService.buscar(t.id_cons_medica);
    return consulta ? this.consultasService.puedeAcceder(consulta, user) : false;
  }
}
