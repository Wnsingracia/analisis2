
import { Link } from 'react-router-dom';

export default function Terminos() {
  return (
    <div className="min-h-screen flex flex-col pt-20 bg-surface text-on-surface">

      <div className="px-6 lg:px-20 py-12 max-w-4xl mx-auto w-full">

        <span className="inline-block px-4 py-1.5 rounded-full bg-surface-container-high text-primary font-body text-xs font-semibold mb-4 border border-outline-variant">
          Información legal
        </span>

        <h1 className="font-display text-3xl lg:text-4xl font-bold tracking-tight mb-4">
          Términos y <span className="text-primary">Condiciones</span>
        </h1>

        <p className="font-body text-sm text-on-surface-variant mb-2">
          VetCare - SPA PAWS & PALMS
        </p>

        <p className="font-body text-sm text-on-surface-variant mb-8">
          Última actualización: Noviembre de 2026
        </p>

        <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/40 space-y-7 font-body text-on-surface-variant leading-relaxed">

          <p>
            Bienvenido a VetCare, una plataforma digital destinada
            a facilitar la gestión de clientes, mascotas, citas,
            consultas y servicios de SPA PAWS & PALMS. El acceso
            y utilización de la plataforma implica la aceptación
            de las siguientes condiciones.
          </p>

          <section>
            <h3 className="font-display text-xl font-bold text-on-surface mb-2">
              1. Aceptación de los términos
            </h3>
            <p>
              Al registrarse o utilizar VetCare, el usuario acepta
              las presentes condiciones de uso. Estas regulan el
              acceso a la plataforma, la administración de cuentas
              y el uso de las funcionalidades digitales relacionadas
              con los servicios veterinarios.
            </p>
          </section>

          <section>
            <h3 className="font-display text-xl font-bold text-on-surface mb-2">
              2. Registro y responsabilidad de la cuenta
            </h3>
            <p>
              El usuario debe proporcionar información personal
              verdadera, completa y actualizada. Es responsable
              de mantener la confidencialidad de sus credenciales
              y de las actividades realizadas desde su cuenta.
              Cualquier acceso sospechoso o no autorizado deberá
              ser comunicado a la administración de la veterinaria.
            </p>
          </section>

          <section>
            <h3 className="font-display text-xl font-bold text-on-surface mb-2">
              3. Registro y responsabilidad sobre las mascotas
            </h3>
            <p>
              El propietario o responsable debe proporcionar
              información correcta sobre sus mascotas, incluyendo
              antecedentes, alergias, enfermedades, medicamentos
              y demás datos relevantes. También deberá comunicar
              cualquier cambio que pueda influir en su atención.
            </p>
          </section>

          <section>
            <h3 className="font-display text-xl font-bold text-on-surface mb-2">
              4. Citas y cancelaciones
            </h3>
            <p>
              Las solicitudes de citas estarán sujetas a la
              disponibilidad y confirmación de la veterinaria.
              El usuario deberá comunicar oportunamente cualquier
              solicitud de cancelación o reprogramación mediante
              los canales habilitados. La atención de urgencias
              dependerá de la capacidad y disponibilidad del
              establecimiento.
            </p>
          </section>

          <section>
            <h3 className="font-display text-xl font-bold text-on-surface mb-2">
              5. Consultas y tratamientos veterinarios
            </h3>
            <p>
              Los diagnósticos, tratamientos, procedimientos y
              observaciones clínicas deberán ser registrados por
              el personal veterinario autorizado. La información
              almacenada en el historial clínico tiene como finalidad
              facilitar el seguimiento de la atención de cada
              mascota y no sustituye la evaluación profesional
              correspondiente.
            </p>
          </section>

          <section>
            <h3 className="font-display text-xl font-bold text-on-surface mb-2">
              6. Responsabilidad del propietario
            </h3>
            <p>
              El propietario debe informar sobre cualquier
              antecedente médico relevante y seguir las indicaciones
              proporcionadas por el personal veterinario. Durante
              su permanencia en las instalaciones, deberá mantener
              a su mascota bajo control y cumplir las medidas de
              seguridad indicadas por el establecimiento.
            </p>
          </section>

          <section>
            <h3 className="font-display text-xl font-bold text-on-surface mb-2">
              7. Privacidad y protección de datos
            </h3>
            <p>
              Los datos personales serán utilizados para gestionar
              cuentas, identificar propietarios, administrar citas,
              mantener historiales y facilitar la prestación de
              servicios veterinarios. La información de las mascotas
              será utilizada para fines relacionados con su atención.
              El tratamiento de estos datos deberá realizarse de
              acuerdo con la política de privacidad y la normativa
              aplicable.
            </p>
          </section>

          <section>
            <h3 className="font-display text-xl font-bold text-on-surface mb-2">
              8. Seguridad de la información
            </h3>
            <p>
              VetCare incorpora mecanismos de autenticación,
              control de acceso y protección de la información.
              El usuario no debe compartir sus credenciales,
              acceder a cuentas ajenas, modificar registros sin
              autorización ni intentar utilizar funciones
              restringidas.
            </p>
          </section>

          <section>
            <h3 className="font-display text-xl font-bold text-on-surface mb-2">
              9. Uso adecuado de la plataforma
            </h3>
            <p>
              La plataforma deberá utilizarse exclusivamente
              para sus finalidades previstas. Está prohibido
              proporcionar información falsa, realizar actividades
              fraudulentas, interferir con su funcionamiento o
              intentar acceder a información de otros usuarios
              sin autorización.
            </p>
          </section>

          <section>
            <h3 className="font-display text-xl font-bold text-on-surface mb-2">
              10. Disponibilidad y modificaciones
            </h3>
            <p>
              VetCare podrá experimentar interrupciones temporales
              por mantenimiento, actualizaciones o circunstancias
              técnicas. SPA PAWS & PALMS podrá modificar las
              funcionalidades y condiciones de uso, comunicando
              los cambios relevantes mediante los canales
              disponibles.
            </p>
          </section>

          <section>
            <h3 className="font-display text-xl font-bold text-on-surface mb-2">
              11. Atención y soporte
            </h3>
            <p>
              Para consultas relacionadas con la cuenta, las citas,
              los datos de las mascotas o el funcionamiento de la
              plataforma, el usuario podrá acudir a los canales
              de atención habilitados por SPA PAWS & PALMS.
            </p>
          </section>

          <section>
            <h3 className="font-display text-xl font-bold text-on-surface mb-2">
              12. Vigencia y aceptación
            </h3>
            <p>
              Estas condiciones entran en vigencia desde su
              aceptación por parte del usuario. Al completar
              el registro, este declara haber leído y comprendido
              las disposiciones aquí establecidas.
            </p>
          </section>

          <div className="bg-surface-container-high p-5 rounded-2xl border border-outline-variant/40">
            <h3 className="font-display font-bold text-on-surface mb-2">
              Compromiso con el bienestar animal
            </h3>
            <p className="text-sm">
              En SPA PAWS & PALMS, VetCare constituye una
              herramienta de apoyo para la gestión y seguimiento
              de la atención veterinaria. Nuestro objetivo es
              facilitar la comunicación entre propietarios y
              profesionales, promoviendo una atención responsable
              y el bienestar de cada mascota.
            </p>
          </div>

        </div>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="text-primary font-semibold hover:underline"
          >
            ← Volver al Inicio
          </Link>
        </div>

      </div>
    </div>
  );
}
