-- DEFINICION Y VALORES DE SECUENCIAS

SELECT setval('public.auditoria_id_evento_seq', 308, true);

SELECT setval('public.historial_cambios_id_cambio_seq', 1, false);

SELECT setval('public.mascotas_id_mascota_seq', 2, true);

SELECT setval('public.seq_id_clientes', 700052, true);

SELECT setval('public.seq_id_personal', 100031, true);

ALTER SEQUENCE public."auditoria_id_evento_seq" OWNED BY public."auditoria"."id_evento";

ALTER SEQUENCE public."historial_cambios_id_cambio_seq" OWNED BY public."historial_cambios"."id_cambio";
