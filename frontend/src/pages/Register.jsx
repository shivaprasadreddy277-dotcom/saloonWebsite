import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Scissors, User, Mail, Lock, Phone } from 'lucide-react';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      return toast('Please fill in name, email, and password', 'warning');
    }
    
    if (password.length < 6) {
      return toast('Password must be at least 6 characters long', 'warning');
    }

    try {
      setLoading(true);
      const user = await register(name, email, password, phone);
      toast(`Welcome, ${user.name}! Account created successfully.`, 'success');
      navigate('/');
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to register. Please try again.';
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="max-w-md w-full space-y-8 glass-panel border border-zinc-800 p-8 rounded-xl relative overflow-hidden shadow-gold-glow">
        
        {/* Decorative elements */}
        <div className="absolute -left-10 -top-10 w-24 h-24 bg-gold/5 rounded-full blur-xl"></div>
        
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center text-gold border border-gold/25">
              <Scissors size={22} className="transform -rotate-45" />
            </div>
          </div>
          <h2 className="text-3xl font-serif font-bold text-white tracking-wide">Join LuxeCut</h2>
          <p className="text-sm text-zinc-400">Create an account to book and manage appointments</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                  <User size={16} />
                </span>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded text-sm text-white placeholder-zinc-550 focus:outline-none focus:border-gold transition"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                  <Mail size={16} />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded text-sm text-white placeholder-zinc-550 focus:outline-none focus:border-gold transition"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                  <Phone size={16} />
                </span>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded text-sm text-white placeholder-zinc-550 focus:outline-none focus:border-gold transition"
                  placeholder="+91 99999 88888"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                  <Lock size={16} />
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded text-sm text-white placeholder-zinc-550 focus:outline-none focus:border-gold transition"
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded text-sm font-bold text-black bg-gold-gradient hover:scale-102 hover:shadow-gold-glow-lg transition focus:outline-none disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>

        <div className="text-center pt-4 border-t border-zinc-900 mt-4 text-xs text-zinc-400">
          <span>Already have an account? </span>
          <Link to="/login" className="text-gold hover:underline font-semibold">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};
export default Register;
