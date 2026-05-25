import { Injectable, Inject, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as pg from 'pg';
import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

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

            // =========================================================================
            // ENCRIPTIÓN CON BCRYPT (NUEVO)
            // =========================================================================
            const saltRounds = 10; // Estándar seguro y veloz
            const contraseniaHasheada = await bcrypt.hash(contrasenia, saltRounds);
            // =========================================================================

            // 2. Insertar en la tabla BASE (usuarios) - ◄ Pasamos 'contraseniaHasheada' en el parámetro $8
            const queryPadre = `
                INSERT INTO usuarios (id_usuario, nombres, ap_pat, ap_mat, cel, correo, genero, contrasenia, tipo_usuario) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `;
            await client.query(queryPadre, [id_usuario, nombres, ap_pat, ap_mat, cel, correo, genero, contraseniaHasheada, tipo_usuario]);

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

        } catch (error: any) {
            await client.query('ROLLBACK');
            throw new InternalServerErrorException(error.message || 'Error en la transacción Postgres');
        } finally {
            client.release();
        }
    }

    private obtenerEmailTransporter() {
        return nodemailer.createTransport({
            host: 'smtp.resend.com',
            port: 465,
            secure: true, // true para puerto 465
            auth: {
                user: 'resend', // Siempre es la palabra 'resend'
                pass: 're_6VKpdEZC_Bj1YYoNAxABRWudyu5i4nZ9G' // ◄ REEMPLAZA CON TU TOKEN DE RESEND
            }
        });
    }

    async solicitarRecuperacion(correo: string) {
        // 1. Verificar si el usuario existe en Postgres
        const res = await this.pool.query('SELECT id_usuario FROM usuarios WHERE correo = $1', [correo]);
        if (res.rows.length === 0) {
            return { mensaje: 'Si el correo está registrado, se enviará un enlace de restablecimiento de inmediato.' };
        }

        const id_usuario = res.rows[0].id_usuario;

        // 2. Generar token único y tiempo de vida (15 minutos)
        const token = crypto.randomBytes(32).toString('hex');
        const expira = new Date();
        expira.setMinutes(expira.getMinutes() + 15);

        // 3. Guardar el token en Postgres
        await this.pool.query(
            'UPDATE usuarios SET reset_token = $1, reset_token_expira = $2 WHERE id_usuario = $3',
            [token, expira, id_usuario]
        );

        // 4. ENVÍO REAL DEL CORREO ELECTRÓNICO
        const enlaceRecuperacion = `http://localhost:5173/reset-password?token=${token}`;
        const transporter = this.obtenerEmailTransporter();

        try {
            await transporter.sendMail({
                from: 'VetCare <onboarding@resend.dev>', // ◄ Remitente por defecto de Resend para pruebas
                to: correo, // ◄ El correo real del usuario que interactúa en React
                subject: '🔄 Restablece tu contraseña de VetCare',
                html: `
                    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; rounded-xl; border-radius: 16px;">
                        <h2 style="color: #0d9488; font-size: 22px; margin-bottom: 10px;">¡Hola desde VetCare! 🐾</h2>
                        <p style="color: #71717a; font-size: 14px; line-height: 1.5;">Hemos recibido una solicitud para restablecer la contraseña de tu cuenta corporativa / de cliente.</p>
                        <p style="color: #71717a; font-size: 14px; line-height: 1.5;">Para continuar, haz clic en el siguiente botón seguro. Este enlace tiene una validez de <strong>15 minutos</strong>.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${enlaceRecuperacion}" style="background-color: #0d9488; color: white; text-decoration: none; padding: 12px 24px; font-weight: bold; border-radius: 8px; font-size: 14px; display: inline-block;">Restablecer Contraseña</a>
                        </div>
                        
                        <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 20px 0;" />
                        <p style="color: #a1a1aa; font-size: 11px; text-align: center;">Si tú no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
                    </div>
                `
            });

            return { mensaje: 'Enlace de recuperación enviado directamente a tu bandeja de correo.' };

        } catch (error: any) {
            console.error("Error crítico enviando correo:", error);
            throw new InternalServerErrorException('No se pudo despachar el correo electrónico de recuperación.');
        }
    }
    async restablecerContrasenia(token: string, nuevaContrasenia: string) {
        // 1. Buscar al usuario en Postgres que posea exactamente ese token único
        const query = `
            SELECT id_usuario, reset_token_expira 
            FROM usuarios 
            WHERE reset_token = $1
        `;
        const res = await this.pool.query(query, [token]);

        if (res.rows.length === 0) {
            throw new BadRequestException('El token de recuperación es inválido.');
        }

        const usuario = res.rows[0];
        const ahora = new Date();

        // 2. Validar que el token no haya expirado en el tiempo especificado
        if (ahora > new Date(usuario.reset_token_expira)) {
            throw new BadRequestException('El token ha expirado. Por favor, solicita uno nuevo desde la web.');
        }

        // 3. Hashear la nueva contraseña de forma segura con Bcrypt (10 rounds estándar)
        const saltRounds = 10;
        const nuevaContraseniaHasheada = await bcrypt.hash(nuevaContrasenia, saltRounds);

        // 4. Actualizar la tabla de usuarios en Postgres y limpiar los campos del token (para que quede inusable)
        const queryActualizar = `
            UPDATE usuarios 
            SET contrasenia = $1, reset_token = NULL, reset_token_expira = NULL 
            WHERE id_usuario = $2
        `;
        await this.pool.query(queryActualizar, [nuevaContraseniaHasheada, usuario.id_usuario]);

        return { mensaje: 'Tu contraseña ha sido actualizada con éxito en la base de datos.' };
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
async obtenerTodosLosEmpleados() {
    // Unimos la tabla usuarios con empleados para traer los datos personales y laborales juntos
    const query = `
        SELECT 
            u.id_usuario, 
            u.nombres, 
            u.ap_pat, 
            u.ap_mat, 
            u.cel, 
            u.correo, 
            u.genero, 
            u.tipo_usuario,
            e.salario, 
            e.hora_ingreso, 
            e.hora_salida
        FROM usuarios u
        INNER JOIN empleados e ON u.id_usuario = e.id_usuario
        ORDER BY u.id_usuario DESC
    `;

    try {
        const resultado = await this.pool.query(query);
        return resultado.rows;
    } catch (error) {
        throw new InternalServerErrorException('Error al obtener la lista de empleados desde Postgres');
    }
}
async login(credenciales: any) {
    const { correo, contrasenia } = credenciales;

    // 1. Buscamos al usuario ÚNICAMENTE por correo
    const query = `
        SELECT u.id_usuario, u.nombres, u.ap_pat, u.correo, u.contrasenia, u.tipo_usuario, c.direccion, c.nro_cuenta
        FROM usuarios u
        LEFT JOIN clientes c ON u.id_usuario = c.id_usuario
        WHERE u.correo = $1
    `;
    
    const resultado = await this.pool.query(query, [correo]);

    // Si no encuentra el correo
    if (resultado.rows.length === 0) {
        throw new BadRequestException('Correo o contraseña incorrectos');
    }

    const usuarioLogueado = resultado.rows[0];

    // 2. Comparamos la contraseña en texto plano con el HASH de la base de datos
    const contraseniaEsValida = await bcrypt.compare(contrasenia, usuarioLogueado.contrasenia);

    // Si no coinciden, rebotamos el acceso
    if (!contraseniaEsValida) {
        throw new BadRequestException('Correo o contraseña incorrectos');
    }

    // 3. Si todo está bien, retornamos los datos limpios
    return {
        mensaje: 'Inicio de sesión correcto',
        cliente: {
            id: usuarioLogueado.id_usuario,
            nombres: usuarioLogueado.nombres,
            ap_pat: usuarioLogueado.ap_pat,
            correo: usuarioLogueado.correo,
            tipo_usuario: usuarioLogueado.tipo_usuario,
            nro_cuenta: usuarioLogueado.nro_cuenta
        }
    };
}
}