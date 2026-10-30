import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mascota } from './entities/mascotas.entity';
import { CreateMascotaDto, UpdateMascotaDto } from './dto/mascotas.dto';
import { idDe, rolDe } from '../common/acceso';
import { lanzarErrorDb, sinUndefined } from '../common/db';
import type { JwtPayload } from '../guards/JwtAuthGuard';

@Injectable()
export class MascotasService {
  private readonly logger = new Logger(MascotasService.name);

  constructor(
    @InjectRepository(Mascota)
    private readonly repo: Repository<Mascota>,
  ) {}

  // Citas de estética: el contexto que justifica que un estilista vea una mascota
  private static readonly CON_CITA_ESTETICA =
    "m.id_mascota IN (SELECT c.id_mascota FROM citas c WHERE COALESCE(c.tipo, '') ILIKE 'Est%')";

  private async esPacienteDe(idMascota: string, idVeterinario: string): Promise<boolean> {
    const filas = await this.repo.manager.query(
      `SELECT 1 FROM consultas WHERE "idMascota" = $1 AND id_veterinario = $2 LIMIT 1`,
      [idMascota, idVeterinario],
    );
    return filas.length > 0;
  }

  /**
   * CLIENTE: solo las suyas. ESTILISTA: solo las que tienen una cita de estética.
   * ADMIN, RECEPCIONISTA y VETERINARIO: todas (el veterinario necesita localizar al paciente
   * antes de su primera consulta), o las de un cliente con ?id_cliente=
   */
  listar(user: JwtPayload, idCliente?: string) {
    let filtro: string | undefined;

    if (rolDe(user) === 'CLIENTE') {
      filtro = idDe(user);
    } else if (idCliente !== undefined) {
      if (!/^\d+$/.test(idCliente)) {
        throw new BadRequestException('id_cliente debe ser numérico.');
      }
      filtro = idCliente;
    }

    const qb = this.repo.createQueryBuilder('m').orderBy('m.id_mascota', 'ASC');
    if (filtro) qb.andWhere('m.id_cliente = :filtro', { filtro });
    if (rolDe(user) === 'ESTILISTA') qb.andWhere(MascotasService.CON_CITA_ESTETICA);
    return qb.getMany();
  }

  async obtener(id: string, user: JwtPayload) {
    const mascota = await this.repo.findOne({ where: { id_mascota: id } });

    // Si es de otro cliente se responde 404 (no 403) para no revelar que existe
    if (
      !mascota ||
      (rolDe(user) === 'CLIENTE' && mascota.id_cliente !== idDe(user))
    ) {
      throw new NotFoundException('Mascota no encontrada.');
    }

    // El estilista solo accede a mascotas con una cita de estética
    if (rolDe(user) === 'ESTILISTA') {
      const filas = await this.repo.manager.query(
        `SELECT 1 FROM citas WHERE id_mascota = $1 AND COALESCE(tipo, '') ILIKE 'Est%' LIMIT 1`,
        [id],
      );
      if (!filas.length) throw new NotFoundException('Mascota no encontrada.');
    }
    return mascota;
  }

  async crear(dto: CreateMascotaDto, user: JwtPayload) {
    // Un cliente solo puede registrar mascotas a su nombre
    const id_cliente = rolDe(user) === 'CLIENTE' ? idDe(user) : dto.id_cliente;
    if (!id_cliente) {
      throw new BadRequestException('El id_cliente es obligatorio.');
    }

    try {
      return await this.repo.save(this.repo.create({ ...dto, id_cliente }));
    } catch (error) {
      lanzarErrorDb(error, this.logger, 'crear', 'la mascota');
    }
  }

  async actualizar(id: string, dto: UpdateMascotaDto, user: JwtPayload) {
    await this.obtener(id, user); // 404 si no existe o es ajena

    // Un veterinario solo modifica a sus pacientes (mascotas que ha atendido)
    if (rolDe(user) === 'VETERINARIO' && !(await this.esPacienteDe(id, idDe(user)))) {
      throw new NotFoundException('Mascota no encontrada.');
    }

    const cambios = sinUndefined({ ...dto });
    // Solo gestión puede traspasar una mascota a otro dueño
    if (rolDe(user) !== 'ADMIN' && rolDe(user) !== 'RECEPCIONISTA') {
      delete (cambios as any).id_cliente;
    }
    if (Object.keys(cambios).length === 0) {
      throw new BadRequestException('No hay campos válidos para actualizar.');
    }

    try {
      await this.repo.update({ id_mascota: id }, cambios);
    } catch (error) {
      lanzarErrorDb(error, this.logger, 'actualizar', 'la mascota');
    }
    return this.obtener(id, user);
  }

  async eliminar(id: string) {
    try {
      const res = await this.repo.delete({ id_mascota: id });
      if (!res.affected) throw new NotFoundException('Mascota no encontrada.');
      return { mensaje: 'Mascota eliminada.' };
    } catch (error) {
      lanzarErrorDb(error, this.logger, 'eliminar', 'la mascota');
    }
  }
}
