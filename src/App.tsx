import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DigitalId from './pages/DigitalId';
import QRScan from './pages/QRScan';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="max-w-md mx-auto bg-brand-bg min-h-screen shadow-2xl overflow-hidden relative">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/digital-id" element={<ProtectedRoute><DigitalId /></ProtectedRoute>} />
            <Route path="/qr-scan" element={<ProtectedRoute><QRScan /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
