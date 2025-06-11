import React, { useState } from 'react';
import { PaymentMethod } from '@/types';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentMethodsSectionProps {
  paymentMethods: PaymentMethod[];
}

const PaymentMethodsSection: React.FC<PaymentMethodsSectionProps> = ({ paymentMethods }) => {
  if (!paymentMethods || paymentMethods.length === 0) {
    return null;
  }

  return (
    <section id="payment-methods" className="py-12 md:py-16 bg-white relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Línea decorativa superior */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-yellow-500 opacity-40"></div>
        
        {/* Círculos decorativos en negro semi-transparentes */}
        <div className="absolute top-1/3 left-1/5 w-24 h-24 rounded-full bg-black opacity-[0.03]"></div>
        <div className="absolute bottom-1/4 right-1/5 w-36 h-36 rounded-full bg-black opacity-[0.02]"></div>
        
        {/* Círculos de color muy sutiles */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-yellow-500 opacity-[0.05] rounded-full blur-xl"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-red-600 opacity-[0.05] rounded-full blur-xl"></div>
        <div className="absolute top-60 left-1/2 w-28 h-28 bg-green-600 opacity-[0.05] rounded-full blur-xl"></div>
      </div>
      <div className="container mx-auto px-4">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="font-title text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 text-center mb-3 drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)]"
        >
          Métodos de pago
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-gray-600 text-center mb-10 max-w-3xl mx-auto"
        >
          Aceptamos diversos métodos de pago para facilitar tu compra. 
          Una vez seleccionados tus números, te guiaremos a través del proceso de pago por WhatsApp.
        </motion.p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mx-auto max-w-6xl">
          {paymentMethods.map((method, index) => {
            const [isExpanded, setIsExpanded] = useState(false);
            return (
              <motion.div 
                key={method._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                viewport={{ once: true }}
                className={`bg-white rounded-lg p-4 border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden cursor-pointer ${isExpanded ? 'shadow-lg' : ''}`}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {/* Línea decorativa amarilla en la parte superior */}
                <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500"></div>
                
                <div className="flex items-center justify-between">
                  <h3 className="font-title text-xl text-gray-900 py-2">{method.name}</h3>
                  <svg 
                    className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isExpanded ? 'transform rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="pt-3 border-t border-gray-100 mt-2"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="relative w-20 h-20 mb-4">
                          {method.imageUrl && (
                            <Image
                              src={method.imageUrl}
                              alt={method.name}
                              fill
                              className="drop-shadow-sm"
                              style={{ objectFit: 'contain' }}
                            />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PaymentMethodsSection;
