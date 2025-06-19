import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp, FaTimes } from 'react-icons/fa';

interface PopupWhatsAppProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  message: string;
  onConfirm: () => void;
}

const PopupWhatsApp: React.FC<PopupWhatsAppProps> = ({
  isOpen,
  onClose,
  phoneNumber,
  message,
  onConfirm
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Crear mensaje personalizado con los datos del usuario
    const personalizedMessage = message
      .replace('{{nombre}}', name)
      .replace('{{telefono}}', phone);
    
    // Generar URL de WhatsApp con el mensaje
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(personalizedMessage)}`;
    
    // Abrir WhatsApp en una nueva ventana
    window.open(whatsappUrl, '_blank');
    
    // Ejecutar callback de confirmación
    onConfirm();
    
    // Cerrar popup
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          {/* Overlay con efecto de desenfoque */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Contenido del popup */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-gray-900 border-2 border-yellow-500/50 rounded-xl shadow-2xl w-full max-w-md p-6 z-10 relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-yellow-500/20 border border-yellow-500/50 rounded-full flex items-center justify-center">
                  <FaWhatsapp className="h-6 w-6 text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Completar por WhatsApp</h3>
              </div>
              
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>
            
            <p className="text-gray-400 mb-5">
              Ingresa tus datos para generar el mensaje de compra y enviarlo por WhatsApp.
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Juan Pérez"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 555-123456"
                    required
                  />
                </div>
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  className="w-full sm:flex-1 px-4 py-3 bg-yellow-500 text-gray-900 font-bold rounded-lg transition-all duration-300 hover:bg-yellow-400 hover:shadow-lg hover:shadow-yellow-500/20 flex items-center justify-center gap-2"
                >
                  <FaWhatsapp />
                  Continuar por WhatsApp
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PopupWhatsApp;
