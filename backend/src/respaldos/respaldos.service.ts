import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import * as fs from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import * as path from 'path';
import { google } from 'googleapis';
import { Cron, CronExpression } from '@nestjs/schedule';

import { AuditoriaService } from '../auditoria/auditoria.service';
import { escaparIdentificador } from './utils/respaldo.utils';
import { ResultadoRespaldo } from './interfaces/respaldo.interface';
import { ZipArchive } from 'archiver';

interface TablaBD {
    table_name: string;
}

interface ColumnaBD {
    column_name: string;
    data_type: string;
    not_null: boolean;
    default_value: string | null;
    identity_type: string;
    generated_type: string;
}

interface SecuenciaBD {
    sequence_name: string;
    start_value: string;
    min_value: string;
    max_value: string;
    increment_by: string;
    cache_size: string;
    cycle: boolean;
    last_value: string | null;
    dependencia: string | null;
    tabla: string | null;
    columna: string | null;
}

@Injectable()
export class RespaldosService {
    private readonly logger = new Logger(RespaldosService.name);
    private readonly esquema = 'public';

    constructor(
        private readonly dataSource: DataSource,
        readonly auditoria: AuditoriaService,
    ) {}

    private obtenerClienteDrive() {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUri = process.env.GOOGLE_REDIRECT_URI;
        const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

        if (!clientId || !clientSecret || !redirectUri || !refreshToken) {
            throw new Error(
                'Faltan credenciales OAuth2 de Google Drive en el archivo .env',
            );
        }

        const auth = new google.auth.OAuth2(
            clientId,
            clientSecret,
            redirectUri,
        );

        auth.setCredentials({
            refresh_token: refreshToken,
        });

        return google.drive({
            version: 'v3',
            auth,
        });
    }

    private comprimirDirectorio(origenDir: string,destinoZip: string,): Promise<void> {
            return new Promise((resolve, reject) => {
                const output = createWriteStream(destinoZip);

                const archive = new ZipArchive({
                    zlib: { level: 9 },
                });

                output.on('close', () => {
                    this.logger.log(
                        `ZIP generado correctamente: ${archive.pointer()} bytes`,
                    );
                    resolve();
                });

                output.on('error', reject);
                archive.on('error', reject);

                archive.pipe(output);
                archive.directory(origenDir, false);

                archive.finalize().catch(reject);
            });
        }

    private async verificarCarpetaDrive(drive: any, folderId: string) {
        try {
            const respuesta = await drive.files.get({
            fileId: folderId,
            fields: 'id, name, mimeType, trashed',
            });

            this.logger.log(
            `Carpeta Drive encontrada: ${respuesta.data.name}`
            );

            if (respuesta.data.mimeType !== 'application/vnd.google-apps.folder') {
            throw new Error('El ID proporcionado no corresponde a una carpeta.');
            }

            if (respuesta.data.trashed) {
            throw new Error('La carpeta se encuentra en la papelera de Drive.');
            }

        } catch (error) {
            this.logger.error(
            'No se pudo acceder a la carpeta de Google Drive',
            error
            );

            throw error;
        }
    }

    async generarRespaldoDrive(): Promise<ResultadoRespaldo> {
        // Primero genera y conserva el respaldo ZIP local
        const respaldoLocal = await this.generarRespaldo();

        const rutaZip = respaldoLocal.ruta;
        const nombreZip = path.basename(rutaZip);

        try {
            const drive = this.obtenerClienteDrive();

            const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

            if (!folderId) {
                throw new Error(
                    'No está configurado GOOGLE_DRIVE_FOLDER_ID',
                );
            }

            await this.verificarCarpetaDrive(drive, folderId);

            this.logger.log(
                `Subiendo ${nombreZip} a Google Drive...`,
            );

            const respuestaDrive = await drive.files.create({
                requestBody: {
                    name: nombreZip,
                    parents: [folderId],
                },
                media: {
                    mimeType: 'application/zip',
                    body: createReadStream(rutaZip),
                },
                fields: 'id, name, webViewLink',
            });

            this.logger.log(
                `Respaldo subido correctamente. ID: ${respuestaDrive.data.id}`,
            );

            await this.auditoria.registrar({
                evento: 'RESPALDO_DRIVE_GENERADO',
                recurso: `respaldos/${nombreZip}`,
                resultado: 'OK',
                detalle: {
                    nombre: nombreZip,
                    rutaLocal: rutaZip,
                    driveFileId: respuestaDrive.data.id,
                    webViewLink: respuestaDrive.data.webViewLink,
                    fecha: new Date().toISOString(),
                },
            });

            return {
                ...respaldoLocal,
                mensaje:
                    `Respaldo generado correctamente. ` +
                    `Archivo local: ${rutaZip}. ` +
                    `También se subió a Google Drive.`,
            };

        } catch (error) {
            await this.auditoria.registrar({
                evento: 'RESPALDO_DRIVE_ERROR',
                recurso: `respaldos/${nombreZip}`,
                resultado: 'ERROR',
                detalle: {
                    rutaLocal: rutaZip,
                    mensaje: error instanceof Error
                        ? error.message
                        : String(error),
                },
            });

            this.logger.error(
                'Error al generar respaldo en Google Drive',
                error,
            );

            throw new InternalServerErrorException(
                'El respaldo ZIP se creó correctamente en el servidor local, pero ocurrió un problema al sincronizarlo con Google Drive.',
            );
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_2AM)
    async handleCronRespaldoAutomatico() {
        this.logger.log('Iniciando respaldo automático programado (con subida a Drive)...');
        try {
            // Opcional: Si quieres que el cron suba directo a Drive, usa generarRespaldoDrive()
            const resultado = await this.generarRespaldoDrive();
            this.logger.log(`Respaldo automático en Drive exitoso: ${resultado.nombre}`);
        } catch (error) {
            this.logger.error('El respaldo automático diario falló.', error);
        }
    }

    async generarRespaldo(): Promise<ResultadoRespaldo> {
        const fecha = new Date();
        const identificador = fecha.toISOString().replace(/[:.]/g, '-');
        const nombre = `backup_${identificador}`;

        const directorio = path.resolve(process.cwd(),'backups','locales',nombre,);

        const rutaZip = `${directorio}.zip`;
        const nombreZip = `${nombre}.zip`;

        await this.auditoria.registrar({
            evento: 'RESPALDO_INICIADO',
            recurso: `respaldos/${nombreZip}`,
            resultado: 'OK',
            detalle: {
                nombre,
                fecha: fecha.toISOString(),
            },
        });

        try {
            // Crear directorio de respaldo
            await fs.mkdir(directorio, { recursive: true });

            // Exportar la base de datos
            const archivos = await this.dataSource.transaction(
                'REPEATABLE READ',
                async (manager) => {
                    await manager.query('SET TRANSACTION READ ONLY');
                    return this.exportarBaseDatos(manager);
                },
            );

            // Guardar archivos SQL
            for (const [archivo, contenido] of Object.entries(archivos)) {
                await fs.writeFile(
                    path.join(directorio, archivo),
                    contenido,
                    'utf8',
                );
            }

            // Crear manifiesto del respaldo
            const manifest = {
                nombre,
                fecha: fecha.toISOString(),
                formato: 'ZIP',
                archivo: nombreZip,
                contenido: Object.keys(archivos),
                esquema: this.esquema,
            };

            await fs.writeFile(
                path.join(directorio, 'manifest.json'),
                JSON.stringify(manifest, null, 2),
                'utf8',
            );

            // Comprimir la carpeta y conservar el ZIP localmente
            this.logger.log(`Comprimiendo respaldo: ${nombreZip}`);

            await this.comprimirDirectorio(directorio, rutaZip);

            // Obtener tamaño real del archivo comprimido
            const informacionZip = await fs.stat(rutaZip);

            const resultado: ResultadoRespaldo = {
                exitoso: true,
                nombre: nombreZip,
                fecha: fecha.toISOString(),
                ruta: rutaZip,
                tamanoBytes: informacionZip.size,
                mensaje: 'Respaldo SQL comprimido y guardado localmente correctamente.',
            };

            await this.auditoria.registrar({
                evento: 'RESPALDO_GENERADO',
                recurso: `respaldos/${nombreZip}`,
                resultado: 'OK',
                detalle: {
                    nombre: nombreZip,
                    ruta: rutaZip,
                    tamanoBytes: informacionZip.size,
                    cantidadArchivos: Object.keys(archivos).length + 1,
                    fecha: fecha.toISOString(),
                },
            });

            this.logger.log(`Respaldo local generado: ${rutaZip}`);

            return resultado;

        } catch (error) {
            // Eliminar ZIP incompleto si ocurrió algún error
            await fs.unlink(rutaZip).catch(() => null);

            await this.auditoria.registrar({
                evento: 'RESPALDO_ERROR',
                recurso: `respaldos/${nombreZip}`,
                resultado: 'ERROR',
                detalle: {
                    nombre,
                    mensaje: error instanceof Error
                        ? error.message
                        : 'Error desconocido',
                },
            });

            this.logger.error(
                'Error generando respaldo',
                error instanceof Error ? error.stack : String(error),
            );

            throw new InternalServerErrorException(
                'No se pudo generar el respaldo local de la base de datos.',
            );
        }
    }

    private async exportarBaseDatos(manager: EntityManager): Promise<Record<string, string>> {
        const tablas = await manager.query(
            `
            SELECT c.relname AS table_name
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = $1
                AND c.relkind IN ('r', 'p')
            ORDER BY c.relname
            `,
            [this.esquema],
        ) as TablaBD[];

        const estructura: string[] = [
            '-- ESTRUCTURA DE VETCARE',
            '-- Esquema public',
            'CREATE SCHEMA IF NOT EXISTS public;',
            '',
        ];

        const datos: string[] = [
            '-- DATOS DE VETCARE',
            '-- Registros exportados desde public',
            '',
        ];

        const restricciones: string[] = ['-- RESTRICCIONES DE LAS TABLAS', ''];
        const indices: string[] = ['-- INDICES ADICIONALES', ''];
        const secuencias: string[] = ['-- DEFINICION Y VALORES DE SECUENCIAS', ''];
        const funciones: string[] = ['-- FUNCIONES Y PROCEDIMIENTOS', ''];
        const triggers: string[] = ['-- TRIGGERS', ''];
        const politicas: string[] = ['-- SEGURIDAD RLS', ''];

        const listaSecuencias = await this.obtenerSecuencias(manager);

        for (const secuencia of listaSecuencias) {
            if (secuencia.dependencia === 'i') {
                continue;
            }

            const nombreSecuencia = escaparIdentificador(secuencia.sequence_name);

            estructura.push(
                `CREATE SEQUENCE IF NOT EXISTS public.${nombreSecuencia}`,
                `    AS bigint`,
                `    INCREMENT BY ${secuencia.increment_by}`,
                `    MINVALUE ${secuencia.min_value}`,
                `    MAXVALUE ${secuencia.max_value}`,
                `    START WITH ${secuencia.start_value}`,
                `    CACHE ${secuencia.cache_size}`,
                `    ${secuencia.cycle ? 'CYCLE' : 'NO CYCLE'};`,
                '',
            );
        }

        for (const tabla of tablas) {
            const nombreTabla = escaparIdentificador(tabla.table_name);

            const columnas = await manager.query(
                `
                SELECT
                a.attname AS column_name,
                pg_catalog.format_type(
                    a.atttypid,
                    a.atttypmod
                ) AS data_type,
                a.attnotnull AS not_null,
                pg_get_expr(d.adbin, d.adrelid) AS default_value,
                a.attidentity AS identity_type,
                a.attgenerated AS generated_type
                FROM pg_attribute a
                JOIN pg_class c ON c.oid = a.attrelid
                JOIN pg_namespace n ON n.oid = c.relnamespace
                LEFT JOIN pg_attrdef d
                ON d.adrelid = c.oid
                AND d.adnum = a.attnum
                WHERE n.nspname = $1
                AND c.relname = $2
                AND a.attnum > 0
                AND NOT a.attisdropped
                ORDER BY a.attnum
                `,
                [this.esquema, tabla.table_name],
            ) as ColumnaBD[];

            const definiciones = columnas.map((columna) => {
                let definicion =
                    `${escaparIdentificador(columna.column_name)} ` +
                    columna.data_type;

                if (columna.identity_type === 'a') {
                    definicion += ' GENERATED ALWAYS AS IDENTITY';
                } else if (columna.identity_type === 'd') {
                    definicion += ' GENERATED BY DEFAULT AS IDENTITY';
                } else if (columna.generated_type === 's') {
                    definicion += ` GENERATED ALWAYS AS (${columna.default_value}) STORED`;
                } else if (columna.default_value) {
                    definicion += ` DEFAULT ${columna.default_value}`;
                }

                if (columna.not_null) {
                    definicion += ' NOT NULL';
                }

                return `    ${definicion}`;
            });

            estructura.push(
                `CREATE TABLE IF NOT EXISTS public.${nombreTabla} (`,
                definiciones.join(',\n'),
                ');',
                '',
            );

            const columnasExportables = columnas.filter(
                (columna) => columna.generated_type !== 's',
            );

            if (columnasExportables.length > 0) {
                const expresiones = columnasExportables
                    .map((columna) => {
                        const nombreColumna = escaparIdentificador(columna.column_name);
                        return `quote_nullable(t.${nombreColumna}) AS ${nombreColumna}`;
                    })
                    .join(', ');

                const registros = await manager.query(
                    `SELECT ${expresiones} FROM public.${nombreTabla} AS t`,
                );

                const nombresColumnas = columnasExportables
                    .map((columna) => escaparIdentificador(columna.column_name))
                    .join(', ');

                const identidadSiempre = columnasExportables.some(
                    (columna) => columna.identity_type === 'a',
                );

                const sobrescribirIdentidad = identidadSiempre ? ' OVERRIDING SYSTEM VALUE' : '';

                for (const registro of registros) {
                    const valoresSQL = Object.values(registro).join(', ');
                    datos.push(
                        `INSERT INTO public.${nombreTabla} (${nombresColumnas})${sobrescribirIdentidad} VALUES (${valoresSQL});`,
                    );
                }
            } else {
                const registros = await manager.query(`SELECT 1 FROM public.${nombreTabla}`);
                for (const _registro of registros) {
                    datos.push(`INSERT INTO public.${nombreTabla} DEFAULT VALUES;`);
                }
            }

            datos.push('');
        }

        const listaRestricciones = await manager.query(
            `
            SELECT
                c.relname AS tabla,
                con.conname AS nombre,
                pg_get_constraintdef(con.oid, true) AS definicion
            FROM pg_constraint con
            JOIN pg_class c ON c.oid = con.conrelid
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = $1
                AND con.contype IN ('p', 'f', 'u', 'c', 'x')
            ORDER BY
                CASE con.contype
                WHEN 'p' THEN 1
                WHEN 'u' THEN 2
                WHEN 'f' THEN 3
                ELSE 4
                END,
                c.relname
            `,
            [this.esquema],
        );

        for (const restriccion of listaRestricciones) {
            restricciones.push(
                `ALTER TABLE public.${escaparIdentificador(restriccion.tabla)}`,
                `ADD CONSTRAINT ${escaparIdentificador(restriccion.nombre)} ${restriccion.definicion};`,
                '',
            );
        }

        const listaIndices = await manager.query(
            `
            SELECT indexdef
            FROM pg_indexes i
            WHERE schemaname = $1
                AND NOT EXISTS (
                SELECT 1
                FROM pg_constraint c
                WHERE c.conindid = (
                    SELECT ci.oid
                    FROM pg_class ci
                    JOIN pg_namespace ni
                    ON ni.oid = ci.relnamespace
                    WHERE ni.nspname = i.schemaname
                    AND ci.relname = i.indexname
                )
                )
            ORDER BY tablename, indexname
            `,
            [this.esquema],
        );

        for (const indice of listaIndices) {
            indices.push(`${indice.indexdef};`, '');
        }

        const listaFunciones = await manager.query(
            `
            SELECT pg_get_functiondef(p.oid) AS definicion
            FROM pg_proc p
            JOIN pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = $1
                AND p.prokind IN ('f', 'p')
            ORDER BY p.proname
            `,
            [this.esquema],
        );

        for (const funcion of listaFunciones) {
            funciones.push(`${funcion.definicion};`, '');
        }

        const listaTriggers = await manager.query(
            `
            SELECT
                c.relname AS tabla,
                pg_get_triggerdef(t.oid, true) AS definicion
            FROM pg_trigger t
            JOIN pg_class c ON c.oid = t.tgrelid
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = $1
                AND NOT t.tgisinternal
            ORDER BY c.relname, t.tgname
            `,
            [this.esquema],
        );

        for (const trigger of listaTriggers) {
            triggers.push(
                `-- Tabla: ${trigger.tabla}`,
                `${trigger.definicion};`,
                '',
            );
        }

        const listaRLS = await manager.query(
            `
            SELECT
                c.relname AS tabla,
                c.relrowsecurity AS habilitado,
                c.relforcerowsecurity AS obligatorio
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = $1
                AND c.relkind IN ('r', 'p')
            ORDER BY c.relname
            `,
            [this.esquema],
        );

        for (const tabla of listaRLS) {
            if (tabla.habilitado) {
                politicas.push(
                    `ALTER TABLE public.${escaparIdentificador(tabla.tabla)} ENABLE ROW LEVEL SECURITY;`,
                );
            }
            if (tabla.obligatorio) {
                politicas.push(
                    `ALTER TABLE public.${escaparIdentificador(tabla.tabla)} FORCE ROW LEVEL SECURITY;`,
                );
            }
        }

        const listaPoliticas = await manager.query(
            `
            SELECT
                tablename,
                policyname,
                permissive,
                roles,
                cmd,
                qual,
                with_check
            FROM pg_policies
            WHERE schemaname = $1
            ORDER BY tablename, policyname
            `,
            [this.esquema],
        );

        for (const politica of listaPoliticas) {
            const roles = (politica.roles as string[])
                .map((rol) => rol === 'public' ? 'PUBLIC' : escaparIdentificador(rol))
                .join(', ');

            let sentencia =
                `CREATE POLICY ${escaparIdentificador(politica.policyname)} ` +
                `ON public.${escaparIdentificador(politica.tablename)} ` +
                `AS ${politica.permissive} ` +
                `FOR ${politica.cmd} TO ${roles}`;

            if (politica.qual) {
                sentencia += ` USING (${politica.qual})`;
            }
            if (politica.with_check) {
                sentencia += ` WITH CHECK (${politica.with_check})`;
            }

            politicas.push(`${sentencia};`, '');
        }

        for (const secuencia of listaSecuencias) {
            const nombreSecuencia = escaparIdentificador(secuencia.sequence_name);
            const estado = await manager.query(
                `SELECT last_value, is_called FROM public.${nombreSecuencia}`,
            );

            const ultimoValor = estado[0]?.last_value ?? secuencia.start_value;
            const fueUtilizada = estado[0]?.is_called ?? false;

            secuencias.push(
                `SELECT setval('public.${secuencia.sequence_name}', ${ultimoValor}, ${fueUtilizada ? 'true' : 'false'});`,
                '',
            );
        }

        for (const secuencia of listaSecuencias) {
            if (
                secuencia.dependencia === 'a' &&
                secuencia.tabla &&
                secuencia.columna
            ) {
                secuencias.push(
                    `ALTER SEQUENCE public.${escaparIdentificador(secuencia.sequence_name)} ` +
                    `OWNED BY public.${escaparIdentificador(secuencia.tabla)}.${escaparIdentificador(secuencia.columna)};`,
                    '',
                );
            }
        }

        return {
            'estructura.sql': estructura.join('\n'),
            'datos.sql': datos.join('\n'),
            'restricciones.sql': restricciones.join('\n'),
            'indices.sql': indices.join('\n'),
            'secuencias.sql': secuencias.join('\n'),
            'funciones.sql': funciones.join('\n'),
            'triggers.sql': triggers.join('\n'),
            'politicas.sql': politicas.join('\n'),
        };
    }

    private async obtenerSecuencias(manager: EntityManager): Promise<SecuenciaBD[]> {
        const secuencias = await manager.query(
            `
            SELECT
                s.sequencename AS sequence_name,
                s.start_value,
                s.min_value,
                s.max_value,
                s.increment_by,
                s.cache_size,
                s.cycle,
                s.last_value,
                d.deptype AS dependencia,
                t.relname AS tabla,
                a.attname AS columna
            FROM pg_sequences s
            LEFT JOIN pg_class seq
                ON seq.relname = s.sequencename
            LEFT JOIN pg_namespace ns
                ON ns.oid = seq.relnamespace
               AND ns.nspname = s.schemaname
            LEFT JOIN pg_depend d
                ON d.objid = seq.oid
               AND d.refclassid = 'pg_class'::regclass
            LEFT JOIN pg_class t
                ON t.oid = d.refobjid
            LEFT JOIN pg_attribute a
                ON a.attrelid = t.oid
               AND a.attnum = d.refobjsubid
            WHERE s.schemaname = $1
            ORDER BY s.sequencename
            `,
            [this.esquema],
        );

        return secuencias;
    }

    private async calcularTamano(directorio: string): Promise<number> {
        const archivos = await fs.readdir(directorio);
        let total = 0;

        for (const archivo of archivos) {
            const informacion = await fs.stat(path.join(directorio, archivo));
            if (informacion.isFile()) {
                total += informacion.size;
            }
        }

        return total;
    }
}