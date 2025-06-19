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
    
    // Aplicar filtrado por número específico si hay una búsqueda
    if (searchNumber.trim()) {
      filtered = filtered.filter(ticket => ticket.number.includes(searchNumber.trim()));
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
            <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="font-title text-2xl md:text-3xl text-center mb-3 tracking-tight text-gray-900 leading-none"
              >
                Números disponibles
              </motion.h3>
              
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-gray-600 text-center max-w-2xl mx-auto mb-4"
              >
                Haz clic en los números que deseas comprar
              </motion.p>
              
              {/* Filtros y controles */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center">
                    <label htmlFor="filter" className="mr-2 text-sm font-medium text-gray-700 whitespace-nowrap">
                      Mostrar:
                    </label>
                    <select
                      id="filter"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white"
                    >
                      <option value="all">Todos</option>
                      <option value="available">Disponibles</option>
                      <option value="sold">Vendidos</option>
                    </select>
                  </div>
                  
                  {/* Búsqueda de número específico */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={searchNumber}
                      onChange={(e) => setSearchNumber(e.target.value)}
                      onKeyDown={(e) => {
                        // Buscar y navegar al ticket cuando se presiona Enter
                        if (e.key === 'Enter' && searchNumber.trim()) {
                          // Buscar el ticket en todos los tickets, no solo en los filtrados
                          const foundTicket = tickets.find(ticket => 
                            ticket.number.includes(searchNumber.trim())
                          );
                          
                          if (foundTicket) {
                            // Nos aseguramos que el modo de filtro permita mostrar este ticket
                            if ((filterStatus === 'available' && foundTicket.status !== TicketStatus.AVAILABLE) ||
                                (filterStatus === 'sold' && foundTicket.status !== TicketStatus.SOLD)) {
                              // Cambiar al modo "todos" para que se muestre el ticket
                              setFilterStatus('all');
                            }
                          }
                        }
                      }}
                      placeholder="Buscar número..."
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white w-28"
                      maxLength={3}
                    />
                    {searchNumber && (
                      <button 
                        onClick={() => setSearchNumber('')}
                        className="text-gray-500 hover:text-gray-700"
                        title="Limpiar búsqueda"
                      >
                        <span className="text-sm">×</span>
                      </button>
                    )}
                  </div>
                  
                  {/* Botón para número aleatorio con efecto zoom */}
                  <div className="flex-shrink-0">
                    <motion.button
                      animate={pulseAnimation}
                      onClick={() => {
                        // Selecciona un número aleatorio disponible
                        const availableTickets = tickets.filter(t => t.status === TicketStatus.AVAILABLE);
                        if (availableTickets.length > 0) {
                          const randomIndex = Math.floor(Math.random() * availableTickets.length);
                          const randomTicket = availableTickets[randomIndex];
                          
                          // Establece el filtro en "todos" si no está ya, para asegurarnos de que el ticket sea visible
                          if (filterStatus !== 'all') {
                            setFilterStatus('all');
                          }
                          
                          // Establece el número de búsqueda
                          setSearchNumber(randomTicket.number);
                        }
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center justify-center px-4 py-1.5 bg-yellow-500 text-white text-sm rounded-md border border-yellow-600 shadow-sm hover:shadow-md transition-all duration-300"
                      title="Seleccionar un número al azar"
                    >
                      Número al azar
                    </motion.button>
                  </div>
                </div>
                
                {/* Leyendas y contador de tickets */}
                <div className="flex flex-wrap gap-3 items-center">
                  <span className="text-sm text-gray-600 font-medium">
                    {filteredTickets.length} tickets
                  </span>

                  <motion.span 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.7 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center"
                  >
                    <span className="w-4 h-4 bg-white border border-gray-300 inline-block mr-1 rounded-sm"></span>
                    <span className="text-sm">Disponible ({ticketStats.available})</span>
                  </motion.span>
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.8 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center"
                  >
                    <span className="w-4 h-4 bg-yellow-500 inline-block mr-1 rounded-sm"></span>
                    <span className="text-sm">Seleccionado</span>
                  </motion.span>
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.9 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center"
                  >
                    <span className="w-4 h-4 bg-green-600 inline-block mr-1 rounded-sm"></span>
                    <span className="text-sm">Vendido ({ticketStats.sold})</span>
                  </motion.span>
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
