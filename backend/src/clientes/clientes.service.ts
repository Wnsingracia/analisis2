import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsSelect, Repository } from 'typeorm';
import { Cliente } from './entities/clientes.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { SELECT_PUBLICO, UsuariosService } from '../usuarios/usuarios.service';
import { CreateClienteDto, UpdateClienteDto } from './dto/clientes.dto';
import { lanzarErrorDb, sinUndefined } from '../common/db';

// El select explícito evita que la relación `usuario` arrastre la contraseña o los tokens
const SELECT_CLIENTE: FindOptionsSelect<Cliente> = {
  id_usuario: true,
  nro_cuenta: true,
  direccion: true,
  nit: true,
  usuario: SELECT_PUBLICO,
};

@Injectable()
export class ClientesService {
  private readonly logger = new Logger(ClientesService.name);

  constructor(
    @InjectRepository(Cliente)
    private readonly repo: Repository<Cliente>,
    private readonly dataSource: DataSource,
    private readonly usuariosService: UsuariosService,
  ) {}

  listar() {
    return this.repo.find({
      relations: { usuario: true },
      select: SELECT_CLIENTE,
      order: { id_usuario: 'ASC' },
    });
  }

  async obtener(id: string) {
    const cliente = await this.repo.findOne({
      where: { id_usuario: id },
      relations: { usuario: true },
      select: SELECT_CLIENTE,
    });
    if (!cliente) throw new NotFoundException('Cliente no encontrado.');
    return cliente;
  }

  /** Crea usuario (rol CLIENTE) + cliente en una sola transacción. */
  async crear(dto: CreateClienteDto) {
    const { nro_cuenta, direccion, nit, ...datosUsuario } = dto;

    try {
      return await this.dataSource.transaction(async (manager) => {
        const { id_usuario } = await this.usuariosService.inserta(
          { ...datosUsuario, tipo_usuario: 'CLIENTE' },
          manager,
        );
        await manager.insert(Cliente, { id_usuario, nro_cuenta, direccion, nit });
        return { mensaje: 'Cliente registrado con éxito.', id_usuario };
      });
    } catch (error) {
      lanzarErrorDb(error, this.logger, 'crear', 'el cliente');
    }
  }

  async actualizar(id: string, dto: UpdateClienteDto) {
    const cambios = sinUndefined({
      nro_cuenta: dto.nro_cuenta,
      direccion: dto.direccion,
      nit: dto.nit,
    });
    if (Object.keys(cambios).length === 0) {
      throw new BadRequestException('No hay campos válidos para actualizar.');
    }

    try {
      const res = await this.repo.update({ id_usuario: id }, cambios);
      if (!res.affected) throw new NotFoundException('Cliente no encontrado.');
    } catch (error) {
      lanzarErrorDb(error, this.logger, 'actualizar', 'el cliente');
    }
    return this.obtener(id);
  }

  async eliminar(id: string) {
    try {
      await this.dataSource.transaction(async (manager) => {
        // Se borra primero la fila del rol: si no existe, el id no es de un cliente
        const res = await manager.delete(Cliente, { id_usuario: id });
        if (!res.affected) throw new NotFoundException('Cliente no encontrado.');
        await manager.delete(Usuario, { id_usuario: id });
      });
      return { mensaje: 'Cliente eliminado.' };
    } catch (error) {
      lanzarErrorDb(error, this.logger, 'eliminar', 'el cliente');
    }
  }
}
