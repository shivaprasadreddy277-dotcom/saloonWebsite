import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Scissors, Mail, Lock } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast('Please enter both email and password', 'warning');
    }

    try {
      setLoading(true);
      const user = await login(email, password);
      toast(`Welcome back, ${user.name}!`, 'success');
      
      // Role redirection
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Invalid email or password';
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="max-w-md w-full space-y-8 glass-panel border border-zinc-800 p-8 rounded-xl relative overflow-hidden shadow-gold-glow">
        
        {/* Decorative elements */}
        <div className="absolute -right-10 -top-10 w-24 h-24 bg-gold/5 rounded-full blur-xl"></div>
        
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center text-gold border border-gold/25">
              <Scissors size={22} className="transform -rotate-45" />
            </div>
          </div>
          <h2 className="text-3xl font-serif font-bold text-white tracking-wide">Sign In</h2>
          <p className="text-sm text-zinc-400">Access your LuxeCut dashboard and bookings</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
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
                  className="block w-full pl-10 pr-3 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-gold transition"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
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
                  className="block w-full pl-10 pr-3 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-gold transition"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded text-sm font-bold text-black bg-gold-gradient hover:scale-102 hover:shadow-gold-glow-lg transition focus:outline-none disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        <div className="text-center pt-4 border-t border-zinc-900 mt-4 text-xs text-zinc-400">
          <span>New to LuxeCut? </span>
          <Link to="/register" className="text-gold hover:underline font-semibold">
            Create an account
          </Link>
        </div>

        {/* Demo Credentials Alert */}
        <div className="bg-gold/5 border border-gold/20 rounded-lg p-3 text-xs text-zinc-400 space-y-1">
          <p className="font-bold text-gold">Demo Administrator Access:</p>
          <p>Email: <code className="text-white">admin@luxecut.com</code></p>
          <p>Password: <code className="text-white">adminpassword</code></p>
        </div>

      </div>
    </div>
  );
};
export default Login;
