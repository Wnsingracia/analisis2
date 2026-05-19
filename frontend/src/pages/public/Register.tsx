import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import logoVetCare2 from '../../assets/logo-VetCare2.jpeg'; // Asegúrate de tener tu logo aquí

export default function Register() {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    console.log('Registrando nuevo cliente:', formData);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative bg-[#f8fbfa] overflow-x-hidden selection:bg-primary-container selection:text-white">
      
      {/* Patrón de puntos de fondo */}
      <div className="absolute inset-0 z-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(var(--color-primary) 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}></div>

      <main className="bg-white w-full max-w-[650px] rounded-[2rem] shadow-ambient border border-outline-variant/20 p-8 sm:p-12 relative overflow-hidden z-10 my-8">
        
        {/* Formas decorativas */}
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-surface-container rounded-full -z-10 opacity-60"></div>
        <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-surface-container rounded-full -z-10 opacity-60"></div>

        <header className="flex flex-col items-center justify-center mb-8 text-center">
          {/* Logo de la Veterinaria */}
          <img src={logoVetCare2} alt="VetCare Logo" className="h-14 object-contain rounded-xl mb-4 shadow-sm" />
          <h2 className="font-display text-2xl font-bold text-primary tracking-wide">VetCare</h2>
          <p className="font-body text-[11px] font-bold text-on-surface-variant tracking-widest uppercase mt-0.5">
            SPA PAWS & PALMS
          </p>
        </header>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-primary tracking-wide inline-block relative">
              Registro de Nuevo Usuario
              {/* Subrayado decorativo basado en tu boceto */}
              <div className="absolute -bottom-2 left-0 w-full h-1.5 bg-primary-container/30 rounded-full"></div>
            </h1>
          </div>

          {/* Fila 1: Nombres y Apellidos (2 columnas en desktop) */}
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

          {/* Fila 2: Correo (1 columna) */}
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

          {/* Fila 3: Contraseñas (2 columnas en desktop) */}
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

          {/* Botón de Registro */}
          <div className="pt-6 relative">
            <div className="absolute inset-x-0 bottom-0 top-6 border-2 border-dashed border-outline-variant/60 rounded-xl pointer-events-none -m-1.5"></div>
            <Button variant="action" fullWidth type="submit" className="relative z-10 py-4 text-[20px] shadow-none">
              REGISTRAR
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center border-t border-outline-variant/20 pt-6">
          <p className="font-body text-[15px] text-on-surface-variant">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="font-display text-[15px] font-bold text-primary hover:underline ml-1 transition-all">
              Inicia sesión aquí
            </Link>
          </p>
        </div>

      </main>
    </div>
  );
}