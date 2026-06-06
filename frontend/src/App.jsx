import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Components
import Navbar from './components/Navbar';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Services from './pages/Services';
import Booking from './pages/Booking';
import MyAppointments from './pages/MyAppointments';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminServices from './pages/AdminServices';
import AdminCalendar from './pages/AdminCalendar';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen bg-slate bg-radial-mesh flex flex-col justify-between">
            <div>
              <Navbar />
              <main>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Customer Panel Protected Routes */}
                  <Route
                    path="/book"
                    element={
                      <ProtectedRoute>
                        <Booking />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-appointments"
                    element={
                      <ProtectedRoute>
                        <MyAppointments />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Panel Protected Routes */}
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/services"
                    element={
                      <AdminRoute>
                        <AdminServices />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/calendar"
                    element={
                      <AdminRoute>
                        <AdminCalendar />
                      </AdminRoute>
                    }
                  />

                  {/* Fallback Redirect */}
                  <Route path="*" element={<Home />} />
                </Routes>
              </main>
            </div>
            
            {/* Elegant Golden-accented Footer */}
            <footer className="bg-zinc-950 border-t border-zinc-900 py-8 text-center text-sm text-zinc-500 mt-12">
              <div className="max-w-7xl mx-auto px-4">
                <p className="font-serif text-gold tracking-widest mb-2">LUXECUT & SPA</p>
                <p className="mb-4">Crafting beauty, elegance, and confidence since 2018.</p>
                <p>&copy; {new Date().getFullYear()} LuxeCut & Spa. All rights reserved.</p>
              </div>
            </footer>
          </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
