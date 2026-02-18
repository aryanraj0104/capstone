import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';

import DigitalId from './pages/DigitalId';
import QRScan from './pages/QRScan';

function App() {
  return (
    <Router>
      <div className="max-w-md mx-auto bg-brand-bg min-h-screen shadow-2xl overflow-hidden relative">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/digital-id" element={<DigitalId />} />
          <Route path="/qr-scan" element={<QRScan />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
