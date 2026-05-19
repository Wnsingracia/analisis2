import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import { AdminLayout } from './components/layout/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Staff from './pages/admin/Staff';

function App() {
  return (
    <Router>
      <Routes>
        {/* Vistas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Entorno Privado del Administrador Unificado */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="staff" element={<Staff />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;