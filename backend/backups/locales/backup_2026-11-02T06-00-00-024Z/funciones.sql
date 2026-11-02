-- FUNCIONES Y PROCEDIMIENTOS

CREATE OR REPLACE FUNCTION public.auditoria_inmutable()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  RAISE EXCEPTION 'La tabla auditoria es de solo inserción';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.historial_inmutable()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  RAISE EXCEPTION 'La tabla historial_cambios es de solo inserción';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.registrar_cambio()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  pk     text := TG_ARGV[0];
  id_reg text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    id_reg := to_jsonb(OLD) ->> pk;
  ELSE
    id_reg := to_jsonb(NEW) ->> pk;
    IF to_jsonb(OLD) = to_jsonb(NEW) THEN
      RETURN NEW;                          -- no cambió nada: no se registra
    END IF;
  END IF;

  INSERT INTO historial_cambios (tabla, id_registro, operacion, datos_anteriores, datos_nuevos)
  VALUES (TG_TABLE_NAME, id_reg, TG_OP, to_jsonb(OLD),
          CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END);

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$function$
;
