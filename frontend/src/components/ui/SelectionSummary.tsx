import React, { useMemo } from 'react';
import { Promotion } from '@/types';
import Image from 'next/image';
import { motion } from 'framer-motion';
import PromotionsDisplay from './PromotionsDisplay';

interface SelectionSummaryProps {
  selectedNumbers: string[];
  appliedPromotion: Promotion | null;
  onClear: () => void;
  onWhatsAppClick: () => void;
  generateWhatsAppLink: (name?: string, phone?: string) => string;
  promotions: Promotion[];
}

const calculateTotalPrice = (count: number): number => {
  if (count === 0) return 0;

  let remainingTickets = count;
  let currentPrice = 0;

  // Priorizar la promoción de 5 tickets si aplica y es la mejor opción por unidad
  // (5 tickets por $100 = $20 c/u)
  // (2 tickets por $50 = $25 c/u)
  // (1 ticket por $30 = $30 c/u)

  // Estrategia: aplicar la mejor oferta por volumen primero
  if (remainingTickets >= 5) {
    const fiveTicketBundles = Math.floor(remainingTickets / 5);
    currentPrice += fiveTicketBundles * 100;
    remainingTickets %= 5;
  }

  if (remainingTickets >= 2) {
    // Si quedan 4 boletos: 2x2_boletos ($50 + $50 = $100)
    // Si quedan 3 boletos: 1x2_boletos + 1x1_boleto ($50 + $30 = $80)
    // Si quedan 2 boletos: 1x2_boletos ($50)
    const twoTicketBundles = Math.floor(remainingTickets / 2);
    currentPrice += twoTicketBundles * 50;
    remainingTickets %= 2;
  }
  
  currentPrice += remainingTickets * 30; // Tickets individuales restantes
  
  return currentPrice;
};

const SelectionSummary: React.FC<SelectionSummaryProps> = ({
  selectedNumbers,
  appliedPromotion,
  onClear,
  onWhatsAppClick,
  generateWhatsAppLink,
  promotions,
}) => {
  const totalPrice = useMemo(() => calculateTotalPrice(selectedNumbers.length), [selectedNumbers]);

  const displayPromotions: Promotion[] = useMemo(() => [
    {
      _id: 'promo0_id',
      id: 'promo0',
      name: '1 número',
      description: 'Precio regular por un boleto.',
      details: '1 boleto',
      price: 30, // Changed to numeric
      regularPrice: 30,
      ticketCount: 1,
      quantity: 1,
      discount: 0,
      type: 'fixed',
      raffle: 'current_raffle_id' // Ensure this matches your actual raffle ID or structure
    } as Promotion, // Keep type assertion for now, ideally all fields match Promotion structure
    ...promotions,
  ], [promotions]);

  if (selectedNumbers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 relative">
        {/* Elemento decorativo en la esquina superior derecha */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500 opacity-[0.05] rounded-bl-full"></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 text-center"
        >
          <h3 className="font-title text-xl text-gray-900 drop-shadow-[0_2px_3px_rgba(0,0,0,0.15)] mb-2">Promociones disponibles</h3>
          <p className="text-gray-600 mb-4">Selecciona al menos un número para continuar</p>
          <div className="space-y-3 mb-6">
            {promotions && promotions.map((promo) => (
              <div 
                key={promo._id}
                className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm flex justify-between items-center text-left"
              >
                <div>
                  <span className="font-semibold text-gray-800">
                    {promo.quantity === 1 ? '1 número' : `${promo.quantity} números`}
                  </span>
                  <p className="text-sm text-gray-600">{promo.description}</p>
                </div>
                <div className="text-yellow-500 font-bold">${promo.price}</div>
              </div>
            ))}
          </div>
          {/* Imagen debajo de la lista de promociones con efectos */}
          <div className="mt-6 flex justify-center">
            <div className="relative w-56 h-56 md:w-64 md:h-64">
              {/* Círculos Decorativos - Deben estar en el mismo nivel de apilamiento que el contenedor de la imagen o controlados por z-index relativos a este contexto */}
              <div className="absolute -top-8 -left-10 w-28 h-28 bg-yellow-500 rounded-full opacity-20 blur-md z-0"></div>
              <div className="absolute -bottom-8 -right-10 w-24 h-24 bg-red-500 rounded-full opacity-20 blur-md z-0"></div>
              
              {/* Contenedor para la imagen y su difuminado */} 
              <div className="relative w-full h-full z-10"> {/* Este div necesita un z-index para que los círculos (z-0) queden detrás */} 
                <div className="relative w-full h-full drop-shadow-xl">
                  <Image 
                    src="/images/personados.png" 
                    alt="Persona sosteniendo tickets de rifa"
                    layout="fill"
                    objectFit="contain"
                    className="[mask-image:linear-gradient(to_bottom,black_75%,transparent_100%)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 relative">
      {/* Elementos decorativos */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500 opacity-[0.05] rounded-bl-full"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-red-600 opacity-[0.03] rounded-tr-full"></div>
      <motion.h3 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="font-title text-2xl text-gray-900 drop-shadow-[0_2px_3px_rgba(0,0,0,0.15)] mb-4 relative z-10"
      >
        Tu selección
      </motion.h3>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-4"
      >
        <p className="font-bold mb-2">Números seleccionados ({selectedNumbers.length}):</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedNumbers.map((number, index) => (
            <motion.span
              key={number}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: 0.05 * index }}
              className="inline-block bg-yellow-500 text-white px-3 py-1 rounded-md text-sm hover:bg-yellow-600 transition-all duration-200 transform hover:scale-105 shadow-sm"
            >
              {number}
            </motion.span>
          ))}
        </div>
      </motion.div>
      
      {appliedPromotion && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-green-50 border border-green-200 rounded-md p-3 mb-4 shadow-sm relative z-10"
        >
          <div className="flex items-center">
            <div className="text-green-500 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-green-700 text-sm">
              <span className="font-bold">¡Promoción aplicada!</span> {selectedNumbers.length} boletos
            </p>
          </div>
        </motion.div>
      )}
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="flex justify-between items-center border-t border-gray-200 pt-4 mb-6 relative z-10"
      >
        <span className="font-bold">Precio total:</span>
        <span className="text-2xl font-bold text-red-600">${totalPrice}</span>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <button
          onClick={onClear}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-all duration-200 transform hover:scale-[1.02] relative z-10 flex items-center justify-center min-h-[44px]"
        >
          Limpiar selección
        </button>
        
        <button
          onClick={onWhatsAppClick}
          disabled={selectedNumbers.length === 0}
          className="flex-1 flex items-center justify-center px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-sm text-white rounded-md transition-all duration-200 transform hover:scale-[1.02] shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none relative z-10 min-h-[44px]"
        >
          Completar por WhatsApp
        </button>
      </motion.div>
    </div>
  );
};

export default SelectionSummary;
