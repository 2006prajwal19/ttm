import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { Navbar } from './components/layout/Navbar.js';
import { Footer } from './components/layout/Footer.js';
import { Home } from './pages/Home.js';
import { ExploreTours } from './pages/ExploreTours.js';
import { TourDetails } from './pages/TourDetails.js';
import { TravellerDashboard } from './pages/TravellerDashboard.js';
import { AdminDashboard } from './pages/AdminDashboard.js';
import { Login } from './pages/Login.js';
import { Register } from './pages/Register.js';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-[#060b14] text-white selection:bg-cyan-500 selection:text-slate-950">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tours" element={<ExploreTours />} />
              <Route path="/tours/:id" element={<TourDetails />} />
              <Route path="/dashboard" element={<TravellerDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
