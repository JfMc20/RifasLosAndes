import React from 'react';

interface TicketPaginationProps {
  currentPage: number;
  totalPages: number;
  totalTickets: number;
  ticketsPerPage: number;
  indexOfFirstTicket: number;
  indexOfLastTicket: number;
  paginate: (pageNumber: number) => void;
  prevPage: () => void;
  nextPage: () => void;
}

const TicketPagination: React.FC<TicketPaginationProps> = ({
  currentPage,
  totalPages,
  totalTickets,
  ticketsPerPage,
  indexOfFirstTicket,
  indexOfLastTicket,
  paginate,
  prevPage,
  nextPage
}) => {
  // Mostrar siempre la paginación si hay más de una página
  if (totalPages <= 1) return null;
  
  return (
    <div className="pt-6 mt-6 border-t border-ui-border flex flex-col sm:flex-row items-center justify-between w-full">
      <div className="mb-4 sm:mb-0">
        <p className="text-sm text-ui-text-secondary">
          Mostrando{' '}
          <span className="font-bold text-ui-text-primary">{indexOfFirstTicket + 1}</span> a{' '}
          <span className="font-bold text-ui-text-primary">
            {Math.min(indexOfFirstTicket + ticketsPerPage, totalTickets)}
          </span>{' '}
          de <span className="font-bold text-ui-text-primary">{totalTickets}</span> boletos
        </p>
      </div>
      <nav className="inline-flex items-center space-x-1" aria-label="Paginación">
        {/* Botón Anterior */}
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className={`inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
            currentPage === 1
              ? 'bg-ui-background text-ui-text-secondary cursor-not-allowed'
              : 'bg-ui-surface text-ui-text-primary border border-ui-border hover:bg-ui-background'
          }`}
        >
          Anterior
        </button>

        {/* Números de página */}
        {[...Array(totalPages)].map((_, i) => {
          const pageNum = i + 1;
          return (
            <button
              key={pageNum}
              onClick={() => paginate(pageNum)}
              className={`inline-flex items-center justify-center w-10 h-10 text-sm font-semibold rounded-lg transition-colors duration-200 ${
                currentPage === pageNum
                  ? 'bg-brand-primary text-white border border-brand-primary shadow-md'
                  : 'bg-ui-surface text-ui-text-primary border border-ui-border hover:bg-ui-background'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Botón Siguiente */}
        <button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className={`inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
            currentPage === totalPages
              ? 'bg-ui-background text-ui-text-secondary cursor-not-allowed'
              : 'bg-ui-surface text-ui-text-primary border border-ui-border hover:bg-ui-background'
          }`}
        >
          Siguiente
        </button>
      </nav>
    </div>
  );
};

export default TicketPagination;
