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
   
  async obtener(id: string,user: JwtPayload,idCliente?: string,) {
    const rol = rolDe(user);

    const where: any = {
      id_mascota: id,
    };

    if (rol === 'CLIENTE') {
      // El propietario siempre sale del JWT.
      where.id_cliente = idDe(user);
    } else if (rol === 'RECEPCIONISTA' || rol === 'ADMIN') {
      // El personal debe indicar el cliente para evitar
      // confundir mascotas con identificadores repetidos.
      if (!idCliente || !/^\d+$/.test(idCliente)) {
        throw new BadRequestException(
          'Debes proporcionar un id_cliente válido.',
        );
      }

      where.id_cliente = idCliente;
    }

    const mascota = await this.repo.findOne({ where });

    if (!mascota) {
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


  async actualizar(id: string,dto: UpdateMascotaDto,user: JwtPayload,idCliente?: string,) {
    const rol = rolDe(user);

    const propietario =
      rol === 'CLIENTE' ? idDe(user) : idCliente;

    const mascota = await this.obtener(id, user, propietario);

    const cambios = sinUndefined({ ...dto });

    if (Object.keys(cambios).length === 0) {
      throw new BadRequestException(
        'No hay campos válidos para actualizar.',
      );
    }

    try {
      await this.repo.update(
        {
          id_mascota: mascota.id_mascota,
          id_cliente: mascota.id_cliente,
        },
        cambios,
      );

      return this.repo.findOne({
        where: {
          id_mascota: mascota.id_mascota,
          id_cliente: mascota.id_cliente,
        },
      });
    } catch (error) {
      lanzarErrorDb(error, this.logger, 'actualizar', 'la mascota');
    }
  }

  async eliminar(id: string, idCliente: string) {
    if (!idCliente || !/^\d+$/.test(idCliente)) {
      throw new BadRequestException('Debes proporcionar un id_cliente válido.');
    }

    try {
      const res = await this.repo.delete({
        id_mascota: id,
        id_cliente: idCliente,
      });

      if (!res.affected) {
        throw new NotFoundException('Mascota no encontrada.');
      }

      return { mensaje: 'Mascota eliminada.' };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      lanzarErrorDb(error, this.logger, 'eliminar', 'la mascota');
    }
  }
}
