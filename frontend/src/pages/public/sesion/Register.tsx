
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { InputField } from '../../../components/ui/InputField';
import api from '../../../services/api';
import logoVetCare2 from '../../../assets/logo-VetCare2.jpeg';
import Captcha from '../../../components/seguridad/Captcha';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: ''
  });

  // CAPTCHA
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaKey, setCaptchaKey] = useState(0);

  // Estados de términos y condiciones
  const [mostrarTerminos, setMostrarTerminos] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  // Estado de carga
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  // Primera etapa: validar y mostrar términos
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    // Validar contraseñas
    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    // Validar CAPTCHA
    if (!captchaToken) {
      alert('Por favor, completa la verificación CAPTCHA.');
      return;
    }

    // Abrir términos antes de realizar cualquier transacción
    setAceptaTerminos(false);
    setMostrarTerminos(true);
  };

  // Segunda etapa: registrar después de aceptar los términos
  const handleAceptarTerminos = async () => {
    if (!aceptaTerminos || isLoading) return;

    setMostrarTerminos(false);
    setIsLoading(true);

    // Separar apellidos
    const listaApellidos = formData.apellidos.trim().split(/\s+/);
    const ap_pat = listaApellidos[0] || '';
    const ap_mat = listaApellidos.slice(1).join(' ') || null;

    // Preparar datos para NestJS
    const datosParaBackend = {
      nombres: formData.nombres,
      ap_pat,
      ap_mat,
      cel: formData.telefono,
      correo: formData.email,
      genero: 'Otro',
      contrasenia: formData.password,
      tipo_usuario: 'CLIENTE',
      nro_cuenta: '000000',
      direccion: 'Por definir en sucursal',
      nit: '0'
    };

    try {
      const response = await api.post('/auth/registro', {
        ...datosParaBackend,
        captchaToken
      });

      alert(response.data.mensaje || 'Registro procesado');

      setCaptchaToken('');
      navigate('/login');

    } catch (error: any) {
      console.error('Error al registrar cliente:', error);

      const mensajeError = error.response?.data?.message
        || 'Hubo un problema con el servidor.';

      alert(
        `Error en el registro: ${
          Array.isArray(mensajeError)
            ? mensajeError.join('\n')
            : mensajeError
        }`
      );

      // Reiniciar CAPTCHA si ocurre un error
      setCaptchaToken('');
      setCaptchaKey(prev => prev + 1);

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative bg-[#f8fbfa] overflow-x-hidden selection:bg-primary-container selection:text-white">

      {/* Patrón de puntos */}
      <div
        className="absolute inset-0 z-0 opacity-[0.15]"
        style={{
          backgroundImage: 'radial-gradient(var(--color-primary) 1.5px, transparent 1.5px)',
          backgroundSize: '30px 30px'
        }}
      />

      <main className="bg-white w-full max-w-[650px] rounded-[2rem] shadow-ambient border border-outline-variant/20 p-8 sm:p-12 relative overflow-hidden z-10 my-8">

        {/* Decoración */}
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-surface-container rounded-full -z-10 opacity-60" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-surface-container rounded-full -z-10 opacity-60" />

        <header className="flex flex-col items-center justify-center mb-8 text-center">
          <img
            src={logoVetCare2}
            alt="VetCare Logo"
            className="h-14 object-contain rounded-xl mb-4 shadow-sm"
          />

          <h2 className="font-display text-2xl font-bold text-primary tracking-wide">
            VetCare
          </h2>

          <p className="font-body text-[11px] font-bold text-on-surface-variant tracking-widest uppercase mt-0.5">
            SPA PAWS & PALMS
          </p>
        </header>

        <form className="space-y-6" onSubmit={handleSubmit}>

          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-primary tracking-wide inline-block relative">
              Registro de Nuevo Usuario
              <div className="absolute -bottom-2 left-0 w-full h-1.5 bg-primary-container/30 rounded-full" />
            </h1>
          </div>

          {/* Nombres y apellidos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InputField
              label="Nombre(s):"
              icon="person"
              id="nombres"
              placeholder="Ej. María"
              value={formData.nombres}
              onChange={handleChange}
              required
            />

            <InputField
              label="Apellido(s):"
              icon="person"
              id="apellidos"
              placeholder="Ej. Pérez"
              value={formData.apellidos}
              onChange={handleChange}
              required
            />
          </div>

          {/* Correo */}
          <InputField
            label="Correo Electrónico:"
            icon="mail"
            id="email"
            type="email"
            placeholder="maria@correo.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          {/* Teléfono */}
          <InputField
            label="Teléfono Celular:"
            icon="call"
            id="telefono"
            type="tel"
            placeholder="Ej. 70012345"
            value={formData.telefono}
            onChange={handleChange}
            required
          />

          {/* Contraseñas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InputField
              label="Contraseña:"
              icon="lock"
              id="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              isPassword={true}
            />

            <InputField
              label="Confirmar Contraseña:"
              icon="lock_reset"
              id="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              isPassword={true}
            />
          </div>

          {/* CAPTCHA */}
          <div className="pt-2">
            <Captcha
              resetKey={captchaKey}
              onVerify={setCaptchaToken}
            />
          </div>

          {/* Botón de registro */}
          <div className="pt-6 relative">
            <div className="absolute inset-x-0 bottom-0 top-6 border-2 border-dashed border-outline-variant/60 rounded-xl pointer-events-none -m-1.5" />

            <Button
              variant="action"
              fullWidth
              type="submit"
              disabled={!captchaToken || isLoading}
              className="relative z-10 py-4 text-[20px] shadow-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  REGISTRANDO...
                </span>
              ) : (
                'REGISTRAR'
              )}
            </Button>
          </div>

        </form>

        <div className="mt-8 text-center border-t border-outline-variant/20 pt-6">
          <p className="font-body text-[15px] text-on-surface-variant">
            ¿Ya tienes una cuenta?{' '}
            <Link
              to="/login"
              className="font-display text-[15px] font-bold text-primary hover:underline ml-1 transition-all"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>

      </main>

      {/* ====================================== */}
      {/* MODAL DE TÉRMINOS Y CONDICIONES */}
      {/* ====================================== */}

      {mostrarTerminos && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">

          <div
            className="bg-white w-full max-w-[600px] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-terminos"
          >

            {/* Encabezado */}
            <div className="bg-primary px-6 py-6 text-white text-center">
              <div className="flex justify-center mb-3">
                <div className="bg-white/20 p-3 rounded-full">
                  <span className="material-symbols-outlined text-3xl">
                    gavel
                  </span>
                </div>
              </div>

              <h2
                id="titulo-terminos"
                className="text-2xl font-bold font-display"
              >
                Términos y Condiciones
              </h2>

              <p className="text-sm opacity-80 mt-1">
                VetCare - SPA PAWS & PALMS
              </p>
            </div>

            {/* Contenido desplazable */}
            <div className="px-6 py-5 max-h-[45vh] overflow-y-auto text-sm text-gray-700 space-y-5">

              <p className="text-gray-600">
                Antes de completar tu registro, te solicitamos leer
                las siguientes condiciones de uso de la aplicación VetCare.
              </p>

              <section>
                <h3 className="font-bold text-primary text-base mb-2">
                  1. Aceptación de los términos
                </h3>
                <p>
                  Al registrarte en VetCare, aceptas las condiciones
                  establecidas para el uso de la plataforma y sus
                  funcionalidades. Si no estás de acuerdo, puedes
                  cancelar el proceso de registro.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-primary text-base mb-2">
                  2. Uso de la aplicación
                </h3>
                <p>
                  VetCare proporciona herramientas para gestionar
                  información de clientes, mascotas, citas y servicios
                  veterinarios. El usuario se compromete a utilizar
                  la plataforma de manera responsable y adecuada.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-primary text-base mb-2">
                  3. Veracidad de la información
                </h3>
                <p>
                  El usuario debe proporcionar información verdadera,
                  actualizada y completa durante el registro y al
                  utilizar los servicios de la aplicación.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-primary text-base mb-2">
                  4. Protección de datos personales
                </h3>
                <p>
                  La información proporcionada será utilizada para
                  gestionar la cuenta del usuario y permitir el
                  funcionamiento de los servicios de VetCare.
                  La aplicación deberá proteger estos datos y
                  tratarlos conforme a su política de privacidad
                  y la normativa aplicable.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-primary text-base mb-2">
                  5. Responsabilidad de la cuenta
                </h3>
                <p>
                  El usuario es responsable de mantener la
                  confidencialidad de sus credenciales de acceso
                  y de notificar cualquier uso no autorizado
                  de su cuenta.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-primary text-base mb-2">
                  6. Modificaciones del servicio
                </h3>
                <p>
                  VetCare podrá actualizar sus funcionalidades,
                  condiciones de uso y políticas. Los cambios
                  relevantes deberán comunicarse a los usuarios.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-primary text-base mb-2">
                  7. Consultas y soporte
                </h3>
                <p>
                  El usuario podrá solicitar asistencia mediante
                  los canales de atención habilitados por VetCare.
                </p>
              </section>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-blue-800 text-xs">
                  Al aceptar, confirmas que has leído y comprendido
                  estas condiciones y que deseas continuar con
                  el proceso de registro.
                </p>
              </div>

            </div>

            {/* Checkbox obligatorio */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <label className="flex items-start gap-3 cursor-pointer select-none">

                <input
                  type="checkbox"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  className="w-5 h-5 mt-0.5 accent-primary cursor-pointer shrink-0"
                />

                <span className="text-sm text-gray-700">
                  He leído y acepto los{' '}
                  <strong className="text-primary">
                    Términos y Condiciones
                  </strong>{' '}
                  de uso de VetCare.
                </span>

              </label>

              {/* Botones */}
              <div className="grid grid-cols-2 gap-3 mt-5">

                <button
                  type="button"
                  onClick={() => {
                    setMostrarTerminos(false);
                    setAceptaTerminos(false);
                  }}
                  disabled={isLoading}
                  className="py-3 px-4 rounded-xl border border-gray-300 text-gray-600 font-bold hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  CANCELAR
                </button>

                <button
                  type="button"
                  onClick={handleAceptarTerminos}
                  disabled={!aceptaTerminos || isLoading}
                  className="py-3 px-4 rounded-xl bg-primary text-white font-bold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                >
                  ACEPTAR Y CONTINUAR
                </button>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
