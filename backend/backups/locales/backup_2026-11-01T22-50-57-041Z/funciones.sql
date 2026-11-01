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
