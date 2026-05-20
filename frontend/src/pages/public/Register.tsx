import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Agregamos useNavigate para redirigir
import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import api from '../../services/api'; // ◄ Importa tu instancia de Axios
import logoVetCare2 from '../../assets/logo-VetCare2.jpeg';

export default function Register() {
  const navigate = useNavigate(); // Para mandar al login tras registrarse
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validaciones básicas de interfaz
    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    // 2. Mapeo de datos: Ajustamos el formato para Postgres
    // Separamos los apellidos por si el usuario metió paterno y materno
    const listaApellidos = formData.apellidos.trim().split(' ');
    const ap_pat = listaApellidos[0] || '';
    const ap_mat = listaApellidos.slice(1).join(' ') || null; // Si hay segundo apellido, va aquí

    const datosParaBackend = {
      nombres: formData.nombres,
      ap_pat: ap_pat,
      ap_mat: ap_mat,
      cel: formData.telefono,
      correo: formData.email,
      genero: 'Otro', // Valor por defecto del enum ["M", "F", "Otro"] si no hay selector
      contrasenia: formData.password,
      tipo_usuario: 'CLIENTE', // ◄ Forzamos que sea Cliente
      
      // Atributos obligatorios en tu Postgres para la herencia de clientes
      nro_cuenta: '000000',                     
      direccion: 'Por definir en sucursal', 
      nit: '0'                                  
    };

    // 3. Petición HTTP al backend NestJS
    try {
      const response = await api.post('/usuarios', datosParaBackend);
      
      // Si el backend responde con éxito
      alert(`${response.data.mensaje} - Tu ID asignado es: ${response.data.id_usuario}`);
      
      // Redireccionar al login
      navigate('/login');
      
    } catch (error: any) {
      console.error('Error al registrar cliente:', error);
      
      // Capturamos mensajes de error específicos enviados por NestJS (Ej: Correo duplicado)
      const mensajeError = error.response?.data?.message || 'Hubo un problema con el servidor.';
      alert(`Error en el registro: ${mensajeError}`);
    }
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
              <div className="absolute -bottom-2 left-0 w-full h-1.5 bg-primary-container/30 rounded-full"></div>
            </h1>
          </div>

          {/* Fila 1: Nombres y Apellidos */}
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

          {/* Fila 2: Correo */}
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

          {/* Fila 3: Contraseñas */}
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