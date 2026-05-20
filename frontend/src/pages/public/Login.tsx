import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import api from '../../services/api'; 

import logoVetCare2 from '../../assets/logo-VetCare2.jpeg';

export default function Login() {
  const navigate = useNavigate(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // ◄ AQUÍ VA LA FUNCIÓN MODIFICADA QUE GESTIONA AMBAS CUENTAS
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1. Enviamos los datos al backend
      const response = await api.post('/usuarios/login', {
        correo: email,
        contrasenia: password,
      });

      // El backend nos devuelve los datos unificados del usuario en 'cliente'
      const usuarioLogueado = response.data.cliente; 

      // 2. Evaluamos el rol (tipo_usuario) que viene desde Postgres
      if (usuarioLogueado.tipo_usuario === 'ADMIN') {
    localStorage.setItem('vetcare_sesion_admin', JSON.stringify(usuarioLogueado));
    navigate('/admin/dashboard');
} else if (usuarioLogueado.tipo_usuario === 'CLIENTE') {
    localStorage.setItem('vetcare_sesion', JSON.stringify(usuarioLogueado));
    navigate('/dashboard-cliente');
} else if (usuarioLogueado.tipo_usuario === 'VETERINARIO') {
    localStorage.setItem('vetcare_sesion_vet', JSON.stringify(usuarioLogueado));
    navigate('/dashboard-veterinario');
} else if (usuarioLogueado.tipo_usuario === 'ESTILISTA') {
    localStorage.setItem('vetcare_sesion_estilista', JSON.stringify(usuarioLogueado));
    navigate('/dashboard-estilista');
} else if (usuarioLogueado.tipo_usuario === 'RECEPCIONISTA') {
    localStorage.setItem('vetcare_sesion_recepcion', JSON.stringify(usuarioLogueado));
    navigate('/dashboard-recepcionista');
}

    } catch (error: any) {
      console.error('Error en el inicio de sesión:', error);
      const mensajeError = error.response?.data?.message || 'No se pudo conectar con el servidor.';
      alert(`Error de ingreso: ${mensajeError}`);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative bg-[#f8fbfa] overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(var(--color-primary) 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}></div>

      <main className="bg-white w-full max-w-[480px] rounded-[2rem] shadow-ambient border border-outline-variant/20 p-8 sm:p-12 relative overflow-hidden z-10">
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-surface-container rounded-full -z-10 opacity-60"></div>
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-surface-container rounded-full -z-10 opacity-60"></div>

        <header className="flex flex-col items-center justify-center mb-8 text-center">
          <img src={logoVetCare2} alt="VetCare Logo" className="h-14 object-contain rounded-xl" />
          <h2 className="font-display text-2xl font-bold text-primary tracking-wide">VetCare</h2>
          <p className="font-body text-[11px] font-bold text-on-surface-variant tracking-widest uppercase mt-0.5">
            SPA PAWS & PALMS
          </p>
        </header>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <h1 className="font-display text-3xl font-bold text-primary text-center mb-8 tracking-wide">
            INICIAR SESIÓN
          </h1>

          <InputField 
            label="Correo Electrónico:" 
            icon="mail"
            id="email"
            type="email"
            placeholder="ingresa@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <InputField 
            label="Contraseña:" 
            icon="lock"
            id="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            isPassword={true} 
          />

          <div className="flex items-center justify-between pt-2 pb-2">
            <div className="flex items-center">
              <input
                className="h-[18px] w-[18px] border-2 border-outline-variant rounded-sm text-primary focus:ring-primary-container cursor-pointer transition-colors"
                id="remember_me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label className="ml-2.5 block text-on-surface text-[15px] font-bold cursor-pointer font-body" htmlFor="remember_me">
                Recordarme
              </label>
            </div>
            
            <button
              className="text-[15px] font-bold text-tertiary hover:text-tertiary-container hover:underline flex items-center gap-1 transition-colors font-body"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">help</span>
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <div className="pt-4 relative">
            <div className="absolute inset-x-0 bottom-0 top-4 border-2 border-dashed border-outline-variant/60 rounded-xl pointer-events-none -m-1.5"></div>
            <Button variant="action" fullWidth type="submit" className="relative z-10 py-4 text-[20px] shadow-none">
              INGRESAR
            </Button>
          </div>
        </form>

        <div className="mt-10 text-center border-t border-outline-variant/20 pt-6">
          <p className="font-body text-[15px] text-on-surface-variant">
            ¿No tienes una cuenta aún?{' '}
            <Link to="/register" className="font-display text-[15px] font-bold text-primary hover:underline ml-1 transition-all">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}