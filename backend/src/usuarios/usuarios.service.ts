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
import {
  DataSource,
  EntityManager,
  EntityTarget,
  FindOptionsSelect,
  Not,
  Repository,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entities/usuario.entity';
import {
  CreateUserDto,
  UpdateUserDto,
  TIPOS_USUARIO,
  ESTADOS_CUENTA,
  ROLES_PERSONAL,
  CambiarRolDto,
  EstadoCuenta,
} from './dto/usuarios.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { BCRYPT_ROUNDS } from '../common/contrasenia';
import { contextoActual } from '../common/contexto';
import { Empleado } from '../empleados/entities/empleados.entity';
import { Veterinario } from '../veterinarios/entities/veterinarios.entity';
import { Estilista } from '../estilistas/entities/estilistas.entity';
import { Recepcionista } from '../recepcionistas/entities/recepcionistas.entity';
import { Administradores } from '../administradores/entities/administradores.entity';


// Nunca incluir contrasenia, reset_token, reset_token_expira,
// intentos_fallidos ni bloqueado_hasta
export const SELECT_PUBLICO: FindOptionsSelect<Usuario> = {
  id_usuario: true,
  nombres: true,
  ap_pat: true,
  ap_mat: true,
  cel: true,
  correo: true,
  genero: true,
  tipo_usuario: true,
  fecha_creacion: true,
  estado: true,
  es_emergencia: true,
};

// Para el listado de administración: además del estado, por qué y cuándo cambió
const SELECT_ADMIN_USUARIOS: FindOptionsSelect<Usuario> = {
  ...SELECT_PUBLICO,
  motivo_estado: true,
  fecha_estado: true,
};

// Tabla de rol de cada tipo de usuario (para el cambio de función)
const TABLA_ROL: Record<string, EntityTarget<any>> = {
  ADMIN: Administradores,
  VETERINARIO: Veterinario,
  ESTILISTA: Estilista,
  RECEPCIONISTA: Recepcionista,
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
    private readonly dataSource: DataSource,
    private readonly auditoria: AuditoriaService,
  ) {}

  // ---------- Consultas ----------

  obtTodo(tipo?: string) {
    return this.usuarioRepo.find({
      select: SELECT_ADMIN_USUARIOS,
      where: tipo ? { tipo_usuario: tipo } : {},
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
        contrasenia: await bcrypt.hash(dto.contrasenia, BCRYPT_ROUNDS),
        tipo_usuario,
      });

      await repo.save(usuario);

      // Alta: queda registrada (dentro de la misma transacción si la hay)
      await this.auditoria.registrar(
        {
          evento: 'ALTA_IDENTIDAD',
          recurso: `usuarios/${usuario.id_usuario}`,
          detalle: {
            tipo_usuario,
            origen: contextoActual()?.user ? 'creada_por_administrador' : 'autoregistro',
          },
        },
        manager,
      );

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
      cambios.contrasenia = await bcrypt.hash(dto.contrasenia, BCRYPT_ROUNDS);
      // Cambiar la contraseña invalida las sesiones abiertas con la clave anterior
      (cambios as any).token_version = () => 'token_version + 1';
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

      await this.usuarioRepo.update(idUsuario, cambios as any);
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

  // ---------- Sesiones ----------

  /** Parte 2-d: invalida TODAS las sesiones abiertas de una cuenta (p. ej. cuenta comprometida). */
  async revocarSesiones(id: string | number) {
    const idUsuario = String(id);
    const res = await this.usuarioRepo.update(idUsuario, {
      token_version: () => 'token_version + 1',
    } as any);
    if (!res.affected) throw new NotFoundException('Usuario no encontrado.');
    await this.auditoria.registrar({
      evento: 'SESIONES_REVOCADAS',
      recurso: `usuarios/${idUsuario}`,
    });
    return { mensaje: 'Se cerraron todas las sesiones de la cuenta.' };
  }

  // ---------- Ciclo de vida de la identidad ----------

  /** Baja lógica: la identidad pasa a REVOCADA y su historial se conserva. */
  async eliminar(id: string | number) {
    await this.cambiarEstado(id, 'REVOCADA', 'Baja de la identidad');
    return { mensaje: 'Identidad dada de baja (REVOCADA). El historial se conserva.' };
  }

  /** Igual que eliminar, pero comprobando que el usuario tiene el rol esperado. */
  async darDeBaja(id: string | number, rolEsperado: string, motivo = 'Baja de la identidad') {
    await this.cambiarEstado(id, 'REVOCADA', motivo, rolEsperado);
  }

  /**
   * Activa, suspende o revoca una identidad.
   * - ACTIVA <-> SUSPENDIDA es reversible; REVOCADA es definitiva.
   * - Nadie puede suspender ni revocar su propia cuenta.
   * - No se puede dejar el sistema sin un administrador activo.
   * - El cambio y su registro de auditoría van en la misma transacción.
   */
  async cambiarEstado(
    id: string | number,
    estado: EstadoCuenta,
    motivo?: string,
    rolEsperado?: string,
  ) {
    const idUsuario = String(id);
    if (!(ESTADOS_CUENTA as readonly string[]).includes(estado)) {
      throw new BadRequestException(`Estado inválido. Valores: ${ESTADOS_CUENTA.join(', ')}`);
    }
    const motivoLimpio = motivo?.trim() || null;
    if (estado !== 'ACTIVA' && !motivoLimpio) {
      throw new BadRequestException('Debes indicar el motivo del cambio de estado.');
    }
    const actor = contextoActual()?.user;
    if (actor && String(actor.id_usuario) === idUsuario && estado !== 'ACTIVA') {
      throw new BadRequestException('No puedes suspender ni revocar tu propia cuenta.');
    }

    try {
      await this.dataSource.transaction(async (manager) => {
        const repo = manager.getRepository(Usuario);
        const usuario = await repo.findOne({
          where: { id_usuario: idUsuario },
          lock: { mode: 'pessimistic_write' },
        });
        if (
          !usuario ||
          (rolEsperado && String(usuario.tipo_usuario).toUpperCase() !== rolEsperado)
        ) {
          throw new NotFoundException('Usuario no encontrado.');
        }

        // Activar la cuenta de emergencia debe justificarse con el incidente que la motiva
        if (usuario.es_emergencia && estado === 'ACTIVA' && !motivoLimpio) {
          throw new BadRequestException(
            'Activar la cuenta de emergencia exige un motivo (el incidente que la justifica).',
          );
        }

        const anterior = usuario.estado;
        if (anterior === 'REVOCADA') {
          throw new ConflictException('Una identidad revocada no se puede modificar.');
        }
        if (anterior === estado) {
          throw new ConflictException(`La cuenta ya está ${estado}.`);
        }
        if (estado !== 'ACTIVA' && anterior === 'ACTIVA') {
          await this.exigirOtroAdminActivo(manager, usuario);
        }

        await repo.update(idUsuario, {
          estado,
          motivo_estado: estado === 'ACTIVA' && !usuario.es_emergencia ? null : motivoLimpio,
          fecha_estado: new Date(),
        });

        await this.auditoria.registrar(
          {
            evento: usuario.es_emergencia
              ? estado === 'ACTIVA'
                ? 'EMERGENCIA_ACTIVADA'
                : 'EMERGENCIA_DESACTIVADA'
              : estado === 'REVOCADA'
                ? 'BAJA_IDENTIDAD'
                : 'CAMBIO_ESTADO',
            recurso: `usuarios/${idUsuario}`,
            detalle: {
              estado_anterior: anterior,
              estado_nuevo: estado,
              motivo: motivoLimpio,
              tipo_usuario: usuario.tipo_usuario,
            },
          },
          manager,
        );
      });
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Error al cambiar el estado', error?.stack ?? error);
      throw new InternalServerErrorException('No se pudo cambiar el estado de la cuenta.');
    }
    return this.obtUsuario(idUsuario);
  }

  /**
   * Cambia la función (rol) de una persona del personal.
   * Solo ADMIN (lo exige el controlador), nunca sobre uno mismo, siempre con motivo
   * y con registro de auditoría con el rol anterior y el nuevo.
   */
  async cambiarRol(id: string | number, dto: CambiarRolDto) {
    const idUsuario = String(id);
    const nuevo = String(dto.tipo_usuario ?? '').toUpperCase();
    if (!(ROLES_PERSONAL as readonly string[]).includes(nuevo)) {
      throw new BadRequestException(
        `Rol de destino inválido. Valores: ${ROLES_PERSONAL.join(', ')}. Los clientes no cambian de función.`,
      );
    }
    const actor = contextoActual()?.user;
    if (actor && String(actor.id_usuario) === idUsuario) {
      throw new BadRequestException('No puedes cambiar tu propio rol.');
    }

    try {
      await this.dataSource.transaction(async (manager) => {
        const repo = manager.getRepository(Usuario);
        const usuario = await repo.findOne({
          where: { id_usuario: idUsuario },
          lock: { mode: 'pessimistic_write' },
        });
        if (!usuario) throw new NotFoundException('Usuario no encontrado.');
        if (usuario.estado !== 'ACTIVA') {
          throw new ConflictException('Solo se puede cambiar el rol de una cuenta ACTIVA.');
        }

        const anterior = String(usuario.tipo_usuario).toUpperCase();
        if (!(ROLES_PERSONAL as readonly string[]).includes(anterior)) {
          throw new BadRequestException('Los clientes no cambian de función.');
        }
        if (anterior === nuevo) {
          throw new BadRequestException('La persona ya tiene ese rol.');
        }
        if (anterior === 'ADMIN') await this.exigirOtroAdminActivo(manager, usuario);

        // 1. Se quita la fila del rol anterior. Si tiene historial (consultas, citas)
        //    la base de datos lo impide (FK) y se informa abajo con un 409.
        await manager.delete(TABLA_ROL[anterior], { id_usuario: idUsuario });

        // 2. El personal que no es admin necesita su fila en empleados
        if (nuevo !== 'ADMIN') {
          const yaEsEmpleado = await manager.count(Empleado, { where: { id_usuario: idUsuario } });
          if (!yaEsEmpleado) {
            await manager.insert(Empleado, {
              id_usuario: idUsuario,
              salario: dto.salario ?? null,
              hora_ingreso: dto.hora_ingreso ?? null,
              hora_salida: dto.hora_salida ?? null,
            });
          }
        }

        // 3. Fila del rol nuevo con sus datos propios
        const datosRol: Record<string, any> = { id_usuario: idUsuario };
        if (nuevo === 'VETERINARIO') {
          datosRol.especializacion = dto.especializacion ?? null;
          datosRol.titulo = dto.titulo ?? null;
        } else if (nuevo === 'ESTILISTA') {
          datosRol.rol = dto.rol ?? null;
        } else if (nuevo === 'RECEPCIONISTA') {
          datosRol.departamento = dto.departamento ?? null;
        } else {
          datosRol.nvl_acceso = dto.nvl_acceso ?? '';
        }
        await manager.insert(TABLA_ROL[nuevo], datosRol);

        // 4. El rol vigente (el guard lo lee de la base en cada petición)
        await repo.update(idUsuario, { tipo_usuario: nuevo });

        await this.auditoria.registrar(
          {
            evento: 'CAMBIO_ROL',
            recurso: `usuarios/${idUsuario}`,
            detalle: { rol_anterior: anterior, rol_nuevo: nuevo, motivo: dto.motivo.trim() },
          },
          manager,
        );
      });
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      if (codigoPg(error) === '23503') {
        throw new ConflictException(
          'No se puede cambiar el rol: la función actual tiene historial (consultas o citas). ' +
            'Suspende esta cuenta y crea una nueva para el nuevo rol.',
        );
      }
      this.logger.error('Error al cambiar el rol', error?.stack ?? error);
      throw new InternalServerErrorException('No se pudo cambiar el rol.');
    }
    return this.obtUsuario(idUsuario);
  }

  // Impide quedarse sin ningún administrador activo
  private async exigirOtroAdminActivo(manager: EntityManager, usuario: Usuario) {
    if (String(usuario.tipo_usuario).toUpperCase() !== 'ADMIN') return;
    if (usuario.es_emergencia) return; // la cuenta de emergencia no cuenta como administrador ordinario
    const otros = await manager
      .createQueryBuilder(Usuario, 'u')
      .where("UPPER(u.tipo_usuario) = 'ADMIN'")
      .andWhere("u.estado = 'ACTIVA'")
      .andWhere('u.es_emergencia = false')
      .andWhere('u.id_usuario <> :id', { id: usuario.id_usuario })
      .getCount();
    if (otros === 0) {
      throw new ConflictException('No se puede dejar el sistema sin un administrador activo.');
    }
  }
}
