import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { InputField } from '../../components/ui/InputField';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';
import logoVetCare2 from '../../assets/logo-VetCare2.jpeg';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    try {
      // Enviamos el correo al endpoint de NestJS que configuramos con Resend
      const res = await api.post('/usuarios/recuperar-password', { correo: email });
      alert(res.data.mensaje);
      setEmail(''); // Limpiamos el input
    } catch (error: any) {
      console.error(error);
      const mensajeError = error.response?.data?.message || 'Error al procesar la solicitud.';
      alert(`Ops: ${mensajeError}`);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative bg-[#f8fbfa] overflow-hidden">
      {/* Patrón de puntos decorativo */}
      <div className="absolute inset-0 z-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(var(--color-primary) 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}></div>

      <main className="bg-white w-full max-w-[480px] rounded-[2rem] shadow-ambient border border-outline-variant/20 p-8 sm:p-12 relative z-10">
        <header className="flex flex-col items-center justify-center mb-6 text-center">
          <img src={logoVetCare2} alt="VetCare Logo" className="h-12 object-contain rounded-xl mb-2" />
          <h2 className="font-display text-2xl font-bold text-primary tracking-wide">Recuperar Acceso</h2>
          <p className="font-body text-sm text-on-surface-variant mt-1">
            Introduce tu correo y te enviaremos un enlace real para restablecer tu contraseña.
          </p>
        </header>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <InputField 
            label="Correo Electrónico Registrado:" 
            icon="mail"
            id="email"
            type="email"
            placeholder="ingresa@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button variant="action" fullWidth type="submit" disabled={cargando}>
            {cargando ? 'ENVIANDO CORREO...' : 'ENVIAR ENLACE'}
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-outline-variant/20 pt-4">
          <Link to="/login" className="font-body text-sm font-bold text-primary hover:underline transition-all">
            ← Volver al Inicio de Sesión
          </Link>
        </div>
      </main>
    </div>
  );
}