-- INDICES ADICIONALES

CREATE INDEX ix_auditoria_evento ON public.auditoria USING btree (evento);

CREATE INDEX ix_auditoria_fecha ON public.auditoria USING btree (fecha DESC);

CREATE INDEX ix_auditoria_usuario ON public.auditoria USING btree (id_usuario);

CREATE UNIQUE INDEX ux_usuarios_correo_lower ON public.usuarios USING btree (lower(correo));
