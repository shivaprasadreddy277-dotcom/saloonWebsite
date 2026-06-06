import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Scissors, Clock, MapPin, Phone, MessageCircle, Star, Award, Sparkles, Compass, ShieldCheck } from 'lucide-react';

export const Home = () => {
  const [settings, setSettings] = useState(null);
  const [featuredServices, setFeaturedServices] = useState([]);

  useEffect(() => {
    axios.get('/api/settings')
      .then(res => setSettings(res.data))
      .catch(err => console.error('Error fetching settings:', err));

    axios.get('/api/services')
      .then(res => {
        setFeaturedServices(res.data.slice(0, 3));
      })
      .catch(err => console.error('Error fetching services:', err));
  }, []);

  return (
    <div className="space-y-24 animate-fade-in pb-20">
      
      {/* 1. Walk-in Wait Time Banner */}
      {settings?.showWaitTimeBanner && (
        <div className="bg-zinc-950/80 backdrop-blur-md border-b border-gold/30 text-gold py-3.5 px-4 text-center text-xs sm:text-sm md:text-base font-semibold flex items-center justify-center gap-2.5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gold/5 animate-pulse-slow"></div>
          <Clock size={16} className="animate-spin text-gold shrink-0" style={{ animationDuration: '8s' }} />
          <span>
            Walk-in Wait Time: <strong className="text-white bg-gold/25 px-2 py-0.5 rounded font-bold">{settings.walkInWaitTime} mins</strong>. Secure a slot to skip the queue!
          </span>
          <Link to="/book" className="ml-3 underline hover:text-white transition duration-200 font-bold">Book Now &rarr;</Link>
        </div>
      )}

      {/* 2. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-16">
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950/40 p-8 md:p-20 text-center shadow-2xl">
          {/* Glowing mesh nodes inside the hero */}
          <div className="absolute -right-32 -top-32 w-[350px] h-[350px] bg-gold/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute -left-32 -bottom-32 w-[350px] h-[350px] bg-gold/5 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto space-y-8">
            <div className="flex justify-center">
              <span className="flex items-center gap-2 px-4 py-1.5 bg-gold/10 text-gold border border-gold/20 rounded-full text-[10px] md:text-xs font-semibold uppercase tracking-widest animate-pulse-slow">
                <Sparkles size={12} /> The Luxury Grooming Sanctuary
              </span>
            </div>
            
            <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-none">
              Crafting Bold <br />
              <span className="gold-text-gradient font-serif">Aesthetics</span>
            </h1>
            
            <p className="text-zinc-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-light">
              Step into Hyderabad's premium salon environment. We combine classical barbering precision with modern skin wellness therapies to curate your distinct aesthetic.
            </p>
            
            <div className="pt-6 flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto">
              <Link
                to="/book"
                className="w-full py-4 rounded bg-gold-gradient text-black font-extrabold text-sm uppercase tracking-widest shadow-gold-glow hover:shadow-gold-glow-lg hover:scale-[1.03] transition-all duration-300"
              >
                Book Session Now
              </Link>
              <Link
                to="/services"
                className="w-full py-4 rounded border border-zinc-800 bg-zinc-900/30 text-gray-300 font-bold text-sm uppercase tracking-widest hover:bg-zinc-900 hover:border-gold/30 transition duration-300"
              >
                Our Rituals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Value Proposition Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel glass-card-hover p-8 rounded-2xl border border-zinc-800 space-y-5">
            <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold border border-gold/20">
              <Scissors size={22} />
            </div>
            <h3 className="text-xl font-bold text-white tracking-wide">Master Stylists</h3>
            <p className="text-zinc-400 text-sm leading-relaxed font-light">Our team holds elite international credentials in precision shear cutting, coloring chemistry, and skin architecture.</p>
          </div>
          
          <div className="glass-panel glass-card-hover p-8 rounded-2xl border border-zinc-800 space-y-5">
            <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold border border-gold/20">
              <Compass size={22} />
            </div>
            <h3 className="text-xl font-bold text-white tracking-wide">Streamlined Booking</h3>
            <p className="text-zinc-400 text-sm leading-relaxed font-light">Eliminate walk-in queue confusion. Select your specialist and time slot online, and walk directly to your designated chair.</p>
          </div>

          <div className="glass-panel glass-card-hover p-8 rounded-2xl border border-zinc-800 space-y-5">
            <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold border border-gold/20">
              <ShieldCheck size={22} />
            </div>
            <h3 className="text-xl font-bold text-white tracking-wide">Premium Formulations</h3>
            <p className="text-zinc-400 text-sm leading-relaxed font-light">We formulate your care using organic European hair elixirs and clinical dermis infusions to promote long-term vitality.</p>
          </div>
        </div>
      </section>

      {/* 4. Featured Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-gradient">Signature Rituals</span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-wide">Refined Collections</h2>
          <div className="w-16 h-0.5 bg-gold mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredServices.map((service) => (
            <div key={service._id} className="glass-panel glass-card-hover rounded-2xl overflow-hidden border border-zinc-850 flex flex-col justify-between p-7">
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 bg-zinc-900 border border-zinc-800 text-gold rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {service.category}
                </span>
                <h3 className="text-2xl font-bold text-white tracking-wide">{service.name}</h3>
                <p className="text-zinc-400 text-sm font-light leading-relaxed line-clamp-2">{service.description || 'Elevate your aesthetic with our personalized styling.'}</p>
              </div>
              <div className="mt-8 pt-5 border-t border-zinc-900 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Investment</span>
                  <span className="text-xl font-bold text-gold">₹{service.price}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Duration</span>
                  <span className="text-sm text-gray-300 font-semibold">{service.duration} mins</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <Link to="/services" className="inline-block text-gold hover:text-white font-bold tracking-wider uppercase text-xs border-b border-gold pb-1 transition duration-200">
            Browse Full Catalog &rarr;
          </Link>
        </div>
      </section>

      {/* 5. About Section */}
      <section className="bg-zinc-950/20 border-y border-zinc-900/60 py-20 relative">
        <div className="absolute right-0 bottom-0 w-[400px] h-[300px] bg-gold/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-8">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-gradient">The Atelier</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-wide leading-tight">Artistry. Detail. Sanctuary.</h2>
            
            <div className="space-y-4 text-zinc-400 text-sm md:text-base font-light leading-relaxed">
              <p>
                Founded in 2018, LuxeCut & Spa was created with a simple vision: to offer an environment where every client receives premium, personalized grooming care without the rush. Our salon is a sanctuary of comfort and sophistication.
              </p>
              <p>
                We employ the best barbers and skin clinicians in the country, using premium European tools and organic formulas to deliver flawless details. From precision fades to rejuvenating charcoal facials, we treat grooming as an art.
              </p>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div>
                <span className="block text-4xl font-serif font-bold text-gold">10k+</span>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Happy Clients</span>
              </div>
              <div className="w-px h-10 bg-zinc-800"></div>
              <div>
                <span className="block text-4xl font-serif font-bold text-gold">12+</span>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Styling Masters</span>
              </div>
              <div className="w-px h-10 bg-zinc-800"></div>
              <div>
                <span className="block text-4xl font-serif font-bold text-gold">4.9/5</span>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Rating</span>
              </div>
            </div>
          </div>
          
          {/* Gallery Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="h-56 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 flex items-center justify-center relative overflow-hidden group hover:border-gold/30 transition duration-300">
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent z-10"></div>
                <Scissors className="text-zinc-800 group-hover:text-gold transition-all duration-300 group-hover:scale-110" size={48} />
                <span className="absolute bottom-4 left-4 z-20 text-xs font-bold uppercase tracking-wider text-white">Hair Sculpting</span>
              </div>
              <div className="h-36 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 flex items-center justify-center relative overflow-hidden group hover:border-gold/30 transition duration-300">
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent z-10"></div>
                <Star className="text-zinc-800 group-hover:text-gold transition-all duration-300 group-hover:scale-110" size={32} />
                <span className="absolute bottom-4 left-4 z-20 text-xs font-bold uppercase tracking-wider text-white">Beard Outlining</span>
              </div>
            </div>
            <div className="space-y-4 pt-10">
              <div className="h-36 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 flex items-center justify-center relative overflow-hidden group hover:border-gold/30 transition duration-300">
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent z-10"></div>
                <Award className="text-zinc-800 group-hover:text-gold transition-all duration-300 group-hover:scale-110" size={32} />
                <span className="absolute bottom-4 left-4 z-20 text-xs font-bold uppercase tracking-wider text-white">Dermal Health</span>
              </div>
              <div className="h-56 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 flex items-center justify-center relative overflow-hidden group hover:border-gold/30 transition duration-300">
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent z-10"></div>
                <Clock className="text-zinc-800 group-hover:text-gold transition-all duration-300 group-hover:scale-110" size={48} />
                <span className="absolute bottom-4 left-4 z-20 text-xs font-bold uppercase tracking-wider text-white">Spa Therapy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Contact & Location Maps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl border border-zinc-800/80 grid grid-cols-1 md:grid-cols-2 overflow-hidden shadow-2xl">
          <div className="p-8 md:p-14 space-y-8 flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-wide">The Location</h2>
              <p className="text-zinc-400 text-sm font-light leading-relaxed">
                Experience world-class luxury at Hyderabad's high-street enclave. Free private valet parking is provided.
              </p>
            </div>
            
            <div className="space-y-5 text-sm text-zinc-300">
              <div className="flex items-center gap-4">
                <MapPin className="text-gold shrink-0" size={20} />
                <span className="font-light">102, Gold Crest Plaza, Jubilee Hills, Hyderabad - 500033</span>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="text-gold shrink-0" size={20} />
                <span className="font-light">+91 63012 77084</span>
              </div>
              <div className="flex items-center gap-4">
                <Clock className="text-gold shrink-0" size={20} />
                <span className="font-light">Operational Hours: 09:00 AM - 07:00 PM</span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-zinc-900/60">
              <a
                href="https://wa.me/916301277084?text=Hello%20LuxeCut,%20I'd%20like%20to%20inquire%20about%20a%20booking"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-zinc-900 border border-emerald-900 text-emerald-400 hover:bg-emerald-950/20 hover:text-white transition duration-200 text-xs font-bold uppercase tracking-wider"
              >
                <MessageCircle size={16} /> WhatsApp Inquiry
              </a>
              <Link
                to="/book"
                className="px-6 py-3 rounded-lg bg-gold-gradient text-black font-extrabold hover:scale-102 transition duration-200 text-xs uppercase tracking-wider"
              >
                Reserve Slot
              </Link>
            </div>
          </div>
          
          {/* Static Map component */}
          <div className="bg-zinc-900/40 border-l border-zinc-800/80 flex items-center justify-center p-8 relative min-h-[350px]">
            <div className="absolute inset-0 bg-zinc-950/20 pointer-events-none"></div>
            <div className="text-center z-20 space-y-4 max-w-sm">
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center text-gold mx-auto border border-gold/20 animate-pulse-slow">
                <MapPin size={28} />
              </div>
              <h4 className="font-serif font-bold text-white text-xl tracking-wide">Interactive Location</h4>
              <p className="text-zinc-500 text-xs leading-relaxed font-light">
                Jubilee Hills, Road No. 36. Near Apollo Hospital. Click below to view real-time traffic details.
              </p>
              <a 
                href="https://maps.google.com" 
                target="_blank" 
                rel="noreferrer"
                className="inline-block text-[11px] font-bold uppercase tracking-wider px-5 py-2.5 border border-zinc-800 text-zinc-400 hover:text-gold hover:border-gold rounded-md transition"
              >
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
};
export default Home;
