import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import { AdminLayout } from './components/layout/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Staff from './pages/admin/Staff';

// 1. IMPORTS DE TODOS LOS ROLES DE VETCARE
import ClientDashboard from './pages/public/ClientDashBoard';
import VeterinarioDashboard from './pages/public/VeterinarioDashBoard';
import EstilistaDashboard from './pages/public/EstilistaDashBoard';
import RecepcionistaDashboard from './pages/public/RecepcionistaDashBoard';
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
        
        {/* ==========================================
            ENTORNOS PRIVADOS POR ROL (INDEPENDIENTES)
           ========================================== */}
        {/* Panel del Cliente */}
        <Route path="/dashboard-cliente" element={<ClientDashboard />} />

        {/* Panel del Veterinario */}
        <Route path="/dashboard-veterinario" element={<VeterinarioDashboard />} />

        {/* Panel del Estilista */}
        <Route path="/dashboard-estilista" element={<EstilistaDashboard />} />

        {/* Panel del Recepcionista */}
        <Route path="/dashboard-recepcionista" element={<RecepcionistaDashboard />} />
        
        {/* ==========================================
            ENTORNO PRIVADO DEL ADMINISTRADOR (CON LAYOUT)
           ========================================== */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="staff" element={<Staff />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;