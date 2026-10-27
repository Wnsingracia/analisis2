import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/public/Home';
import Login from './pages/public/sesion/Login';
import Register from './pages/public/sesion/Register';
import ForgotPassword from './pages/public/sesion/ForgotPassword';
import ResetPassword from './pages/public/sesion/ResetPassword';

//IMPORTS DE LAS PÚBLICAS NUEVAS (Servicios, Nosotros, Citas, etc.)
import Servicios from './pages/public/Servicios';
import Nosotros from './pages/public/Nosotros';
import Citas from './pages/public/Citas';
import Privacidad from './pages/public/Privacidad';
import Terminos from './pages/public/Terminos';
import Contacto from './pages/public/Contacto';

// Layout de Admin y vistas de Admin
import { AdminLayout } from './components/layout/AdminLayout'; 
import { RecepcionistaLayout } from './components/layout/RecepcionistaLayout'; 
import Dashboard from './pages/admin/Dashboard';
import Staff from './pages/admin/Staff';
import Clients from './pages/admin/Clientes'; 
import Inventory from './pages/admin/Inventory';
import Appointments from './pages/admin/Appointments';
import ClinicalHistory from './pages/admin/ClinicalHistory';

// Dashboards por rol y otros
import ClientDashboard from './pages/public/dashboard/ClientDashBoard';
import VeterinarioDashboard from './pages/public/dashboard/VeterinarioDashBoard';
import EstilistaDashboard from './pages/public/dashboard/EstilistaDashBoard';
import RecepcionistaDashboard from './pages/public/dashboard/RecepcionistaDashBoard';
import MisPacientes from './pages/public/MisPacientes';


function App() {
  return (
    <Router>
      <Routes>
        {/* ==========================================
            VISTAS PÚBLICAS (Incluyendo Servicios, Nosotros y Citas)
           ========================================== */}
        <Route path="/" element={<Home />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/citas" element={<Citas />} />
        
        {/* Rutas del footer */}
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/terminos" element={<Terminos />} />
        <Route path="/contacto" element={<Contacto />} />

        {/* Rutas de autenticación */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* ==========================================
            ENTORNOS PRIVADOS POR ROL (INDEPENDIENTES)
           ========================================== */}
        <Route path="/dashboard-cliente" element={<ClientDashboard />} />
        <Route path="/dashboard-veterinario" element={<VeterinarioDashboard />} />
        <Route path="/dashboard-estilista" element={<EstilistaDashboard />} />
        <Route path="/dashboard-recepcionista" element={<RecepcionistaDashboard />} />
        <Route path="/vet/mis-pacientes" element={<MisPacientes />} />


        {/* ==========================================
            ENTORNO PRIVADO DEL ADMINISTRADOR (CON LAYOUT)
           ========================================== */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="staff" element={<Staff />} />
          <Route path="clients" element={<Clients />} /> 
          <Route path="inventory" element={<Inventory />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="clinical-history/:idMascota" element={<ClinicalHistory />} />
        </Route>

        <Route path="/recepcionista" element={<RecepcionistaLayout />}>
        <Route path="dashboard" element={<RecepcionistaDashboard />}/>
        <Route path="appointments" element={<Appointments />}/>
        <Route path="inventory" element={<Inventory />}/>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;