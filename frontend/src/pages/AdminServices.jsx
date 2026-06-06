import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { Scissors, Plus, Edit2, Trash2, X, Clock, IndianRupee } from 'lucide-react';

export const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Modal and Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('Hair');
  const [submitting, setSubmitting] = useState(false);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/services');
      setServices(res.data);
    } catch (err) {
      console.error(err);
      toast('Failed to load services catalog.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openCreateModal = () => {
    setEditingService(null);
    setName('');
    setDescription('');
    setPrice('');
    setDuration('');
    setCategory('Hair');
    setIsModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setName(service.name);
    setDescription(service.description);
    setPrice(service.price);
    setDuration(service.duration);
    setCategory(service.category);
    setIsModalOpen(true);
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service? This action is permanent.')) return;
    
    try {
      await axios.delete(`/api/services/${serviceId}`);
      toast('Service deleted successfully.', 'success');
      fetchServices();
    } catch (err) {
      console.error(err);
      toast('Failed to delete service.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !duration || !category) {
      return toast('Please fill in name, price, duration, and category.', 'warning');
    }

    try {
      setSubmitting(true);
      const payload = {
        name,
        description,
        price: Number(price),
        duration: Number(duration),
        category
      };

      if (editingService) {
        // Edit Service
        await axios.put(`/api/services/${editingService._id}`, payload);
        toast('Service updated successfully.', 'success');
      } else {
        // Create Service
        await axios.post('/api/services', payload);
        toast('New service added to catalog.', 'success');
      }

      setIsModalOpen(false);
      fetchServices();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Action failed.';
      toast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-zinc-900 pb-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white tracking-wide">Services Catalog</h1>
          <p className="text-zinc-400 text-sm">Add, update, or remove customer-facing styling treatments</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-gold-gradient text-black font-bold text-sm rounded shadow-gold-glow hover:scale-102 transition"
        >
          <Plus size={16} /> Add New Service
        </button>
      </div>

      {/* Services Table */}
      {services.length === 0 ? (
        <div className="glass-panel p-12 text-center text-zinc-500 rounded-xl border border-zinc-850">
          <Scissors size={48} className="mx-auto mb-4 text-zinc-700" />
          <p>No services registered. Add your first service to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto glass-panel border border-zinc-850 rounded-xl">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-900/40 text-xs text-zinc-400 uppercase border-b border-zinc-900">
              <tr>
                <th className="px-6 py-4">Service Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {services.map((service) => (
                <tr key={service._id} className="hover:bg-zinc-900/10">
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className="font-bold text-white tracking-wide block">{service.name}</span>
                      <span className="text-xs text-zinc-500 line-clamp-1">{service.description || 'No description provided.'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-zinc-800 text-gold rounded text-xs font-semibold uppercase tracking-wider">
                      {service.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-300">
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-zinc-500" /> {service.duration} mins
                    </div>
                  </td>
                  <td className="px-6 py-4 font-serif font-bold text-gold">₹{service.price}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(service)}
                        className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-gold/30 hover:text-gold rounded text-zinc-400 transition"
                        title="Edit Service"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(service._id)}
                        className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-red-900/50 hover:text-red-400 rounded text-zinc-400 transition"
                        title="Delete Service"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="glass-panel border border-zinc-800 rounded-xl p-6 max-w-md w-full space-y-6 animate-fade-in relative">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <h3 className="text-lg font-bold text-white font-serif tracking-wide">
                {editingService ? 'Edit Salon Service' : 'Add New Service'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Service Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-gold"
                  placeholder="e.g. Beard Trim & Shave"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="block w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-gold"
                >
                  <option value="Hair">Hair</option>
                  <option value="Skin">Skin</option>
                  <option value="Beard">Beard</option>
                  <option value="Massage">Massage</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Price & Duration Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Price (INR)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                      <IndianRupee size={14} />
                    </span>
                    <input
                      type="number"
                      min="0"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="block w-full pl-8 pr-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-gold"
                      placeholder="e.g. 150"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Duration (Mins)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                      <Clock size={14} />
                    </span>
                    <input
                      type="number"
                      min="1"
                      required
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="block w-full pl-8 pr-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-gold"
                      placeholder="e.g. 30"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="block w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-gold h-20 resize-none"
                  placeholder="Summarize the styling treatment and product specs..."
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-2.5 bg-zinc-900 border border-zinc-800 text-gray-400 rounded text-sm font-semibold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-gold text-black font-bold rounded text-sm hover:bg-gold-dark disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingService ? 'Update Service' : 'Add Service'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default AdminServices;
