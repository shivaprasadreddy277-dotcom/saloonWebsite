import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Scissors, Clock, Sparkles } from 'lucide-react';

export const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/services')
      .then(res => {
        setServices(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching services:', err);
        setLoading(false);
      });
  }, []);

  const categories = ['All', 'Hair', 'Skin', 'Beard', 'Massage'];

  const filteredServices = activeCategory === 'All'
    ? services
    : services.filter(s => s.category === activeCategory);

  const handleBookNow = (serviceId) => {
    navigate('/book', { state: { serviceId } });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 animate-fade-in">
      
      {/* Page Header */}
      <div className="text-center space-y-4">
        <span className="flex items-center justify-center gap-1.5 text-[10px] md:text-xs font-bold uppercase tracking-widest text-gold-gradient">
          <Sparkles size={12} /> The Luxury Service Menu
        </span>
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-white tracking-wide leading-none">
          Ritual <span className="gold-text-gradient font-serif">Collections</span>
        </h1>
        <div className="w-20 h-0.5 bg-gold mx-auto"></div>
        <p className="text-zinc-400 text-sm md:text-base max-w-lg mx-auto font-light leading-relaxed">
          Select from our curation of hair styling, facial architectures, and deep body therapies designed to elevate your style.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex justify-center flex-wrap gap-2.5 max-w-lg mx-auto bg-zinc-950/40 p-2 rounded-full border border-zinc-900">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              activeCategory === cat
                ? 'bg-gold-gradient text-black shadow-gold-glow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-20 text-zinc-650 glass-panel border border-zinc-900 rounded-2xl">
          <Scissors size={48} className="mx-auto mb-4 text-zinc-800" />
          <p className="font-light">No services found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service) => (
            <div
              key={service._id}
              className="glass-panel glass-card-hover rounded-2xl overflow-hidden p-7 border border-zinc-850 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-gold rounded-full text-[10px] font-bold uppercase tracking-widest">
                    {service.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold">
                    <Clock size={12} className="text-gold" /> {service.duration} mins
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-white tracking-wide">{service.name}</h3>
                
                <p className="text-zinc-400 text-sm font-light leading-relaxed min-h-[48px]">
                  {service.description || 'Elevate your aesthetic details with our signature customized styling.'}
                </p>
              </div>

              <div className="mt-8 pt-5 border-t border-zinc-900/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Investment</span>
                  <span className="text-xl font-bold text-gold">₹{service.price}</span>
                </div>
                <button
                  onClick={() => handleBookNow(service._id)}
                  className="px-5 py-2.5 bg-zinc-900/60 border border-gold/40 text-gold hover:bg-gold-gradient hover:text-black hover:border-transparent font-bold text-xs uppercase tracking-wider rounded-lg transition-all duration-300"
                >
                  Book Session
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Services;
