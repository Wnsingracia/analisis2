-- RESTRICCIONES DE LAS TABLAS

ALTER TABLE public."administradores"
ADD CONSTRAINT "administradores_pkey" PRIMARY KEY (id_usuario);

ALTER TABLE public."auditoria"
ADD CONSTRAINT "auditoria_pkey" PRIMARY KEY (id_evento);

ALTER TABLE public."citas"
ADD CONSTRAINT "citas_pkey" PRIMARY KEY (id_cita);

ALTER TABLE public."clientes"
ADD CONSTRAINT "clientes_pkey" PRIMARY KEY (id_usuario);

ALTER TABLE public."configuracion_sistema"
ADD CONSTRAINT "configuracion_sistema_pkey" PRIMARY KEY (clave);

ALTER TABLE public."consultas"
ADD CONSTRAINT "consultas_pkey" PRIMARY KEY (id_cons_medica);

ALTER TABLE public."empleados"
ADD CONSTRAINT "empleados_pkey" PRIMARY KEY (id_usuario);

ALTER TABLE public."estilistas"
ADD CONSTRAINT "estilistas_pkey" PRIMARY KEY (id_usuario);

ALTER TABLE public."historial_cambios"
ADD CONSTRAINT "historial_cambios_pkey" PRIMARY KEY (id_cambio);

ALTER TABLE public."mascotas"
ADD CONSTRAINT "mascotas_pkey" PRIMARY KEY (id_mascota, id_cliente);

ALTER TABLE public."recepcionistas"
ADD CONSTRAINT "recepcionistas_pkey" PRIMARY KEY (id_usuario);

ALTER TABLE public."tratamientos"
ADD CONSTRAINT "tratamientos_pkey" PRIMARY KEY (id_tratamiento);

ALTER TABLE public."usuarios"
ADD CONSTRAINT "usuarios_pkey" PRIMARY KEY (id_usuario);

ALTER TABLE public."veterinarios"
ADD CONSTRAINT "veterinarios_pkey" PRIMARY KEY (id_usuario);

ALTER TABLE public."administradores"
ADD CONSTRAINT "administradores_id_usuario_fkey" FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario);

ALTER TABLE public."citas"
ADD CONSTRAINT "citas_id_recepcionista_fkey" FOREIGN KEY (id_recepcionista) REFERENCES recepcionistas(id_usuario);

ALTER TABLE public."citas"
ADD CONSTRAINT "citas_id_cliente_fkey" FOREIGN KEY (id_cliente) REFERENCES clientes(id_usuario);

ALTER TABLE public."clientes"
ADD CONSTRAINT "clientes_id_usuario_fkey" FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario);

ALTER TABLE public."consultas"
ADD CONSTRAINT "consultas_id_veterinario_fkey" FOREIGN KEY (id_veterinario) REFERENCES veterinarios(id_usuario);

ALTER TABLE public."consultas"
ADD CONSTRAINT "consultas_id_cita_fkey" FOREIGN KEY (id_cita) REFERENCES citas(id_cita);

ALTER TABLE public."empleados"
ADD CONSTRAINT "empleados_id_usuario_fkey" FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario);

ALTER TABLE public."estilistas"
ADD CONSTRAINT "estilistas_id_usuario_fkey" FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario);

ALTER TABLE public."mascotas"
ADD CONSTRAINT "mascotas_id_cliente_fkey" FOREIGN KEY (id_cliente) REFERENCES clientes(id_usuario);

ALTER TABLE public."recepcionistas"
ADD CONSTRAINT "recepcionistas_id_usuario_fkey" FOREIGN KEY (id_usuario) REFERENCES empleados(id_usuario);

ALTER TABLE public."tratamientos"
ADD CONSTRAINT "tratamientos_id_cons_medica_fkey" FOREIGN KEY (id_cons_medica) REFERENCES consultas(id_cons_medica);

ALTER TABLE public."veterinarios"
ADD CONSTRAINT "veterinarios_id_usuario_fkey" FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario);

ALTER TABLE public."configuracion_sistema"
ADD CONSTRAINT "ck_config_modo" CHECK (clave <> 'modo'::text OR (valor = ANY (ARRAY['NORMAL'::text, 'EXPEDIENTES_CONGELADOS'::text, 'SOLO_LECTURA'::text])));

ALTER TABLE public."usuarios"
ADD CONSTRAINT "ck_usuarios_estado" CHECK (estado = ANY (ARRAY['ACTIVA'::text, 'SUSPENDIDA'::text, 'REVOCADA'::text]));

ALTER TABLE public."usuarios"
ADD CONSTRAINT "usuarios_estado_check" CHECK (estado = ANY (ARRAY['ACTIVA'::text, 'SUSPENDIDA'::text, 'REVOCADA'::text]));
