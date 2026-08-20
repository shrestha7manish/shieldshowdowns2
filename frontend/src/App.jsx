import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegistrationForm from './pages/RegistrationForm';
import AdminDashboard from './pages/AdminDashboard';
import RegistrationDetails from './pages/RegistrationDetails';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="relative flex flex-col min-h-screen text-slate-100 bg-[#07070a] overflow-x-hidden selection:bg-gold selection:text-black">
        {/* Ambient Controlled Background: Free Fire artwork clearly visible on sides */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat filter brightness-[0.88] contrast-[1.1] saturate-[1.05]"
            style={{ backgroundImage: "url('/bg.jpg')" }}
          />
          {/* Gentle vignette to keep contrast behind center card without washing out artwork */}
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.1)_0%,_rgba(5,5,8,0.4)_80%,_#040406_100%)]" />
        </div>

        <main className="relative z-10 flex-grow">
          <Routes>
            <Route path="/" element={<RegistrationForm />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/registration/:id" element={<RegistrationDetails />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;

