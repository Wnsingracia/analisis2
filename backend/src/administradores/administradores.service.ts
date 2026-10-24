import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsSelect, Repository } from 'typeorm';
import { Administradores } from './entities/administradores.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { SELECT_PUBLICO, UsuariosService } from '../usuarios/usuarios.service';
import {
  CreateAdministradorDto,
  UpdateAdministradorDto,
} from './dto/administradores.dto';
import { lanzarErrorDb, sinUndefined } from '../common/db';

const SELECT_ADMIN: FindOptionsSelect<Administradores> = {
  id_usuario: true,
  nvl_acceso: true,
  usuario: SELECT_PUBLICO,
};

@Injectable()
export class AdministradoresService {
  private readonly logger = new Logger(AdministradoresService.name);

  constructor(
    @InjectRepository(Administradores)
    private readonly repo: Repository<Administradores>,
    private readonly dataSource: DataSource,
    private readonly usuariosService: UsuariosService,
  ) {}

  listar() {
    return this.repo.find({
      relations: { usuario: true },
      select: SELECT_ADMIN,
      order: { id_usuario: 'ASC' },
    });
  }

  async obtener(id: string) {
    const admin = await this.repo.findOne({
      where: { id_usuario: id },
      relations: { usuario: true },
      select: SELECT_ADMIN,
    });
    if (!admin) throw new NotFoundException('Administrador no encontrado.');
    return admin;
  }

  async crear(dto: CreateAdministradorDto) {
    const { nvl_acceso, ...datosUsuario } = dto;

    try {
      return await this.dataSource.transaction(async (manager) => {
        const { id_usuario } = await this.usuariosService.inserta(
          { ...datosUsuario, tipo_usuario: 'ADMIN' },
          manager,
        );
        await manager.insert(Administradores, { id_usuario, nvl_acceso });
        return { mensaje: 'Administrador registrado con éxito.', id_usuario };
      });
    } catch (error) {
      lanzarErrorDb(error, this.logger, 'crear', 'el administrador');
    }
  }

  async actualizar(id: string, dto: UpdateAdministradorDto) {
    const cambios = sinUndefined({ nvl_acceso: dto.nvl_acceso });
    if (Object.keys(cambios).length === 0) {
      throw new BadRequestException('No hay campos válidos para actualizar.');
    }

    try {
      const res = await this.repo.update({ id_usuario: id }, cambios);
      if (!res.affected) throw new NotFoundException('Administrador no encontrado.');
    } catch (error) {
      lanzarErrorDb(error, this.logger, 'actualizar', 'el administrador');
    }
    return this.obtener(id);
  }

  async eliminar(id: string, idSolicitante: string) {
    if (id === idSolicitante) {
      throw new BadRequestException('No puedes eliminar tu propia cuenta.');
    }

    try {
      await this.dataSource.transaction(async (manager) => {
        if ((await manager.count(Administradores)) <= 1) {
          throw new ConflictException('No se puede eliminar al último administrador.');
        }
        const res = await manager.delete(Administradores, { id_usuario: id });
        if (!res.affected) throw new NotFoundException('Administrador no encontrado.');
        await manager.delete(Usuario, { id_usuario: id });
      });
      return { mensaje: 'Administrador eliminado.' };
    } catch (error) {
      lanzarErrorDb(error, this.logger, 'eliminar', 'el administrador');
    }
  }
}
