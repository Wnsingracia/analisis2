import {
  Injectable,
  Logger,
  BadRequestException,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsSelect, Not, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entities/usuario.entity';
import { CreateUserDto, UpdateUserDto, TIPOS_USUARIO } from './dto/usuarios.dto';

const SALT_ROUNDS = 10;

// Nunca incluir contrasenia, reset_token, reset_token_expira,
// intentos_fallidos ni bloqueado_hasta
const SELECT_PUBLICO: FindOptionsSelect<Usuario> = {
  id_usuario: true,
  nombres: true,
  ap_pat: true,
  ap_mat: true,
  cel: true,
  correo: true,
  genero: true,
  tipo_usuario: true,
  fecha_creacion: true,
};

const CAMPOS_EDITABLES = ['nombres', 'ap_pat', 'ap_mat', 'correo', 'genero'] as const;

// QueryFailedError guarda el código de Postgres en driverError.code
const codigoPg = (error: any): string | undefined =>
  error?.driverError?.code ?? error?.code;

@Injectable()
export class UsuariosService {
  private readonly logger = new Logger(UsuariosService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  // ---------- Consultas ----------

  obtTodo() {
    return this.usuarioRepo.find({
      select: SELECT_PUBLICO,
      order: { id_usuario: 'ASC' },
    });
  }

  async obtUsuario(id: string | number) {
    return (
      (await this.usuarioRepo.findOne({
        where: { id_usuario: String(id) },
        select: SELECT_PUBLICO,
      })) ?? null
    );
  }

  // ---------- Creación ----------

  /**
   * Crea solo la fila de `usuarios`. Si el módulo de clientes/empleados/etc.
   * necesita crear su subtabla en la misma transacción, pasa su `manager`.
   */
  async inserta(dto: CreateUserDto, manager?: EntityManager) {
    const tipo_usuario = String(dto.tipo_usuario ?? '').toUpperCase();

    if (!(TIPOS_USUARIO as readonly string[]).includes(tipo_usuario)) {
      throw new BadRequestException(
        `tipo_usuario inválido. Valores permitidos: ${TIPOS_USUARIO.join(', ')}`,
      );
    }

    const repo = manager ? manager.getRepository(Usuario) : this.usuarioRepo;

    try {
      const existente = await repo.findOne({
        where: { correo: dto.correo },
        select: { id_usuario: true },
      });
      if (existente) {
        throw new ConflictException('Ya existe un usuario con ese correo.');
      }

      // Clientes 700001+, personal 100001+
      const secuencia =
        tipo_usuario === 'CLIENTE' ? 'seq_id_clientes' : 'seq_id_personal';
      const [{ nuevo_id }] = await repo.manager.query(
        `SELECT nextval('${secuencia}') AS nuevo_id`,
      );

      const usuario = repo.create({
        ...dto,
        id_usuario: String(nuevo_id),
        cel: dto.cel ? Number(dto.cel) : null,
        contrasenia: await bcrypt.hash(dto.contrasenia, SALT_ROUNDS),
        tipo_usuario,
      });

      await repo.save(usuario);

      return {
        mensaje: `Usuario [${tipo_usuario}] registrado con éxito.`,
        id_usuario: usuario.id_usuario,
      };
    } catch (error: any) {
      if (error instanceof HttpException) throw error;

      // 23505 = unique violation (dos registros simultáneos con el mismo correo)
      if (codigoPg(error) === '23505') {
        throw new ConflictException('Ya existe un usuario con ese correo.');
      }

      this.logger.error('Error al registrar usuario', error?.stack ?? error);
      throw new InternalServerErrorException('No se pudo registrar el usuario.');
    }
  }

  // ---------- Actualización ----------

  async actualizar(id: string | number, dto: UpdateUserDto) {
    const idUsuario = String(id);

    const existe = await this.usuarioRepo.findOne({
      where: { id_usuario: idUsuario },
      select: { id_usuario: true },
    });
    if (!existe) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const cambios: Partial<Usuario> = {};

    // Lista blanca: solo estos campos se pueden tocar
    for (const campo of CAMPOS_EDITABLES) {
      if (dto[campo] !== undefined) {
        (cambios as any)[campo] = dto[campo];
      }
    }
    if (dto.cel !== undefined) {
      cambios.cel = dto.cel ? Number(dto.cel) : null;
    }
    if (dto.contrasenia) {
      cambios.contrasenia = await bcrypt.hash(dto.contrasenia, SALT_ROUNDS);
    }

    if (Object.keys(cambios).length === 0) {
      throw new BadRequestException('No hay campos válidos para actualizar.');
    }

    try {
      if (cambios.correo) {
        const duplicado = await this.usuarioRepo.findOne({
          where: { correo: cambios.correo, id_usuario: Not(idUsuario) },
          select: { id_usuario: true },
        });
        if (duplicado) {
          throw new ConflictException('Ya existe un usuario con ese correo.');
        }
      }

      await this.usuarioRepo.update(idUsuario, cambios);
      return this.obtUsuario(idUsuario);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      if (codigoPg(error) === '23505') {
        throw new ConflictException('Ya existe un usuario con ese correo.');
      }
      this.logger.error('Error al actualizar usuario', error?.stack ?? error);
      throw new InternalServerErrorException('No se pudo actualizar el usuario.');
    }
  }

  // ---------- Eliminación ----------

  async eliminar(id: string | number) {
    try {
      const res = await this.usuarioRepo.delete(String(id));
      if (!res.affected) {
        throw new NotFoundException('Usuario no encontrado.');
      }
      return { mensaje: 'Usuario eliminado.' };
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      // 23503 = tiene registros relacionados (citas, mascotas, subtablas)
      if (codigoPg(error) === '23503') {
        throw new ConflictException(
          'No se puede eliminar: el usuario tiene registros relacionados.',
        );
      }
      this.logger.error('Error al eliminar usuario', error?.stack ?? error);
      throw new InternalServerErrorException('No se pudo eliminar el usuario.');
    }
  }
}