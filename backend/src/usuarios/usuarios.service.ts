import { Injectable, Inject, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as pg from 'pg';

@Injectable()
export class UsuariosService {
    constructor(@Inject('veterinaria_db') private pool: pg.Pool) {}

    // ==========================================
    // MÉTODOS DE OBTENCIÓN (SELECTS CON JOIN)
    // ==========================================

    async obtTodo() {
        const resultado = await this.pool.query('SELECT * FROM usuarios');
        return resultado.rows;
    }

    async obtUsuario(id: number) {
        const resultado = await this.pool.query('SELECT * FROM usuarios WHERE id_usuario = $1', [id]);
        return resultado.rows[0] || null;
    }

    // Obtener Veterinarios (usuarios -> empleados -> veterinarios)
    async obtTodosLosVeterinarios() {
        const query = `
            SELECT u.*, e.salario, e.hora_ingreso, e.hora_salida, v.especializacion, v.titulo
            FROM usuarios u
            INNER JOIN empleados e ON u.id_usuario = e.id_usuario
            INNER JOIN veterinarios v ON u.id_usuario = v.id_usuario
            WHERE u.tipo_usuario = 'VETERINARIO'
        `;
        const resultado = await this.pool.query(query);
        return resultado.rows;
    }

    // Obtener Estilistas (usuarios -> empleados -> estilistas)
    async obtTodosLosEstilistas() {
        const query = `
            SELECT u.*, e.salario, e.hora_ingreso, e.hora_salida, es.rol
            FROM usuarios u
            INNER JOIN empleados e ON u.id_usuario = e.id_usuario
            INNER JOIN estilistas es ON u.id_usuario = es.id_usuario
            WHERE u.tipo_usuario = 'ESTILISTA'
        `;
        const resultado = await this.pool.query(query);
        return resultado.rows;
    }

    // Obtener Recepcionistas (usuarios -> empleados -> recepcionistas)
    async obtTodosLosRecepcionistas() {
        const query = `
            SELECT u.*, e.salario, e.hora_ingreso, e.hora_salida, r.departamento
            FROM usuarios u
            INNER JOIN empleados e ON u.id_usuario = e.id_usuario
            INNER JOIN recepcionistas r ON u.id_usuario = r.id_usuario
            WHERE u.tipo_usuario = 'RECEPCIONISTA'
        `;
        const resultado = await this.pool.query(query);
        return resultado.rows;
    }

    async obtTodosLosAdministradores() {
        const query = `
            SELECT u.*, a.nvl_acceso FROM usuarios u
            INNER JOIN administradores a ON u.id_usuario = a.id_usuario
            WHERE u.tipo_usuario = 'ADMIN'
        `;
        const resultado = await this.pool.query(query);
        return resultado.rows;
    }

    // ==========================================
    // MÉTODO INSERTAR (TRANSACCIÓN RELACIONAL PURA)
    // ==========================================
    async inserta(usuario: any) {
        const { 
            nombres, ap_pat, ap_mat, cel, correo, genero, contrasenia, tipo_usuario, 
            nvl_acceso,                             // ADMIN
            nro_cuenta, direccion, nit,             // CLIENTE
            salario, hora_ingreso, hora_salida,     // EMPLEADOS (Común)
            departamento,                           // RECEPCIONISTA
            especializacion, titulo,                // VETERINARIO
            rol                                     // ESTILISTA
        } = usuario;

        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');

            // 1. Manejo de IDs con secuencias por rango (100001+ para personal, 700001+ para clientes)
            let querySecuencia = '';
            if (tipo_usuario === 'CLIENTE') {
                querySecuencia = "SELECT nextval('seq_id_clientes') AS nuevo_id";
            } else {
                querySecuencia = "SELECT nextval('seq_id_personal') AS nuevo_id";
            }

            const resSeq = await client.query(querySecuencia);
            const id_usuario = parseInt(resSeq.rows[0].nuevo_id);

            // 2. Insertar en la tabla BASE (usuarios)
            const queryPadre = `
                INSERT INTO usuarios (id_usuario, nombres, ap_pat, ap_mat, cel, correo, genero, contrasenia, tipo_usuario) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `;
            await client.query(queryPadre, [id_usuario, nombres, ap_pat, ap_mat, cel, correo, genero, contrasenia, tipo_usuario]);

            // 3. Insertar según el Rol específico de herencia
            if (tipo_usuario === 'ADMIN') {
                await client.query('INSERT INTO administradores (id_usuario, nvl_acceso) VALUES ($1, $2)', [id_usuario, nvl_acceso]);

            } else if (tipo_usuario === 'CLIENTE') {
                await client.query('INSERT INTO clientes (id_usuario, nro_cuenta, direccion, nit) VALUES ($1, $2, $3, $4)', [id_usuario, nro_cuenta, direccion, nit]);

            } else {
                // Si es RECEPCIONISTA, VETERINARIO o ESTILISTA, primero pasa por la tabla intermedia 'empleados'
                const queryEmpleado = `
                    INSERT INTO empleados (id_usuario, salario, hora_ingreso, hora_salida) 
                    VALUES ($1, $2, $3, $4)
                `;
                await client.query(queryEmpleado, [id_usuario, salario, hora_ingreso, hora_salida]);

                // Luego a su respectiva sub-tabla
                if (tipo_usuario === 'RECEPCIONISTA') {
                    await client.query('INSERT INTO recepcionistas (id_usuario, departamento) VALUES ($1, $2)', [id_usuario, departamento]);
                } else if (tipo_usuario === 'VETERINARIO') {
                    await client.query('INSERT INTO veterinarios (id_usuario, especializacion, titulo) VALUES ($1, $2, $3)', [id_usuario, especializacion, titulo]);
                } else if (tipo_usuario === 'ESTILISTA') {
                    await client.query('INSERT INTO estilistas (id_usuario, rol) VALUES ($1, $2)', [id_usuario, rol]);
                }
            }

            await client.query('COMMIT');
            return { mensaje: `Usuario [${tipo_usuario}] registrado con éxito en Postgres`, id_usuario };

        } catch (error) {
            await client.query('ROLLBACK');
            throw new InternalServerErrorException(error.message || 'Error en la transacción Postgres');
        } finally {
            client.release();
        }
    }
    // Obtener un cliente específico con sus datos unificados (usuarios -> clientes)
async obtClientePorId(id: number) {
    const query = `
        SELECT u.*, c.nro_cuenta, c.direccion, c.nit
        FROM usuarios u
        INNER JOIN clientes c ON u.id_usuario = c.id_usuario
        WHERE u.id_usuario = $1
    `;
    const resultado = await this.pool.query(query, [id]);
    return resultado.rows[0] || null;
}
async login(credenciales: any) {
    const { correo, contrasenia } = credenciales;

    // Buscamos el usuario base y traemos los datos de cliente por si acaso
    const query = `
        SELECT u.id_usuario, u.nombres, u.ap_pat, u.correo, u.tipo_usuario, c.direccion, c.nro_cuenta
        FROM usuarios u
        LEFT JOIN clientes c ON u.id_usuario = c.id_usuario
        WHERE u.correo = $1 AND u.contrasenia = $2
    `;
    
    const resultado = await this.pool.query(query, [correo, contrasenia]);

    if (resultado.rows.length === 0) {
        throw new BadRequestException('Correo o contraseña incorrectos');
    }

    const usuarioLogueado = resultado.rows[0];

    // ◄ AQUÍ QUITAMOS EL VALIDADOR DE CLIENTE EXCLUSIVO PARA QUE DEJE ENTRAR A TU ROL ADMIN

    return {
        mensaje: 'Inicio de sesión correcto',
        cliente: { // Mantenemos el nombre de la propiedad 'cliente' para no romper el tipado del frontend
            id: usuarioLogueado.id_usuario,
            nombres: usuarioLogueado.nombres,
            ap_pat: usuarioLogueado.ap_pat,
            correo: usuarioLogueado.correo,
            tipo_usuario: usuarioLogueado.tipo_usuario, // ◄ Vital que viaje el rol
            nro_cuenta: usuarioLogueado.nro_cuenta
        }
    };
}
}