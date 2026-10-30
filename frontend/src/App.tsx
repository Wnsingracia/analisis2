import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import Home from './pages/public/Home';
import Login from './pages/public/sesion/Login';
import Register from './pages/public/sesion/Register';
import ForgotPassword from './pages/public/sesion/ForgotPassword';
import ResetPassword from './pages/public/sesion/ResetPassword';

//IMPORTS DE LAS PÚBLICAS NUEVAS (Servicios, Nosotros, etc.)
import Servicios from './pages/public/Servicios';
import Nosotros from './pages/public/Nosotros';
import Privacidad from './pages/public/Privacidad';
import Terminos from './pages/public/Terminos';
import Contacto from './pages/public/Contacto';
import NotFound from './pages/public/NotFound';

// Layout de Admin y vistas de Admin
import { AdminLayout } from './components/layout/AdminLayout'; 
import { RecepcionistaLayout } from './components/layout/RecepcionistaLayout'; 
import Dashboard from './pages/admin/Dashboard';
import Staff from './pages/admin/Staff';
import Identidades from './pages/admin/Identidades';
import Clients from './pages/admin/Clientes'; 
import Inventory from './pages/admin/Inventory';
import Appointments from './pages/admin/Appointments';
import ClinicalHistory from './pages/admin/ClinicalHistory';


// Layout de Admin y vistas de Cliente
import { ClienteLayout } from './components/layout/ClienteLayout';
import MisMascotas from './pages/cliente/MisMascotas';
import MisCitas from './pages/cliente/MisCitas';

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
        {/* PÁGINAS PÚBLICAS */}
        <Route path="/" element={<Home />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/terminos" element={<Terminos />} />
        <Route path="/contacto" element={<Contacto />} />
        

        {/* AUTENTICACIÓN */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* DASHBOARDS POR ROL */}
        <Route path="/dashboard-veterinario" element={<VeterinarioDashboard />}/>
        <Route path="/dashboard-estilista"  element={<EstilistaDashboard />}/>
        <Route path="/vet/mis-pacientes" element={<MisPacientes />}/>

        {/* ENTORNO DEL ADMINISTRADOR */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="staff" element={<Staff />} />
          <Route path="identidades" element={<Identidades />} />
          <Route path="clients" element={<Clients />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="clinical-history/:idMascota"element={<ClinicalHistory />}/>
        </Route>

        {/* ENTORNO DEL CLIENTE*/}
        <Route path="/cliente" element={<ClienteLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ClientDashboard />}/>
          <Route path="mascotas" element={<MisMascotas />}/>
          <Route path="catalogo" element={<div>Catálogo de servicios y productos</div>}/>
          <Route path="citas" element={<MisCitas />} />
        </Route>
        {/* REDIRECCIÓN DEL DASHBOARD ANTERIOR */}
        <Route path="/dashboard-cliente" element={<Navigate to="/cliente/dashboard" replace />}/>

        {/* ENTORNO DEL RECEPCIONISTA */}
        <Route path="/recepcionista"element={<RecepcionistaLayout />}>
          <Route index element={<Navigate to="dashboard" replace />}/>
          <Route path="dashboard" element={<RecepcionistaDashboard />}/>
          <Route path="appointments" element={<Appointments />}/>
          <Route path="inventory"element={<Inventory />}/>
        </Route>

        {/* REDIRECCIÓN DE LA RUTA ANTERIOR */}
        <Route path="/dashboard-recepcionista"element={<Navigate to="/recepcionista/dashboard" replace/>}/>
        <Route path="/dashboard-cliente"element={<Navigate to="/cliente/dashboard" replace/>}/>
        
        {/* PÁGINA 404: cualquier ruta inexistente */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
