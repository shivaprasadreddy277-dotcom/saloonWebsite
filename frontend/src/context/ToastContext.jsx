import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      
      {/* Toast Portal Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-lg shadow-lg border animate-fade-in ${
              t.type === 'success'
                ? 'bg-zinc-900 border-green-500 text-green-400'
                : t.type === 'error'
                ? 'bg-zinc-900 border-red-500 text-red-400'
                : t.type === 'warning'
                ? 'bg-zinc-900 border-yellow-500 text-yellow-400'
                : 'bg-zinc-900 border-gold text-gold'
            }`}
            style={{
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div className="flex items-center gap-3">
              {t.type === 'success' && <CheckCircle size={20} className="shrink-0" />}
              {t.type === 'error' && <AlertCircle size={20} className="shrink-0" />}
              {t.type === 'warning' && <AlertTriangle size={20} className="shrink-0" />}
              {t.type === 'info' && <Info size={20} className="shrink-0" />}
              
              <p className="text-sm font-medium text-gray-200">{t.message}</p>
            </div>
            
            <button
              onClick={() => removeToast(t.id)}
              className="ml-4 p-1 rounded-full text-gray-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastContext;
