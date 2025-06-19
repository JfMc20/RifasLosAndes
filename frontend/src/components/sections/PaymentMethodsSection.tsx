import React from 'react';
import { PaymentMethod } from '@/types';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface PaymentMethodsSectionProps {
  paymentMethods: PaymentMethod[];
}

const PaymentMethodsSection: React.FC<PaymentMethodsSectionProps> = ({ paymentMethods }) => {
  if (!paymentMethods || paymentMethods.length === 0) {
    return null;
  }

  return (
    // El div exterior con bg-gray-50 se mantiene para el espaciado y el fondo general.
    <div className="bg-gray-50">
      <section id="payment-methods" className="relative py-24 md:py-32 overflow-hidden">
        {/* Fondo oscuro con transformación para el efecto inclinado */}
        <div className="absolute top-0 left-0 w-full h-full bg-gray-900 transform -skew-y-3 origin-top-left z-0 shadow-2xl"></div>

        {/* Elementos decorativos de fondo SUTILES (Círculos difuminados) */}
        {/* Se posicionan detrás del contenido (z-0) y no capturan eventos del ratón (pointer-events-none) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Círculos oscuros muy sutiles para añadir textura */}
          <div className="absolute top-1/4 left-1/6 w-32 h-32 rounded-full bg-gray-800 opacity-[0.06] blur-xl"></div>
          <div className="absolute bottom-1/3 right-1/6 w-48 h-48 rounded-full bg-gray-800 opacity-[0.05] blur-xl"></div>
          <div className="absolute top-2/3 left-1/3 w-16 h-16 rounded-full bg-gray-800 opacity-[0.07] blur-xl"></div>
          <div className="absolute top-1/2 right-1/4 w-24 h-24 rounded-full bg-gray-800 opacity-[0.06] blur-xl"></div>

          {/* Círculos de color extremadamente sutiles y muy difuminados para un toque de luminosidad */}
          <div className="absolute top-10 right-10 md:right-1/4 w-72 h-72 rounded-full bg-yellow-500 opacity-[0.015] blur-3xl"></div>
          <div className="absolute bottom-[-2rem] left-[-2rem] md:bottom-[-3rem] md:left-[-3rem] w-80 h-80 rounded-full bg-green-600 opacity-[0.01] blur-3xl"></div>
          <div className="absolute top-1/2 right-1/6 w-52 h-52 rounded-full bg-red-600 opacity-[0.01] blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Contenedor mejorado para el título y subtítulo */}
          <motion.div
            className="text-center mb-16 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-title font-bold text-white drop-shadow-lg text-3xl sm:text-4xl md:text-5xl mb-3">
              Métodos de Pago
            </h2>
            <p className="text-yellow-400 drop-shadow text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
              Aceptamos diversos métodos de pago para facilitar tu compra. Una vez seleccionados tus números, te guiaremos a través del proceso de pago por WhatsApp.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
            {paymentMethods.map((method, index) => (
              <motion.div
                key={method._id}
                className="relative bg-white rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-300 border-2 border-yellow-500/80"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="pt-16 pb-8 px-6 flex flex-col items-center text-center">
                  {method.imageUrl && (
                    <motion.div
                      className="absolute -top-12"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <div className="relative w-24 h-24 p-1 bg-white rounded-full shadow-lg border-2 border-yellow-500/80">
                        <Image
                          src={method.imageUrl}
                          alt={`${method.name} logo`}
                          fill
                          className="object-contain rounded-full"
                          style={{ objectFit: 'contain' }}
                        />
                      </div>
                    </motion.div>
                  )}
                  <h3 className="font-title text-2xl font-bold text-gray-900 mb-2">{method.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed min-h-[4rem] flex items-center justify-center">{method.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PaymentMethodsSection;