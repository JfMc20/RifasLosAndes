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

const TicketGrid: React.FC<TicketGridProps> = ({ tickets, onSelectTicket, selectedTickets, highlightNumber = '', itemsPerPage = 30 }) => {
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
        className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5 p-1"
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
        <div className="flex justify-center items-center space-x-1 mt-6">
        {/* Botón de página anterior */}
        <button 
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-2.5 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm rounded-lg font-semibold transition-all duration-300 border-2 bg-gray-700/50 text-gray-300 border-yellow-500/70 hover:bg-yellow-400/20 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          &laquo;
        </button>

        {/* Lógica de paginación inteligente */}
        {
          (() => {
            const getPageNumbers = () => {
              const pageNumbers: (string | number)[] = [];
              const siblingCount = 1;
              const totalPageNumbers = siblingCount + 5;

              if (totalPages <= totalPageNumbers) {
                for (let i = 1; i <= totalPages; i++) {
                  pageNumbers.push(i);
                }
                return pageNumbers;
              }

              const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
              const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

              const shouldShowLeftDots = leftSiblingIndex > 2;
              const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

              if (!shouldShowLeftDots && shouldShowRightDots) {
                const leftItemCount = 3 + 2 * siblingCount;
                for (let i = 1; i <= leftItemCount; i++) {
                  pageNumbers.push(i);
                }
                pageNumbers.push('...');
                pageNumbers.push(totalPages);
              } else if (shouldShowLeftDots && !shouldShowRightDots) {
                const rightItemCount = 3 + 2 * siblingCount;
                pageNumbers.push(1);
                pageNumbers.push('...');
                for (let i = totalPages - rightItemCount + 1; i <= totalPages; i++) {
                  pageNumbers.push(i);
                }
              } else if (shouldShowLeftDots && shouldShowRightDots) {
                pageNumbers.push(1);
                pageNumbers.push('...');
                for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
                  pageNumbers.push(i);
                }
                pageNumbers.push('...');
                pageNumbers.push(totalPages);
              }
              return pageNumbers;
            };

            const pageItems = getPageNumbers();

            return pageItems.map((page, index) => {
              if (page === '...') {
                return <span key={`ellipsis-${index}`} className="w-auto px-2.5 py-1.5 text-xs sm:px-0 sm:w-10 sm:h-10 sm:text-sm flex items-center justify-center text-gray-500">...</span>;
              }
              
              return (
                <button
                  key={`page-${page}`}
                  onClick={() => handlePageChange(page as number)}
                  className={`px-2.5 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm rounded-lg font-semibold transition-all duration-300 border-2 ${
                    currentPage === page
                      ? 'bg-yellow-400 text-gray-900 border-yellow-400/90 shadow-lg scale-105'
                      : 'bg-gray-700/50 text-gray-300 border-yellow-500/70 hover:bg-yellow-400/20 hover:text-white'
                  }`}
                >
                  {page}
                </button>
              );
            });
          })()
        }

        {/* Botón de página siguiente */}
        <button 
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-2.5 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm rounded-lg font-semibold transition-all duration-300 border-2 bg-gray-700/50 text-gray-300 border-yellow-500/70 hover:bg-yellow-400/20 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          &raquo;
        </button>
      </div>
      )}
    </div>
  );
};

export default TicketGrid;
