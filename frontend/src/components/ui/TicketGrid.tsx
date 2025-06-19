import React, { useState, useEffect } from 'react';
import TicketItem from './TicketItem';
import { Ticket, TicketStatus } from '@/types';
import { motion } from 'framer-motion';

interface TicketGridProps {
  tickets: Ticket[];
  onSelectTicket: (number: string) => void;
  selectedTickets: string[];
  highlightNumber?: string;
  itemsPerPage?: number;
}

const TicketGrid: React.FC<TicketGridProps> = ({ tickets, onSelectTicket, selectedTickets, highlightNumber = '', itemsPerPage = 50 }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedTickets, setPaginatedTickets] = useState<Ticket[]>([]);
  const totalPages = Math.ceil(tickets.length / itemsPerPage);

  useEffect(() => {
    // Cuando cambia el highlightNumber, buscar el ticket y cambiar a la página correspondiente
    if (highlightNumber && highlightNumber.trim() !== '') {
      const highlightIndex = tickets.findIndex(ticket => 
        ticket.number.includes(highlightNumber.trim())
      );
      
      if (highlightIndex >= 0) {
        // Calcular la página donde está el ticket
        const targetPage = Math.floor(highlightIndex / itemsPerPage) + 1;
        // Solo cambiar la página si es necesario
        if (targetPage !== currentPage) {
          setCurrentPage(targetPage);
          return; // La actualización de paginatedTickets ocurrirá en la siguiente iteración del efecto
        }
      }
    }
    
    // Paginar los tickets según la página actual
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedTickets(tickets.slice(startIndex, endIndex));
  }, [currentPage, tickets, itemsPerPage, highlightNumber]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Evitamos el desplazamiento automático al cambiar de página
    // para que la pantalla no se mueva
  };
  // Update ticket status based on selection state
  const getTicketStatus = (ticket: Ticket): Ticket['status'] => {
    if (selectedTickets.includes(ticket.number)) {
      return TicketStatus.SELECTED;
    }
    return ticket.status;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.01,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <div className="space-y-6">
      <motion.div 
        id="ticket-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 xl:grid-cols-12 gap-2 p-1"
      >
        {paginatedTickets.map((ticket) => (
          <motion.div 
            key={ticket.number} 
            id={`ticket-${ticket.number}`}
            variants={itemVariants}
            transition={{ duration: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={highlightNumber && ticket.number.includes(highlightNumber) ? 'ring-2 ring-yellow-500 rounded-md ring-offset-1' : ''}
          >
            <TicketItem
              number={ticket.number}
              status={getTicketStatus(ticket)}
              onSelect={onSelectTicket}
              highlight={highlightNumber && ticket.number.includes(highlightNumber)}
            />
          </motion.div>
        ))}
      </motion.div>
      
      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6 pb-2">
          <button 
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-800 text-yellow-500 rounded-md disabled:opacity-50 hover:bg-gray-700 transition-all duration-200 shadow-sm disabled:text-gray-500"
          >
            &laquo;
          </button>
          
          <div className="flex items-center">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Lógica para mostrar páginas cercanas a la actual cuando hay muchas páginas
              let pageToShow;
              if (totalPages <= 5) {
                pageToShow = i + 1;
              } else if (currentPage <= 3) {
                pageToShow = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageToShow = totalPages - 4 + i;
              } else {
                pageToShow = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageToShow}
                  onClick={() => handlePageChange(pageToShow)}
                  className={`mx-1 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${pageToShow === currentPage 
                    ? 'bg-yellow-500 text-gray-900 font-bold shadow-md shadow-yellow-500/20' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                >
                  {pageToShow}
                </button>
              );
            })}
            
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="mx-1 text-gray-400">...</span>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className="mx-1 w-8 h-8 rounded-full flex items-center justify-center bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all duration-200"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>
          
          <button 
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-800 text-yellow-500 rounded-md disabled:opacity-50 hover:bg-gray-700 transition-all duration-200 shadow-sm disabled:text-gray-500"
          >
            &raquo;
          </button>
        </div>
      )}
    </div>
  );
};

export default TicketGrid;
