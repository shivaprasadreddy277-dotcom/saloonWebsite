import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Scissors, Calendar, Shield, LogOut, User, LayoutDashboard } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `px-3 py-2 rounded-md text-sm font-medium transition duration-200 ${
      isActive(path)
        ? 'text-gold border-b-2 border-gold rounded-none'
        : 'text-zinc-400 hover:text-gold'
    }`;

  const mobileLinkClass = (path) =>
    `block px-3 py-2 rounded-md text-base font-medium ${
      isActive(path)
        ? 'bg-slate-input text-gold'
        : 'text-zinc-400 hover:bg-slate-input hover:text-gold'
    }`;

  return (
    <nav className="sticky top-0 z-40 bg-slate-light/95 backdrop-blur-md border-b border-slate-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Scissors className="text-gold transform -rotate-45" size={24} />
              <span className="font-serif text-xl md:text-2xl font-bold tracking-widest text-gold-gradient">
                LUXECUT
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className={linkClass('/')}>Home</Link>
            <Link to="/services" className={linkClass('/services')}>Services</Link>
            
            {user && !isAdmin && (
              <>
                <Link to="/profile" className={linkClass('/profile')}>Profile</Link>
                <Link to="/my-appointments" className={linkClass('/my-appointments')}>My Bookings</Link>
              </>
            )}

            {isAdmin && (
              <>
                <Link to="/admin" className={linkClass('/admin')}>
                  <span className="flex items-center gap-1">
                    <LayoutDashboard size={16} /> Dashboard
                  </span>
                </Link>
                <Link to="/admin/calendar" className={linkClass('/admin/calendar')}>
                  <span className="flex items-center gap-1">
                    <Calendar size={16} /> Calendar
                  </span>
                </Link>
                <Link to="/admin/services" className={linkClass('/admin/services')}>
                  <span className="flex items-center gap-1">
                    <Scissors size={16} /> Services
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* User Controls (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-[#F5F5F5]">
                  {isAdmin ? (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-gold/10 text-gold border border-gold/30 rounded-full text-xs font-semibold">
                      <Shield size={12} /> Owner
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-input rounded-full text-xs text-gold-silver">
                      <User size={12} className="text-gold" /> {user.name.split(' ')[0]}
                    </span>
                  )}
                </div>
                <Link
                  to="/profile"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-[#A8A8B3] hover:text-gold hover:bg-slate-input border border-slate-border transition duration-200"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-zinc-950 border border-slate-border rounded-lg transition duration-200"
                >
                  <LogOut size={14} /> Logout
                </button>
                {!isAdmin && (
                  <Link
                    to="/book"
                    className="px-5 py-2 rounded bg-gold-gradient text-black font-extrabold text-xs uppercase tracking-wider hover:scale-[1.03] shadow-gold-glow hover:shadow-gold-glow-lg transition duration-300 animate-pulse-slow"
                  >
                    Book Now
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-[#A8A8B3] hover:text-gold transition duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/book"
                  className="px-5 py-2 rounded bg-gold-gradient text-black font-extrabold text-xs uppercase tracking-wider hover:scale-[1.03] shadow-gold-glow hover:shadow-gold-glow-lg transition duration-300"
                >
                  Book Now
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger Mobile Menu Icon */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#A8A8B3] hover:text-gold hover:bg-slate-input focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-[#12122A] border-b border-slate-border animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" onClick={() => setIsOpen(false)} className={mobileLinkClass('/')}>Home</Link>
            <Link to="/services" onClick={() => setIsOpen(false)} className={mobileLinkClass('/services')}>Services</Link>
            
            {user && !isAdmin && (
              <Link to="/my-appointments" onClick={() => setIsOpen(false)} className={mobileLinkClass('/my-appointments')}>My Bookings</Link>
            )}

            {isAdmin && (
              <>
                <Link to="/admin" onClick={() => setIsOpen(false)} className={mobileLinkClass('/admin')}>Dashboard</Link>
                <Link to="/admin/calendar" onClick={() => setIsOpen(false)} className={mobileLinkClass('/admin/calendar')}>Calendar View</Link>
                <Link to="/admin/services" onClick={() => setIsOpen(false)} className={mobileLinkClass('/admin/services')}>Manage Services</Link>
              </>
            )}

            {user ? (
              <div className="pt-4 pb-2 border-t border-slate-border mt-4">
                <div className="flex items-center px-3 mb-3">
                  <div className="text-base font-medium text-white">{user.name}</div>
                  <div className="ml-3 text-sm font-medium text-gold">({user.role})</div>
                </div>
                
                {!isAdmin && (
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="block text-left px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-slate-input hover:text-gold transition"
                  >
                    Profile
                  </Link>
                )}
                {!isAdmin && (
                  <Link
                    to="/book"
                    onClick={() => setIsOpen(false)}
                    className="block text-center w-full px-4 py-2 mt-2 rounded bg-gold-gradient text-black font-bold text-sm"
                  >
                    Book Appointment
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-slate-input transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="pt-4 pb-2 border-t border-slate-border mt-4 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-center w-full px-4 py-2 rounded border border-slate-border text-gray-300 font-semibold text-sm hover:text-gold"
                >
                  Sign In
                </Link>
                <Link
                  to="/book"
                  onClick={() => setIsOpen(false)}
                  className="block text-center w-full px-4 py-2 rounded bg-gold-gradient text-black font-semibold text-sm"
                >
                  Book Appointment
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
export default Navbar;
