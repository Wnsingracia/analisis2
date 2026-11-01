-- TRIGGERS

-- Tabla: auditoria
CREATE TRIGGER trg_auditoria_inmutable BEFORE DELETE OR UPDATE ON auditoria FOR EACH ROW EXECUTE FUNCTION auditoria_inmutable();
