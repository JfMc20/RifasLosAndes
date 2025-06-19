import React, { useState, useMemo } from 'react';
import { Ticket, Promotion, TicketStatus } from '@/types';
import TicketGrid from '@/components/ui/TicketGrid';
import SelectionSummary from '@/components/ui/SelectionSummary';
import { useTicketSelection } from '@/hooks/useTicketSelection';
import PopupWhatsApp from '@/components/ui/PopupWhatsApp';
import ProgressBar from '@/components/ui/ProgressBar';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

import { motion } from 'framer-motion';

// Definimos la animación de pulso sutil para el botón de número aleatorio
const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

interface TicketsSectionProps {
  tickets: Ticket[];
  promotions: Promotion[];
}

const TicketsSection: React.FC<TicketsSectionProps> = ({ tickets, promotions }) => {
  // Estados para filtrado
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchNumber, setSearchNumber] = useState<string>('');  // Estado para la búsqueda de número específico

  // Calcular estadísticas de tickets y aplicar filtros
  const { filteredTickets, ticketStats } = useMemo(() => {
    const stats = {
      total: tickets.length,
      sold: tickets.filter(t => t.status === TicketStatus.SOLD).length,
      reserved: tickets.filter(t => t.status === TicketStatus.RESERVED).length,
      available: 0
    };
    stats.available = stats.total - stats.sold - stats.reserved;

    let newFilteredTickets;
    switch (filterStatus) {
      case 'available':
        newFilteredTickets = tickets.filter(t => t.status === TicketStatus.AVAILABLE);
        break;
      case 'sold':
        newFilteredTickets = tickets.filter(t => t.status === TicketStatus.SOLD);
        break;
      case 'all':
      default:
        newFilteredTickets = tickets;
        break;
    }
    
    return { 
      filteredTickets: newFilteredTickets, 
      ticketStats: stats
    };
  }, [tickets, filterStatus]);
  // Use the custom hook to manage ticket selection logic
  const {
    selectedTickets,
    toggleTicket,
    clearSelections,
    totalPrice,
    appliedPromotion,
    generateWhatsAppLink,
    isWhatsAppPopupOpen,
    openWhatsAppPopup,
    closeWhatsAppPopup
  } = useTicketSelection(tickets, promotions);

  const [phoneNumber, setPhoneNumber] = useState(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5491155555555');

  const selectRandomTicket = () => {
    const availableTickets = tickets.filter(t => t.status === TicketStatus.AVAILABLE);
    if (availableTickets.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableTickets.length);
      const randomTicket = availableTickets[randomIndex];
      
      // Establece el número de búsqueda para resaltarlo
      setSearchNumber(randomTicket.number);

      // Asegurarse de que el ticket sea visible cambiando el filtro si es necesario
      if (filterStatus !== 'all') {
        setFilterStatus('all');
      }
    }
  };

  return (
    <section id="tickets" className="py-12 md:py-16 bg-gray-900 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 z-0">

        {/* Línea decorativa superior similar al header */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-600 via-green-600 to-red-600 opacity-30"></div>
        
        {/* Círculos decorativos en negro semi-transparentes */}
        <div className="absolute top-1/4 left-1/6 w-32 h-32 rounded-full bg-black opacity-[0.04] blur-sm"></div>
        <div className="absolute bottom-1/3 right-1/6 w-48 h-48 rounded-full bg-black opacity-[0.03] blur-sm"></div>
        <div className="absolute top-2/3 left-1/3 w-16 h-16 rounded-full bg-black opacity-[0.05] blur-sm"></div>
        <div className="absolute top-1/2 right-1/4 w-24 h-24 rounded-full bg-black opacity-[0.04] blur-sm"></div>
        
        {/* Círculos de color muy sutiles */}
        <div className="absolute top-10 left-10 md:left-1/4 w-72 h-72 rounded-full bg-yellow-500 opacity-[0.08] blur-md"></div>
        <div className="absolute bottom-[-2rem] right-[-2rem] md:bottom-[-3rem] md:right-[-3rem] w-80 h-80 rounded-full bg-green-600 opacity-[0.07] blur-md"></div>
        <div className="absolute top-1/2 left-1/6 w-52 h-52 rounded-full bg-red-600 opacity-[0.07] blur-md"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="font-title text-4xl md:text-5xl font-bold text-white mb-2 [text-shadow:0_0_15px_rgba(234,179,8,0.5)]">
            ¡Participa y Gana!
          </h2>
          <p className="text-gray-300 mt-2 text-lg">
            Quedan <AnimatedCounter to={ticketStats.available} className="font-bold text-yellow-400" /> de <AnimatedCounter to={ticketStats.total} className="font-bold text-white" /> números disponibles.
          </p>
        </motion.div>
        
        {/* Eliminamos las promociones de aquí ya que se mostrarán en la sección de selección */}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="bg-gray-800/60 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-2xl h-full border-2 border-yellow-500/80">
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-center mb-2 text-white"
              >
                Números Disponibles
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center text-yellow-400 mb-8 [text-shadow:0_0_8px_rgba(234,179,8,0.5)]"
              >
                Haz clic en los números que deseas comprar
              </motion.p>
              
              {/* Controles y filtros */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                {/* Filtros */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  {['all', 'available', 'sold'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-4 py-2 text-sm rounded-lg font-semibold transition-all duration-300 border-2 ${
                        filterStatus === status
                          ? 'bg-yellow-400 text-gray-900 border-yellow-400/90 shadow-lg scale-105'
                          : 'bg-gray-700/50 text-gray-300 border-yellow-500/70 hover:bg-yellow-400/20 hover:text-white'
                      }`}
                    >
                      {status === 'all' ? 'Todos' : status === 'available' ? 'Disponibles' : 'Vendidos'}
                    </button>
                  ))}
                </div>

                {/* Búsqueda y botón de número al azar */}
                <div className="flex items-center justify-center md:justify-end gap-2">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchNumber}
                    onChange={(e) => setSearchNumber(e.target.value)}
                    className="w-32 px-4 py-2 text-sm bg-gray-900/50 text-gray-200 border-2 border-yellow-500/70 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-all duration-300"
                  />
                  <button
                    onClick={selectRandomTicket}
                    className="px-4 py-2 text-sm bg-gray-900/50 text-yellow-400 border-2 border-yellow-500/80 rounded-lg font-bold hover:bg-yellow-400 hover:text-gray-900 transition-all duration-300 shadow-sm"
                    title="Seleccionar un número al azar"
                  >
                    Al Azar
                  </button>
                </div>
              </div>

              {/* Barra de progreso integrada */}
              <div className="mb-6 px-4">
                <ProgressBar total={ticketStats.total} sold={ticketStats.sold} />
              </div>

              {/* Leyenda de colores y contador */}
              {/* La leyenda de colores se ha eliminado según la solicitud del usuario para simplificar la interfaz */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
                viewport={{ once: true }}
              >
                <TicketGrid
                  tickets={filteredTickets}
                  onSelectTicket={toggleTicket}
                  selectedTickets={selectedTickets}
                  highlightNumber={searchNumber} /* Pasamos el número a resaltar */
                />
              </motion.div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <SelectionSummary
              selectedNumbers={selectedTickets}
              appliedPromotion={appliedPromotion}
              onClear={clearSelections}
              generateWhatsAppLink={generateWhatsAppLink}
              onWhatsAppClick={openWhatsAppPopup}
              promotions={promotions}
            />
          </motion.div>
        </div>
        
        {/* Pop-up de WhatsApp para completar la compra */}
        <PopupWhatsApp
          isOpen={isWhatsAppPopupOpen}
          onClose={closeWhatsAppPopup}
          phoneNumber={phoneNumber}
          message={`Hola! Soy {{nombre}}, mi teléfono es {{telefono}}. Me interesan los siguientes números para la rifa: ${selectedTickets.join(', ')}. El total es $${totalPrice}.`}
          onConfirm={() => console.log('Compra iniciada por WhatsApp')}
        />
      </div>
    </section>
  );
};

export default TicketsSection;
