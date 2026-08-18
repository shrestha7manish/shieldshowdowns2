import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegistrationForm from './pages/RegistrationForm';
import AdminDashboard from './pages/AdminDashboard';
import RegistrationDetails from './pages/RegistrationDetails';

function App() {
  return (
    <Router>
      <div className="relative flex flex-col min-h-screen text-slate-100 bg-[#07070a] overflow-x-hidden selection:bg-gold selection:text-black">
        {/* Ambient Darkened Background with Blur & Vignette */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 filter blur-[6px] brightness-[0.22] contrast-[1.05] saturate-[0.8]"
            style={{ backgroundImage: "url('/bg.jpg')" }}
          />
          {/* Deep Dark Overlay & Radial Vignette to direct all visual focus onto the form */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#060608]/90 via-[#07080c]/85 to-[#050508]/95" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.03)_0%,_rgba(5,5,8,0.92)_75%,_#040406_100%)]" />
          <div className="absolute inset-0 gaming-grid opacity-25" />
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

