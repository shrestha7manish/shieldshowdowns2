import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegistrationForm from './pages/RegistrationForm';
import AdminDashboard from './pages/AdminDashboard';
import RegistrationDetails from './pages/RegistrationDetails';

function App() {
  return (
    <Router>
      <div className="relative flex flex-col min-h-screen text-slate-100 bg-[#07070a] overflow-x-hidden selection:bg-gold selection:text-black">
        {/* Ambient Controlled Background: Visible artwork without harsh glare */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat filter brightness-[0.48] contrast-[1.08] saturate-[0.9]"
            style={{ backgroundImage: "url('/bg.jpg')" }}
          />
          {/* Subtle Darkening & Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/70" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.25)_0%,_rgba(5,5,8,0.65)_70%,_#040406_100%)]" />
          <div className="absolute inset-0 gaming-grid opacity-20" />
        </div>

        <main className="relative z-10 flex-grow">
          <Routes>
            <Route path="/" element={<RegistrationForm />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/registration/:id" element={<RegistrationDetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

