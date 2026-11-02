-- TRIGGERS

-- Tabla: auditoria
CREATE TRIGGER trg_auditoria_inmutable BEFORE DELETE OR UPDATE ON auditoria FOR EACH ROW EXECUTE FUNCTION auditoria_inmutable();

-- Tabla: citas
CREATE TRIGGER trg_historial AFTER DELETE OR UPDATE ON citas FOR EACH ROW EXECUTE FUNCTION registrar_cambio('id_cita');

-- Tabla: clientes
CREATE TRIGGER trg_historial AFTER DELETE OR UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION registrar_cambio('id_usuario');

-- Tabla: consultas
CREATE TRIGGER trg_historial AFTER DELETE OR UPDATE ON consultas FOR EACH ROW EXECUTE FUNCTION registrar_cambio('id_cons_medica');

-- Tabla: historial_cambios
CREATE TRIGGER trg_historial_inmutable BEFORE DELETE OR UPDATE ON historial_cambios FOR EACH ROW EXECUTE FUNCTION historial_inmutable();

-- Tabla: mascotas
CREATE TRIGGER trg_historial AFTER DELETE OR UPDATE ON mascotas FOR EACH ROW EXECUTE FUNCTION registrar_cambio('id_mascota');

-- Tabla: tratamientos
CREATE TRIGGER trg_historial AFTER DELETE OR UPDATE ON tratamientos FOR EACH ROW EXECUTE FUNCTION registrar_cambio('id_tratamiento');
