import React, { useState, useMemo } from 'react';
import { Ticket, Promotion, TicketStatus } from '@/types';
import TicketGrid from '@/components/ui/TicketGrid';
import SelectionSummary from '@/components/ui/SelectionSummary';
import { useTicketSelection } from '@/hooks/useTicketSelection';
import PopupWhatsApp from '@/components/ui/PopupWhatsApp';
import ProgressBar from '@/components/ui/ProgressBar';

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
    const total = tickets.length;
    const sold = tickets.filter(ticket => ticket.status === TicketStatus.SOLD).length;
    const reserved = tickets.filter(ticket => ticket.status === TicketStatus.RESERVED).length;
    const available = total - sold - reserved;
    
    // Aplicar filtrado según el estado seleccionado
    let filtered = [...tickets];
    if (filterStatus === 'available') {
      filtered = tickets.filter(ticket => ticket.status === TicketStatus.AVAILABLE);
    } else if (filterStatus === 'sold') {
      filtered = tickets.filter(ticket => ticket.status === TicketStatus.SOLD);
    }
    

    
    return { 
      filteredTickets: filtered, 
      ticketStats: { total, sold, reserved, available }
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
    <section id="tickets" className="py-12 md:py-16 bg-white relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
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
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="font-title text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)]"
        >
          Selecciona tus números
        </motion.h2>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-text text-center mb-4 max-w-3xl mx-auto"
        >
          <p className="mb-4">
            Elige los números que deseas comprar y aprovecha nuestras promociones. 
            Una vez seleccionados, podrás completar tu compra a través de WhatsApp.
          </p>
          
          {/* Barra de progreso */}
          <div className="max-w-xl mx-auto my-6 px-4">
            <ProgressBar total={ticketStats.total} sold={ticketStats.sold} />
          </div>
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
            <div className="bg-gray-900 p-6 md:p-8 rounded-lg shadow-lg h-full border border-yellow-500/30">
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-center mb-2 text-yellow-400"
              >
                Números Disponibles
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center text-gray-400 mb-8"
              >
                Haz clic en los números que deseas comprar
              </motion.p>
              
              {/* Controles y filtros */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                {/* Filtros */}
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => setFilterStatus('all')} className={`px-4 py-2 text-sm rounded-md transition-colors font-semibold ${filterStatus === 'all' ? 'bg-yellow-500 text-gray-900 shadow-md shadow-yellow-500/20' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>Todos</button>
                  <button onClick={() => setFilterStatus('available')} className={`px-4 py-2 text-sm rounded-md transition-colors font-semibold ${filterStatus === 'available' ? 'bg-yellow-500 text-gray-900 shadow-md shadow-yellow-500/20' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>Disponibles</button>
                  <button onClick={() => setFilterStatus('sold')} className={`px-4 py-2 text-sm rounded-md transition-colors font-semibold ${filterStatus === 'sold' ? 'bg-yellow-500 text-gray-900 shadow-md shadow-yellow-500/20' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>Vendidos</button>
                </div>

                {/* Búsqueda y botón de número al azar */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={searchNumber}
                    onChange={(e) => setSearchNumber(e.target.value)}
                    placeholder="Buscar..."
                    className="w-32 px-4 py-2 text-sm bg-gray-800 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 placeholder-gray-400"
                  />
                  <motion.button 
                    onClick={selectRandomTicket}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    animate={pulseAnimation}
                    className="px-4 py-2 text-sm bg-gray-800 text-yellow-400 border border-yellow-500/50 rounded-md hover:bg-gray-700 hover:border-yellow-500 transition-all duration-200 shadow-sm font-semibold"
                    title="Seleccionar un número al azar"
                  >
                    Al Azar
                  </motion.button>
                </div>
              </div>

              {/* Leyenda de colores y contador */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 items-center mb-4 text-sm text-gray-400">
                <span>{filteredTickets.length} tickets</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 bg-gray-800 border border-gray-700 rounded-sm"></span>
                  <span>Disponible</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 bg-yellow-500 rounded-sm"></span>
                  <span>Seleccionado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 bg-green-600 rounded-sm"></span>
                  <span>Vendido</span>
                </div>
                 <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 bg-red-600 rounded-sm"></span>
                  <span>Reservado</span>
                </div>
              </div>
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
