import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import BlocklyWorkspace from './components/BlocklyWorkspace';
import './App.css'; // Stil dosyasını hala import ediyoruz ama aşağıdaki değişikliğe dikkat

function App() {
  return (
    <Router>
      {/* Tüm rotaları saran genel "App" div'ini kaldırdık. 
        Böylece her sayfa kendi ana kapsayıcısını yönetebilir ve 
        Blockly'nin düzeni bozulmaz.
      */}
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/coding" element={<BlocklyWorkspace />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;