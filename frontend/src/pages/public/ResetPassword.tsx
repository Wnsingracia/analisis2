import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { InputField } from '../../components/ui/InputField';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';
import logoVetCare2 from '../../assets/logo-VetCare2.jpeg';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Capturamos el token '?token=XYZ' que viaja en el enlace del correo
  const token = searchParams.get('token'); 

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden. Verifica que estén escritas igual.');
      return;
    }

    if (!token) {
      alert('El token de recuperación no es válido o ha sido alterado.');
      return;
    }

    setCargando(true);
    try {
      // Enviamos el token y la nueva contraseña al backend
      const res = await api.post('/usuarios/reset-password', {
        token: token,
        contrasenia: password
      });

      alert(res.data.mensaje);
      navigate('/login'); // Redirigimos al usuario al login para que entre con su nueva clave

    } catch (error: any) {
      console.error(error);
      const mensajeError = error.response?.data?.message || 'El enlace ha expirado o ya fue utilizado.';
      alert(`Error: ${mensajeError}`);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative bg-[#f8fbfa] overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(var(--color-primary) 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}></div>

      <main className="bg-white w-full max-w-[480px] rounded-[2rem] shadow-ambient border border-outline-variant/20 p-8 sm:p-12 relative z-10">
        <header className="flex flex-col items-center justify-center mb-6 text-center">
          <img src={logoVetCare2} alt="VetCare Logo" className="h-12 object-contain rounded-xl mb-2" />
          <h1 className="font-display text-2xl font-bold text-primary tracking-wide">Nueva Contraseña</h1>
          <p className="font-body text-sm text-on-surface-variant mt-1">
            Establece tu nueva contraseña de acceso seguro para el sistema.
          </p>
        </header>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <InputField 
            label="Nueva Contraseña:" 
            icon="lock"
            id="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            isPassword={true} 
          />

          <InputField 
            label="Confirmar Contraseña:" 
            icon="lock_reset"
            id="confirmPassword"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            isPassword={true} 
          />

          <Button variant="action" fullWidth type="submit" disabled={cargando}>
            {cargando ? 'ACTUALIZANDO...' : 'GUARDAR CONTRASEÑA'}
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-outline-variant/20 pt-4">
          <Link to="/login" className="font-body text-sm font-bold text-on-surface-variant hover:text-primary transition-all">
            Cancelar y volver
          </Link>
        </div>
      </main>
    </div>
  );
}