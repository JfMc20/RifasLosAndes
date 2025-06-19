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
      <div className="bg-gray-800 text-white rounded-2xl p-6 h-full border-2 border-yellow-500/80 shadow-2xl flex flex-col">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center flex-grow"
        >
          <h3 className="font-title text-2xl font-bold text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)] mb-2">
            Promociones
          </h3>
          <p className="text-gray-300 mb-6">Selecciona al menos un número para ver tu resumen.</p>
          <div className="space-y-3">
            {promotions && promotions.map((promo) => (
              <div 
                key={promo._id}
                className="p-3 bg-gray-700/50 border border-gray-600 rounded-lg flex justify-between items-center text-left transition-all hover:bg-gray-700 hover:border-yellow-500/50"
              >
                <div>
                  <span className="font-semibold text-white">
                    {promo.quantity === 1 ? '1 número' : `${promo.quantity} números`}
                  </span>
                  <p className="text-sm text-gray-400">{promo.description}</p>
                </div>
                <div className="text-yellow-400 font-bold text-lg">${promo.price}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 text-white rounded-2xl p-6 h-full border-2 border-yellow-500/80 shadow-2xl flex flex-col">
      <motion.h3 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="font-title text-2xl font-bold text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)] mb-4"
      >
        Tu Selección
      </motion.h3>
      
      <div className="flex-grow space-y-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <p className="font-semibold text-gray-300 mb-2">Números seleccionados ({selectedNumbers.length}):</p>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-2">
            {selectedNumbers.map((number, index) => (
              <motion.span
                key={number}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.05 * index }}
                className="inline-block bg-yellow-400 text-gray-900 px-3 py-1 rounded-md text-sm font-bold shadow-sm"
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
            className="bg-green-900/50 border border-green-500/50 rounded-md p-3"
          >
            <div className="flex items-center">
              <div className="text-green-400 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-green-300 text-sm">
                <span className="font-bold">¡Promoción aplicada!</span> {selectedNumbers.length} boletos
              </p>
            </div>
          </motion.div>
        )}
      </div>
      
      <div className="mt-auto pt-4 space-y-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="flex justify-between items-center border-t border-gray-600 pt-4"
        >
          <span className="font-bold text-lg text-white">Precio total:</span>
          <span className="text-3xl font-bold text-yellow-400">${totalPrice}</span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={onClear}
            className="w-1/3 bg-transparent border-2 border-gray-600 text-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-700 hover:border-gray-500 transition-all duration-300"
          >
            Limpiar
          </button>
          <button
            onClick={onWhatsAppClick}
            className="w-2/3 bg-yellow-500 text-gray-900 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-all duration-300 shadow-lg shadow-yellow-500/20"
          >
            Completar por WhatsApp
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default SelectionSummary;
