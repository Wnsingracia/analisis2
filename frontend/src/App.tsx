import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import { AdminLayout } from './components/layout/AdminLayout'; 
import Dashboard from './pages/admin/Dashboard';
import Staff from './pages/admin/Staff';
import Clients from './pages/admin/Clientes'; 
import Inventory from './pages/admin/Inventory';
import Appointments from './pages/admin/Appointments';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';

// 1. IMPORTS DE TODOS LOS ROLES DE VETCARE
import ClientDashboard from './pages/public/ClientDashBoard';
import VeterinarioDashboard from './pages/public/VeterinarioDashBoard';
import EstilistaDashboard from './pages/public/EstilistaDashBoard';
import RecepcionistaDashboard from './pages/public/RecepcionistaDashBoard';
import ClinicalHistory from './pages/admin/ClinicalHistory';
function App() {
  return (
    <Router>
      <Routes>
        {/* ==========================================
            VISTAS PÚBLICAS
           ========================================== */}
        <Route path="/" element={<Home />} />
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
      </Routes>
    </Router>
  );
}

export default App;