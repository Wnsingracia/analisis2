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

  /** CLIENTE: solo las suyas. Staff: todas, o las de un cliente con ?id_cliente= */
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

    return this.repo.find({
      where: filtro ? { id_cliente: filtro } : {},
      order: { id_mascota: 'ASC' },
    });
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

    const cambios = sinUndefined({ ...dto });
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
