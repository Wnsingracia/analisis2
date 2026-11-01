-- DEFINICION Y VALORES DE SECUENCIAS

SELECT setval('public.auditoria_id_evento_seq', 197, true);

SELECT setval('public.mascotas_id_mascota_seq', 2, true);

SELECT setval('public.seq_id_clientes', 700052, true);

SELECT setval('public.seq_id_personal', 100031, true);

ALTER SEQUENCE public."auditoria_id_evento_seq" OWNED BY public."auditoria"."id_evento";
