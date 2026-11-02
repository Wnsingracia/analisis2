
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
                Te damos la bienvenida a VetCare, la plataforma de gestión
                y atención veterinaria de SPA PAWS & PALMS. Antes de crear
                tu cuenta, lee las siguientes condiciones que regulan el
                uso de nuestros servicios digitales y veterinarios.
              </p>

              <section>
                <h3 className="font-bold text-primary text-base mb-2">
                  1. Aceptación de los términos
                </h3>
                <p>
                  Al registrarte y utilizar VetCare, aceptas las presentes
                  condiciones de uso. Estas regulan el acceso a la plataforma,
                  la administración de tu cuenta y el uso de las funcionalidades
                  relacionadas con la atención de tus mascotas. Si no estás
                  de acuerdo con alguna de estas condiciones, debes abstenerte
                  de completar el registro.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-primary text-base mb-2">
                  2. Registro y responsabilidad de la cuenta
                </h3>
                <p>
                  El usuario debe proporcionar información personal verdadera,
                  completa y actualizada, incluyendo nombres, apellidos,
                  correo electrónico y número de contacto. Cada usuario es
                  responsable de mantener la confidencialidad de sus
                  credenciales y de las actividades realizadas desde su cuenta.
                  En caso de detectar accesos sospechosos o no autorizados,
                  deberá comunicarlo a la administración de la veterinaria.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-primary text-base mb-2">
                  3. Registro y responsabilidad sobre las mascotas
                </h3>
                <p>
                  El propietario o responsable de la mascota debe registrar
                  información correcta sobre su animal, incluyendo nombre,
                  especie, raza, edad, peso, antecedentes, alergias y demás
                  datos solicitados. También debe mantener esta información
                  actualizada y comunicar oportunamente cualquier cambio
                  relevante para su atención veterinaria.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-primary text-base mb-2">
                  4. Citas y servicios veterinarios
                </h3>
                <p>
                  La plataforma permite gestionar solicitudes, consultar
                  información y realizar el seguimiento de citas veterinarias.
                  La disponibilidad y confirmación de una cita estarán sujetas
                  a la agenda y validación del personal de la veterinaria.
                  Las solicitudes de cancelación o reprogramación deberán
                  comunicarse oportunamente por los canales habilitados.
                  La atención de urgencias estará sujeta a la capacidad
                  y disponibilidad del establecimiento.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-primary text-base mb-2">
                  5. Consultas, tratamientos e historial clínico
                </h3>
                <p>
                  Los datos relacionados con consultas, diagnósticos,
                  tratamientos, observaciones y antecedentes de las mascotas
                  serán registrados por el personal veterinario autorizado.
                  El propietario podrá consultar la información que esté
                  habilitada para su cuenta. Los registros clínicos tienen
                  como finalidad apoyar la continuidad y el seguimiento
                  de la atención veterinaria.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-primary text-base mb-2">
                  6. Responsabilidad del propietario durante la atención
                </h3>
                <p>
                  El propietario debe informar al personal veterinario sobre
                  enfermedades conocidas, alergias, medicamentos, cambios
                  de comportamiento y cualquier antecedente que pueda
                  influir en la atención. Asimismo, es responsable de mantener
                  a su mascota bajo control durante su permanencia en las
                  instalaciones, siguiendo las indicaciones del personal.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-primary text-base mb-2">
                  7. Privacidad y tratamiento de datos personales
                </h3>
                <p>
                  VetCare recopila y utiliza los datos personales proporcionados
                  para administrar cuentas, gestionar citas, identificar
                  propietarios, mantener historiales de atención y facilitar
                  la comunicación con la veterinaria. La información de las
                  mascotas también será utilizada para fines relacionados
                  con su atención y seguimiento. El acceso a estos datos
                  estará limitado según las funciones y autorizaciones
                  correspondientes.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-primary text-base mb-2">
                  8. Seguridad de la información
                </h3>
                <p>
                  La plataforma incorpora mecanismos de protección para
                  controlar el acceso a las cuentas y proteger la información
                  almacenada. El usuario se compromete a no compartir sus
                  credenciales, intentar acceder a cuentas ajenas, alterar
                  registros o utilizar la plataforma para actividades no
                  autorizadas. La veterinaria podrá adoptar medidas de
                  seguridad ante actividades sospechosas.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-primary text-base mb-2">
                  9. Uso adecuado de la plataforma
                </h3>
                <p>
                  El usuario se compromete a utilizar VetCare exclusivamente
                  para los fines previstos. No deberá proporcionar información
                  falsa, realizar solicitudes fraudulentas, interferir con
                  el funcionamiento del sistema ni intentar acceder a
                  funcionalidades restringidas.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-primary text-base mb-2">
                  10. Disponibilidad y modificaciones del servicio
                </h3>
                <p>
                  VetCare podrá recibir actualizaciones, mantenimientos y
                  mejoras técnicas que ocasionen interrupciones temporales.
                  La veterinaria podrá modificar las funcionalidades o
                  condiciones de uso cuando resulte necesario, comunicando
                  los cambios relevantes por los medios disponibles.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-primary text-base mb-2">
                  11. Atención y soporte
                </h3>
                <p>
                  Para consultas sobre cuentas, citas, información de mascotas
                  o funcionamiento de la plataforma, el usuario podrá acudir
                  a los canales de atención habilitados por SPA PAWS & PALMS.
                  La plataforma no sustituye la evaluación directa de un
                  profesional veterinario.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-primary text-base mb-2">
                  12. Aceptación y vigencia
                </h3>
                <p>
                  Al marcar la casilla de aceptación y completar el registro,
                  el usuario declara haber leído y comprendido estas
                  condiciones. Su aceptación será utilizada como constancia
                  de conformidad con las reglas de utilización de VetCare.
                </p>
              </section>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-blue-800 text-xs">
                  La creación de una cuenta permite acceder a las
                  funcionalidades digitales habilitadas para clientes.
                  El registro no garantiza por sí mismo la disponibilidad
                  inmediata de una cita ni la prestación de un procedimiento
                  veterinario.
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
